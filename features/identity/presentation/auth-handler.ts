import { randomUUID } from "node:crypto"

import { z } from "zod"

import {
  UserProfileConflictError,
  type UserProfileRepository,
} from "@/features/identity/application/ports/user-profile-repository"
import { provisionAuthProfile } from "@/features/identity/application/provision-auth-profile"
import {
  AuthCommandRejectedError,
  AuthDependencyUnavailableError,
} from "@/features/identity/application/auth-errors"
import type { Role } from "@/features/identity/domain/actor"
import type {
  RecoveryGrantService,
} from "@/features/identity/application/ports/auth-recovery-grant-repository"
import { parseJsonRequest } from "@/features/shared/presentation/safe-http"

const registerSchema = z
  .object({
    displayName: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(8).max(72),
    passwordConfirmation: z.string().min(8).max(72),
    role: z.enum([
      "PLAYER",
      "COACH",
      "TEAM_MANAGER",
      "TOURNAMENT_ORGANIZER",
    ]),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "PASSWORD_CONFIRMATION_MISMATCH",
  })

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(72),
  next: z.string().max(2_048).optional(),
})

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
})

const resetPasswordSchema = z
  .object({
    password: z.string().min(8).max(72),
    passwordConfirmation: z.string().min(8).max(72),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "PASSWORD_CONFIRMATION_MISMATCH",
  })

export interface AuthUser {
  id: string
  email: string
}

export {
  AuthCommandRejectedError,
  AuthDependencyUnavailableError,
} from "@/features/identity/application/auth-errors"

export interface AuthCommandService {
  signUp(input: {
    email: string
    password: string
  }): Promise<{
    user: AuthUser
    isNewUser: boolean
    requiresEmailConfirmation?: boolean
  }>
  signInWithPassword(input: {
    email: string
    password: string
  }): Promise<AuthUser>
  signOut(): Promise<void>
  sendPasswordReset(email: string, redirectTo: string): Promise<void>
  updatePassword(password: string): Promise<void>
  exchangeCodeForSession(code: string): Promise<AuthUser>
  getAuthenticatedUser(): Promise<AuthUser | null>
}

export interface AdminAuthService {
  deleteAuthUser(userId: string): Promise<void>
}

export interface AuthHandlerDependencies {
  auth: AuthCommandService
  adminAuth: AdminAuthService
  profileRepository: UserProfileRepository
  recoveryGrant: RecoveryGrantService
  appUrl: URL
}

export function createAuthHandlers(dependencies: AuthHandlerDependencies) {
  return {
    register: (request: Request) => register(request, dependencies),
    login: (request: Request) => login(request, dependencies),
    logout: () => logout(dependencies),
    forgotPassword: (request: Request) =>
      forgotPassword(request, dependencies),
    resetPassword: (request: Request) =>
      resetPassword(request, dependencies),
    callback: (request: Request) => callback(request, dependencies),
  }
}

async function register(
  request: Request,
  dependencies: AuthHandlerDependencies,
) {
  const body = await parseAndValidate(request, registerSchema)
  if (!body.success) {
    return validationResponse("ข้อมูลสมัครสมาชิกไม่ถูกต้อง")
  }

  let registration: Awaited<ReturnType<AuthCommandService["signUp"]>>
  try {
    registration = await dependencies.auth.signUp({
      email: body.data.email,
      password: body.data.password,
    })
  } catch (error) {
    if (error instanceof AuthCommandRejectedError) {
      return registrationRejectedResponse(error.reason)
    }
    return unexpectedAuthResponse(
      error,
      "auth.register.provider",
      "ไม่สามารถสมัครสมาชิกได้ในขณะนี้",
    )
  }

  try {
    if (registration.isNewUser) {
      await provisionAuthProfile(
        {
          supabaseUserId: registration.user.id,
          email: body.data.email,
          displayName: body.data.displayName,
          role: body.data.role,
        },
        dependencies.profileRepository,
      )
    } else {
      await dependencies.profileRepository.findBySupabaseUserId(
        registration.user.id,
      )
    }
  } catch (error) {
    if (registration.isNewUser) {
      const cleanupSucceeded =
        await compensateUnprovisionedRegistration(
          registration.user.id,
          dependencies,
        )
      if (!cleanupSucceeded) return registrationAcceptedResponse()
    }

    if (error instanceof UserProfileConflictError) {
      return registrationAcceptedResponse()
    }

    return unexpectedAuthResponse(
      error,
      "auth.register",
      "ไม่สามารถสมัครสมาชิกได้ในขณะนี้",
    )
  }

  try {
    await signOutAfterRegistration(dependencies)
  } catch (error) {
    return unexpectedAuthResponse(
      error,
      "auth.register.sign_out",
      "ไม่สามารถสมัครสมาชิกได้ในขณะนี้",
    )
  }
  return registrationCompletedResponse(
    Boolean(registration.requiresEmailConfirmation),
  )
}

