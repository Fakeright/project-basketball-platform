import { describe, expect, it, vi } from "vitest"

import {
  AuthCommandRejectedError,
  AuthDependencyUnavailableError,
  createAuthHandlers,
  getSafeRedirectPath,
  type AuthHandlerDependencies,
} from "@/features/identity/presentation/auth-handler"

function createDependencies(
  overrides: Partial<AuthHandlerDependencies> = {},
): AuthHandlerDependencies {
  return {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      sendPasswordReset: vi.fn(),
      updatePassword: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      getAuthenticatedUser: vi.fn(),
    },
    adminAuth: {
      deleteAuthUser: vi.fn(),
    },
    profileRepository: {
      findBySupabaseUserId: vi.fn(),
      create: vi.fn(),
    },
    recoveryGrant: {
      issueTransactionState: vi.fn(),
      verifyTransactionState: vi.fn(),
      matchesTransactionEmail: vi.fn(),
      issue: vi.fn(),
      consume: vi.fn(),
    },
    appUrl: new URL("https://courtside.example"),
    ...overrides,
  }
}

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validRegistration = {
  displayName: "เมย์",
  email: "manager@example.com",
  password: "secure-pass-123",
  passwordConfirmation: "secure-pass-123",
  role: "TEAM_MANAGER",
}

