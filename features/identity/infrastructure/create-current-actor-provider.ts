/**
 * COURTSIDE: คำอธิบายไฟล์
 * เลือกตัวอ่านผู้ใช้ตามโหมด session โดยป้องกันการใช้บัญชีจำลองใน production
 * เรียกใช้จาก: features/identity/infrastructure/next-cookie-current-actor-provider.ts
 * ตามการทำงานต่อ: features/identity/infrastructure/cookie-current-actor-provider.ts, features/identity/infrastructure/supabase-current-actor-provider.ts
 */

import type { UserProfileRepository } from "@/features/identity/application/ports/user-profile-repository"
import type { CurrentActorProvider } from "@/features/identity/domain/actor"

import { CookieCurrentActorProvider } from "./cookie-current-actor-provider"
import {
  SupabaseCurrentActorProvider,
  type AuthenticatedUserReader,
} from "./supabase-current-actor-provider"

interface CurrentActorProviderOptions {
  environment: "development" | "test" | "production"
  authenticatedUserReader?: AuthenticatedUserReader
  userProfileRepository?: UserProfileRepository
  readDevelopmentActorCookie: () => Promise<string | undefined>
}

export function createCurrentActorProvider(
  options: CurrentActorProviderOptions,
): CurrentActorProvider {
  if (options.authenticatedUserReader) {
    if (!options.userProfileRepository) {
      throw new Error("USER_PROFILE_REPOSITORY_REQUIRED")
    }
    return new SupabaseCurrentActorProvider(
      options.authenticatedUserReader,
      options.userProfileRepository,
    )
  }

  return new CookieCurrentActorProvider(
    options.readDevelopmentActorCookie,
    options.environment === "development",
  )
}