async function login(
  request: Request,
  dependencies: AuthHandlerDependencies,
) {
  const body = await parseAndValidate(request, loginSchema)
  if (!body.success) {
    return validationResponse("ข้อมูลเข้าสู่ระบบไม่ถูกต้อง")
  }

  let authUser: AuthUser
  try {
    authUser = await dependencies.auth.signInWithPassword({
      email: body.data.email,
      password: body.data.password,
    })
  } catch (error) {
    if (!(error instanceof AuthCommandRejectedError)) {
      return unexpectedAuthResponse(
        error,
        "auth.login",
        "ไม่สามารถเข้าสู่ระบบได้ในขณะนี้",
      )
    }
    return Response.json(
      { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 },
    )
  }

  try {
    const profile =
      await dependencies.profileRepository.findBySupabaseUserId(authUser.id)

    if (!profile) {
      await dependencies.auth.signOut()
      return Response.json(
        { message: "บัญชีนี้ยังไม่พร้อมใช้งาน" },
        { status: 403 },
      )
    }

    return Response.json({
      message: "เข้าสู่ระบบสำเร็จ",
      redirectTo: getSafeRedirectPath(
        body.data.next,
        getDefaultPathForRole(profile.role),
      ),
    })
  } catch (error) {
    return unexpectedAuthResponse(
      error,
      "auth.login.profile",
      "ไม่สามารถเข้าสู่ระบบได้ในขณะนี้",
    )
  }
}

async function logout(dependencies: AuthHandlerDependencies) {
  try {
    await dependencies.auth.signOut()
    return Response.json({ message: "ออกจากระบบแล้ว" })
  } catch (error) {
    return unexpectedAuthResponse(
      error,
      "auth.logout",
      "ไม่สามารถออกจากระบบได้ในขณะนี้",
    )
  }
}

async function forgotPassword(
  request: Request,
  dependencies: AuthHandlerDependencies,
) {
  const body = await parseAndValidate(request, forgotPasswordSchema)
  if (!body.success) {
    return validationResponse("กรุณากรอกอีเมลให้ถูกต้อง")
  }

  try {
    const state =
      await dependencies.recoveryGrant.issueTransactionState(
        body.data.email,
      )
    const callbackUrl = new URL(
      "/auth/callback",
      dependencies.appUrl,
    )
    callbackUrl.searchParams.set("state", state)
    await dependencies.auth.sendPasswordReset(
      body.data.email,
      callbackUrl.toString(),
    )
  } catch (error) {
    // Account existence and provider failures intentionally share one response.
    if (error instanceof AuthDependencyUnavailableError) {
      reportUnexpectedError(error, "auth.forgot_password")
    }
  }

  return Response.json({
    message: "หากมีบัญชีอยู่ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ทางอีเมล",
  })
}

async function resetPassword(
  request: Request,
  dependencies: AuthHandlerDependencies,
) {
  const body = await parseAndValidate(request, resetPasswordSchema)
  if (!body.success) {
    return validationResponse("ข้อมูลรหัสผ่านใหม่ไม่ถูกต้อง")
  }

  try {
    const user = await dependencies.auth.getAuthenticatedUser()
    if (!user) {
      return Response.json(
        { message: "ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว" },
        { status: 401 },
      )
    }
    const profile =
      await dependencies.profileRepository.findBySupabaseUserId(
        user.id,
      )
    if (
      !profile ||
      !(await dependencies.recoveryGrant.consume(profile.id))
    ) {
      return Response.json(
        { message: "ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว" },
        { status: 401 },
      )
    }

    await dependencies.auth.updatePassword(body.data.password)
    return Response.json({
      message: "ตั้งรหัสผ่านใหม่สำเร็จ",
      redirectTo: "/login",
    })
  } catch (error) {
    if (error instanceof AuthDependencyUnavailableError) {
      return unexpectedAuthResponse(
        error,
        "auth.reset_password",
        "ไม่สามารถตั้งรหัสผ่านใหม่ได้ในขณะนี้",
      )
    }
    return Response.json(
      { message: "ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว" },
      { status: 401 },
    )
  }
}

async function callback(
  request: Request,
  dependencies: AuthHandlerDependencies,
) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const loginFailureUrl = new URL(
    "/login?error=auth_callback",
    dependencies.appUrl,
  )

  if (!code || !state) {
    return Response.redirect(loginFailureUrl, 307)
  }

  try {
    const transaction =
      await dependencies.recoveryGrant.verifyTransactionState(state)
    if (!transaction) {
      return Response.redirect(loginFailureUrl, 307)
    }

    const user = await dependencies.auth.exchangeCodeForSession(code)
    if (
      !dependencies.recoveryGrant.matchesTransactionEmail(
        transaction,
        user.email,
      )
    ) {
      await dependencies.auth.signOut()
      return Response.redirect(loginFailureUrl, 307)
    }
    const profile =
      await dependencies.profileRepository.findBySupabaseUserId(
        user.id,
      )
    if (!profile) {
      await dependencies.auth.signOut()
      return Response.redirect(loginFailureUrl, 307)
    }
    await dependencies.recoveryGrant.issue(profile.id)
    return Response.redirect(
      new URL("/reset-password", dependencies.appUrl),
      307,
    )
  } catch (error) {
    if (error instanceof AuthDependencyUnavailableError) {
      return unexpectedAuthResponse(
        error,
        "auth.callback",
        "ไม่สามารถยืนยันลิงก์ได้ในขณะนี้",
      )
    }
    return Response.redirect(loginFailureUrl, 307)
  }
}