describe("auth handlers", () => {
  it("rejects Platform Admin before creating an Auth user", async () => {
    const dependencies = createDependencies()
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.register(
      jsonRequest("/api/auth/register", {
        ...validRegistration,
        role: "PLATFORM_ADMIN",
      }),
    )

    expect(response.status).toBe(422)
    expect(dependencies.auth.signUp).not.toHaveBeenCalled()
  })

  it("rejects malformed JSON without leaking parser details", async () => {
    const handlers = createAuthHandlers(createDependencies())
    const response = await handlers.login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
    )

    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({
      message: "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง",
    })
  })

  it("returns an actionable response when Supabase rejects the email address", async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.signUp).mockRejectedValue(
      new AuthCommandRejectedError("EMAIL_INVALID"),
    )
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.register(
      jsonRequest("/api/auth/register", validRegistration),
    )

    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({
      message: "อีเมลนี้ไม่สามารถใช้สมัครสมาชิกได้ กรุณาตรวจสอบอีกครั้ง",
    })
  })

  it("asks a new user to confirm email before signing in", async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.signUp).mockResolvedValue({
      user: { id: "auth-user-1", email: validRegistration.email },
      isNewUser: true,
      requiresEmailConfirmation: true,
    })
    vi.mocked(dependencies.profileRepository.findBySupabaseUserId)
      .mockResolvedValue(null)
    vi.mocked(dependencies.profileRepository.create).mockResolvedValue({
      id: "user-1",
      supabaseUserId: "auth-user-1",
      email: validRegistration.email,
      displayName: validRegistration.displayName,
      role: "TEAM_MANAGER",
    })

    const response = await createAuthHandlers(dependencies).register(
      jsonRequest("/api/auth/register", validRegistration),
    )

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      message:
        "สมัครสมาชิกแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ",
      redirectTo: "/login",
    })
  })

  it("returns a generic login error when the provider rejects credentials", async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.signInWithPassword).mockRejectedValue(
      new AuthCommandRejectedError(),
    )
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.login(
      jsonRequest("/api/auth/login", {
        email: "manager@example.com",
        password: "wrong-password",
      }),
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    })
  })

  it("reports a profile outage as an unexpected failure after login", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.signInWithPassword).mockResolvedValue({
      id: "auth-user-1",
      email: "manager@example.com",
    })
    vi.mocked(dependencies.profileRepository.findBySupabaseUserId)
      .mockRejectedValue(new Error("DATABASE_URL=secret"))
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.login(
      jsonRequest("/api/auth/login", {
        email: "manager@example.com",
        password: "secure-pass-123",
      }),
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      message: "ไม่สามารถเข้าสู่ระบบได้ในขณะนี้",
      correlationId: expect.any(String),
    })
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "DATABASE_URL",
    )
    consoleError.mockRestore()
  })

  it("does not disclose account existence during password recovery", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    const dependencies = createDependencies()
    vi.mocked(
      dependencies.recoveryGrant.issueTransactionState,
    ).mockResolvedValue("signed-recovery-state")
    vi.mocked(dependencies.auth.sendPasswordReset).mockRejectedValue(
      new AuthDependencyUnavailableError("provider detail"),
    )
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.forgotPassword(
      jsonRequest("/api/auth/forgot-password", {
        email: "missing@example.com",
      }),
    )

    expect(response.status).toBe(200)
    const responseBody = await response.json()
    expect(responseBody).toEqual({
      message:
        "หากมีบัญชีอยู่ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ทางอีเมล",
    })
    expect(dependencies.auth.sendPasswordReset).toHaveBeenCalledWith(
      "missing@example.com",
      "https://courtside.example/auth/callback?state=signed-recovery-state",
    )
    expect(JSON.stringify(responseBody)).not.toContain(
      "signed-recovery-state",
    )
    expect(consoleError).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "auth.forgot_password",
        correlationId: expect.any(String),
        errorType: "AuthDependencyUnavailableError",
      }),
    )
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "provider detail",
    )
    consoleError.mockRestore()
  })

  it("rejects a normal authenticated session without a recovery grant", async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.getAuthenticatedUser).mockResolvedValue({
      id: "auth-user-1",
      email: "manager@example.com",
    })
    vi.mocked(
      dependencies.profileRepository.findBySupabaseUserId,
    ).mockResolvedValue({
      id: "user-1",
      supabaseUserId: "auth-user-1",
      email: "manager@example.com",
      displayName: "Manager",
      role: "TEAM_MANAGER",
    })
    vi.mocked(dependencies.recoveryGrant.consume).mockResolvedValue(false)
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.resetPassword(
      jsonRequest("/api/auth/reset-password", {
        password: "new-secure-pass",
        passwordConfirmation: "new-secure-pass",
      }),
    )

    expect(response.status).toBe(401)
    expect(dependencies.auth.updatePassword).not.toHaveBeenCalled()
  })

  it("returns 503 with a correlation id for a reset provider outage", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.getAuthenticatedUser).mockResolvedValue({
      id: "auth-user-1",
      email: "manager@example.com",
    })
    vi.mocked(
      dependencies.profileRepository.findBySupabaseUserId,
    ).mockResolvedValue({
      id: "user-1",
      supabaseUserId: "auth-user-1",
      email: "manager@example.com",
      displayName: "Manager",
      role: "TEAM_MANAGER",
    })
    vi.mocked(dependencies.recoveryGrant.consume).mockResolvedValue(true)
    vi.mocked(dependencies.auth.updatePassword).mockRejectedValue(
      new AuthDependencyUnavailableError("provider detail"),
    )

    const response = await createAuthHandlers(
      dependencies,
    ).resetPassword(
      jsonRequest("/api/auth/reset-password", {
        password: "new-secure-pass",
        passwordConfirmation: "new-secure-pass",
      }),
    )

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      message: "ไม่สามารถตั้งรหัสผ่านใหม่ได้ในขณะนี้",
      correlationId: expect.any(String),
    })
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "provider detail",
    )
    consoleError.mockRestore()
  })

  it("accepts only a local relative redirect path", () => {
    expect(getSafeRedirectPath("/team?tab=active", "/")).toBe(
      "/team?tab=active",
    )
    expect(getSafeRedirectPath("https://evil.example", "/")).toBe("/")
    expect(getSafeRedirectPath("//evil.example/path", "/")).toBe("/")
    expect(getSafeRedirectPath("\\\\evil.example", "/")).toBe("/")
    expect(getSafeRedirectPath("javascript:alert(1)", "/")).toBe("/")
  })
})
