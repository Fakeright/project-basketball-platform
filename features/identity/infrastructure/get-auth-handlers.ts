import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

import {
  createAuthHandlers,
} from "@/features/identity/presentation/auth-handler"
import {
  AuthCommandRejectedError,
  AuthDependencyUnavailableError,
} from "@/features/identity/application/auth-errors"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createRouteHandlerSupabaseContext } from "@/lib/supabase/server"
import {
  getApplicationUrl,
  getRecoverySecret,
} from "@/lib/supabase/config"

import { getUserProfileRepository } from "./get-user-profile-repository"
import { HmacRecoveryGrantService } from "./hmac-recovery-grant-service"
import { PrismaAuthRecoveryGrantRepository } from "./prisma-auth-recovery-grant-repository"
import { getPrismaClient } from "@/lib/server/prisma"

export async function getAuthHandlers() {
  return (await getAuthRouteContext()).handlers
}

export async function getAuthRouteContext() {
  const supabaseContext =
    await createRouteHandlerSupabaseContext()
  const supabase = supabaseContext.client
  const cookieStore = await cookies()
  const appUrl = getApplicationUrl()
  const recoverySecret = getRecoverySecret()

  return {
    handlers: createAuthHandlers({
      auth: createAuthCommandService(supabase),
      adminAuth: createAdminAuthService(createAdminSupabaseClient),
      profileRepository: getUserProfileRepository(),
      recoveryGrant: new HmacRecoveryGrantService({
        secret: recoverySecret,
        cookieStore,
        secure: appUrl.protocol === "https:",
        repository: new PrismaAuthRecoveryGrantRepository(
          getPrismaClient(),
        ),
      }),
      appUrl,
    }),
    finalizeResponse: supabaseContext.finalizeResponse,
  }
}

export function createAuthCommandService(supabase: SupabaseClient) {
  return {
    async signUp(input: { email: string; password: string }) {
      const { data, error } = await callProvider(() =>
        supabase.auth.signUp(input),
      )
      if (error) throw mapAuthError(error)
      if (!data.user || !data.user.email) {
        throw new Error("AUTH_SIGN_UP_FAILED")
      }

      return {
        user: { id: data.user.id, email: data.user.email },
        isNewUser: (data.user.identities?.length ?? 0) > 0,
        requiresEmailConfirmation: data.session === null,
      }
    },
    async signInWithPassword(input: { email: string; password: string }) {
      const { data, error } = await callProvider(() =>
        supabase.auth.signInWithPassword(input),
      )
      if (error) throw mapAuthError(error)
      if (!data.user.email) {
        throw new Error("AUTH_SIGN_IN_FAILED")
      }
      return { id: data.user.id, email: data.user.email }
    },
    async signOut() {
      const { error } = await callProvider(() => supabase.auth.signOut())
      if (error) throw mapAuthError(error)
    },
    async sendPasswordReset(email: string, redirectTo: string) {
      const { error } = await callProvider(() =>
        supabase.auth.resetPasswordForEmail(email, { redirectTo }),
      )
      if (error) throw mapAuthError(error)
    },
    async updatePassword(password: string) {
      const { error } = await callProvider(() =>
        supabase.auth.updateUser({ password }),
      )
      if (error) throw mapAuthError(error)
    },
    async exchangeCodeForSession(code: string) {
      const { data, error } = await callProvider(() =>
        supabase.auth.exchangeCodeForSession(code),
      )
      if (error) throw mapAuthError(error)
      if (!data.user?.email) {
        throw new Error("AUTH_CODE_EXCHANGE_FAILED")
      }
      return { id: data.user.id, email: data.user.email }
    },
    async getAuthenticatedUser() {
      const { data, error } = await callProvider(() =>
        supabase.auth.getUser(),
      )
      if (error) throw mapAuthError(error)
      return data.user?.email
        ? { id: data.user.id, email: data.user.email }
        : null
    },
  }
}

export function createAdminAuthService(
  createClient: typeof createAdminSupabaseClient,
) {
  return {
    async deleteAuthUser(userId: string) {
      const { error } = await callProvider(() =>
        createClient().auth.admin.deleteUser(userId),
      )
      if (error) throw mapAuthError(error)
    },
  }
}

async function callProvider<T>(execute: () => Promise<T>) {
  try {
    return await execute()
  } catch {
    throw new AuthDependencyUnavailableError()
  }
}

function mapAuthError(error: {
  status?: number
  code?: string
  error_code?: string
}) {
  return typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
    ? new AuthCommandRejectedError(
        mapAuthRejectionReason(error.code ?? error.error_code),
      )
    : new AuthDependencyUnavailableError()
}

function mapAuthRejectionReason(
  code: string | undefined,
): AuthCommandRejectedError["reason"] {
  if (
    code === "email_address_invalid" ||
    code === "email_address_not_authorized"
  ) {
    return "EMAIL_INVALID"
  }
  if (code === "weak_password") return "PASSWORD_WEAK"
  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit"
  ) {
    return "RATE_LIMITED"
  }
  if (
    code === "signup_disabled" ||
    code === "email_provider_disabled"
  ) {
    return "SIGNUP_UNAVAILABLE"
  }
  return "GENERIC"
}