function registrationAcceptedResponse() {
  return Response.json(
    {
      message: "หากสมัครได้สำเร็จ กรุณาเข้าสู่ระบบ",
      redirectTo: "/login",
    },
    { status: 201 },
  )
}

function registrationCompletedResponse(
  requiresEmailConfirmation: boolean,
) {
  return Response.json(
    {
      message: requiresEmailConfirmation
        ? "สมัครสมาชิกแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ"
        : "สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ",
      redirectTo: "/login",
    },
    { status: 201 },
  )
}

function registrationRejectedResponse(
  reason: AuthCommandRejectedError["reason"],
) {
  if (reason === "GENERIC") return registrationAcceptedResponse()

  const responses = {
    EMAIL_INVALID: {
      message: "อีเมลนี้ไม่สามารถใช้สมัครสมาชิกได้ กรุณาตรวจสอบอีกครั้ง",
      status: 422,
    },
    PASSWORD_WEAK: {
      message:
        "รหัสผ่านยังไม่ปลอดภัยเพียงพอ กรุณาเพิ่มตัวอักษร ตัวเลข หรือสัญลักษณ์",
      status: 422,
    },
    RATE_LIMITED: {
      message: "ส่งคำขอสมัครสมาชิกบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่",
      status: 429,
    },
    SIGNUP_UNAVAILABLE: {
      message: "ระบบสมัครสมาชิกยังไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง",
      status: 503,
    },
  } as const
  const response = responses[reason]
  return Response.json(
    { message: response.message },
    { status: response.status },
  )
}

async function signOutAfterRegistration(
  dependencies: AuthHandlerDependencies,
) {
  try {
    await dependencies.auth.signOut()
  } catch (error) {
    throw error instanceof AuthCommandRejectedError
      ? new AuthDependencyUnavailableError()
      : error
  }
}

async function compensateUnprovisionedRegistration(
  userId: string,
  dependencies: AuthHandlerDependencies,
) {
  try {
    await dependencies.auth.signOut()
  } catch (error) {
    reportUnexpectedError(error, "auth.register.compensate.sign_out")
  }

  try {
    await dependencies.adminAuth.deleteAuthUser(userId)
    return true
  } catch (error) {
    if (!(error instanceof AuthDependencyUnavailableError)) {
      reportUnexpectedError(error, "auth.register.compensate.delete")
      return false
    }
  }

  try {
    await dependencies.adminAuth.deleteAuthUser(userId)
    return true
  } catch (error) {
    reportUnexpectedError(error, "auth.register.compensate.delete")
    return false
  }
}

async function parseAndValidate<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<
  | { success: true; data: z.output<T> }
  | { success: false }
> {
  const parsedRequest = await parseJsonRequest(request)
  if (!parsedRequest.ok) return { success: false }

  const parsedBody = schema.safeParse(parsedRequest.value)
  return parsedBody.success
    ? { success: true, data: parsedBody.data }
    : { success: false }
}

function validationResponse(message: string) {
  return Response.json({ message }, { status: 422 })
}

export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback: string,
) {
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(candidate)
  ) {
    return fallback
  }

  try {
    const parsed = new URL(candidate, "http://courtside.local")
    return parsed.origin === "http://courtside.local"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback
  } catch {
    return fallback
  }
}

function getDefaultPathForRole(role: Role) {
  const destinations: Record<Role, string> = {
    PLATFORM_ADMIN: "/admin",
    TOURNAMENT_ORGANIZER: "/organizer",
    TEAM_MANAGER: "/team",
    COACH: "/tournaments",
    PLAYER: "/tournaments",
  }
  return destinations[role]
}

function unexpectedAuthResponse(
  error: unknown,
  operation: string,
  message: string,
) {
  const correlationId = reportUnexpectedError(error, operation)
  return Response.json(
    { message, correlationId },
    {
      status:
        error instanceof AuthDependencyUnavailableError ? 503 : 500,
    },
  )
}

function reportUnexpectedError(error: unknown, operation: string) {
  const correlationId = randomUUID()
  console.error({
    operation,
    correlationId,
    errorType: error instanceof Error ? error.name : "NonError",
  })
  return correlationId
}
