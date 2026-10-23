/**
 * COURTSIDE: คำอธิบายไฟล์
 * เชื่อม cookie ของ Next.js เข้ากับตัวอ่าน session จริงหรือโหมดพัฒนาตาม configuration
 * เรียกใช้จาก: app/(admin)/admin/page.tsx, app/(admin)/admin/reviews/[id]/page.tsx
 * ตามการทำงานต่อ: features/identity/infrastructure/create-current-actor-provider.ts, features/identity/infrastructure/get-user-profile-repository.ts, features/identity/application/auth-errors.ts
 */

import "server-only"

import { cookies } from "next/headers"

import { createServerComponentSupabaseClient } from "@/lib/supabase/server"

import { createCurrentActorProvider } from "./create-current-actor-provider"
import { getUserProfileRepository } from "./get-user-profile-repository"
import type { AuthenticatedUserReader } from "./supabase-current-actor-provider"
import { AuthDependencyUnavailableError } from "@/features/identity/application/auth-errors"

// อ่าน configuration และ cookie ของ Next.js แล้วสร้าง provider สำหรับ session ที่เปิดใช้อยู่
export function createNextCookieCurrentActorProvider(
  authenticatedUserReader?: AuthenticatedUserReader,
) {
  const sessionMode = authenticatedUserReader
    ? "SUPABASE"
    : resolveIdentitySessionMode(
        process.env.NODE_ENV,
        hasSupabasePublicConfiguration(),
      )
  const sessionReader =
    authenticatedUserReader ??
    (sessionMode === "SUPABASE"
      ? createSupabaseAuthenticatedUserReader()
      : undefined)

  return createCurrentActorProvider({
    environment: process.env.NODE_ENV,
    authenticatedUserReader: sessionReader,
    userProfileRepository: sessionReader
      ? getUserProfileRepository()
      : undefined,
    readDevelopmentActorCookie: async () => {
      const cookieStore = await cookies()
      return cookieStore.get("courtside-actor")?.value
    },
  })
}

// เลือกโหมด session จาก environment และป้องกันการใช้โหมดจำลองใน production
export function resolveIdentitySessionMode(
  environment: "development" | "test" | "production",
  hasSupabaseConfiguration: boolean,
) {
  if (
    isDevelopmentCookieSessionMode(environment, hasSupabaseConfiguration)
  ) {
    return "DEVELOPMENT_COOKIE" as const
  }
  if (hasSupabaseConfiguration) return "SUPABASE" as const
  throw new AuthDependencyUnavailableError(
    "SUPABASE_PUBLIC_CONFIGURATION_MISSING",
  )
}

export function isDevelopmentCookieSessionMode(
  environment: "development" | "test" | "production" = process.env.NODE_ENV,
  hasSupabaseConfiguration: boolean = hasSupabasePublicConfiguration(),
) {
  return environment === "development" && !hasSupabaseConfiguration
}

function hasSupabasePublicConfiguration() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
}

interface CurrentActorSupabaseClient {
  auth: {
    getUser(): Promise<{
      data: { user: { id: string } | null }
      error: { status?: number; name?: string } | null
    }>
  }
}

// สร้างตัวอ่านผู้ใช้จาก Supabase เพื่อให้ provider ไม่ผูกกับรายละเอียด cookie ของ Next.js
export function createSupabaseAuthenticatedUserReader(
  createClient: () => Promise<CurrentActorSupabaseClient> =
    createServerComponentSupabaseClient,
): AuthenticatedUserReader {
  return {
    async getAuthenticatedUser() {
      const supabase = await createClient()
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          if (
            error.name === "AuthSessionMissingError" ||
            error.status === 400 ||
            error.status === 401 ||
            error.status === 403
          ) {
            return null
          }
          throw new AuthDependencyUnavailableError()
        }

        return data.user ? { id: data.user.id } : null
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AuthSessionMissingError"
        ) {
          return null
        }
        if (error instanceof AuthDependencyUnavailableError) {
          throw error
        }
        throw new AuthDependencyUnavailableError()
      }
    },
  }
}
