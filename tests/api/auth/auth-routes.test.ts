import { describe, expect, it, vi } from "vitest"

import {
  createAuthHandlers,
  AuthCommandRejectedError,
  AuthDependencyUnavailableError,
  type AuthHandlerDependencies,
} from "@/features/identity/presentation/auth-handler"

function createDependencies(): AuthHandlerDependencies {
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
  }
}

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

const registration = {
  displayName: "May Manager",
  email: "manager@example.com",
  password: "secure-pass-123",
  passwordConfirmation: "secure-pass-123",
  role: "TEAM_MANAGER",
}

describe("auth route behavior", () => {
  it("registers an allowed role, signs out, and returns the generic login response", async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.signUp).mockResolvedValue({
      user: { id: "auth-user-1", email: registration.email },
      isNewUser: true,
    })
    vi.mocked(dependencies.profileRepository.findBySupabaseUserId)
      .mockResolvedValueOnce(null)
    vi.mocked(dependencies.profileRepository.create).mockResolvedValue({
      id: "user-1",
      supabaseUserId: "auth-user-1",
      email: registration.email,
      displayName: registration.displayName,
      role: "TEAM_MANAGER",
    })
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.register(
      jsonRequest("/api/auth/register", registration),
    )

    expect(response.status).toBe(201)
    expect(dependencies.profileRepository.create).toHaveBeenCalledWith({
      supabaseUserId: "auth-user-1",
      email: registration.email,
      displayName: registration.displayName,
      role: "TEAM_MANAGER",
    })
    expect(await response.json()).toEqual({
      message: "หากสมัครได้สำเร็จ กรุณาเข้าสู่ระบบ",
      redirectTo: "/login",
    })
    expect(dependencies.auth.signOut).toHaveBeenCalledOnce()
  })

  it("signs out before retrying transient Auth deletion during compensation", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.signUp).mockResolvedValue({
      user: { id: "auth-user-1", email: registration.email },
      isNewUser: true,
    })
    vi.mocked(dependencies.profileRepository.findBySupabaseUserId)
      .mockResolvedValue(null)
    vi.mocked(dependencies.profileRepository.create).mockRejectedValue(
      new Error("DATABASE_UNAVAILABLE"),
    )
    vi.mocked(dependencies.adminAuth.deleteAuthUser)
      .mockRejectedValueOnce(new AuthDependencyUnavailableError())
      .mockResolvedValueOnce()
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.register(
      jsonRequest("/api/auth/register", registration),
    )

    expect(response.status).toBe(500)
    expect(dependencies.adminAuth.deleteAuthUser).toHaveBeenCalledTimes(2)
    expect(dependencies.adminAuth.deleteAuthUser).toHaveBeenCalledWith(
      "auth-user-1",
    )
    expect(dependencies.auth.signOut).toHaveBeenCalledOnce()
    expect(
      vi.mocked(dependencies.auth.signOut).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(dependencies.adminAuth.deleteAuthUser).mock
        .invocationCallOrder[0],
    )
    expect(await response.json()).toEqual({
      message: "ไม่สามารถสมัครสมาชิกได้ในขณะนี้",
      correlationId: expect.any(String),
    })
    expect(consoleError).toHaveBeenCalledWith({
      operation: "auth.register",
      correlationId: expect.any(String),
      errorType: "Error",
    })
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "DATABASE_UNAVAILABLE",
    )
    consoleError.mockRestore()
  })

  it("returns the same response for an existing-email rejection", async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.signUp).mockRejectedValue(
      new AuthCommandRejectedError(),
    )
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.register(
      jsonRequest("/api/auth/register", registration),
    )

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      message: "หากสมัครได้สำเร็จ กรุณาเข้าสู่ระบบ",
      redirectTo: "/login",
    })
    expect(dependencies.profileRepository.create).not.toHaveBeenCalled()
    expect(dependencies.adminAuth.deleteAuthUser).not.toHaveBeenCalled()
  })

  it("does not delete an Auth user after its profile was created when sign-out fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.signUp).mockResolvedValue({
      user: { id: "auth-user-1", email: registration.email },
      isNewUser: true,
    })
    vi.mocked(dependencies.profileRepository.findBySupabaseUserId)
      .mockResolvedValue(null)
    vi.mocked(dependencies.profileRepository.create).mockResolvedValue({
      id: "user-1",
      supabaseUserId: "auth-user-1",
      email: registration.email,
      displayName: registration.displayName,
      role: "TEAM_MANAGER",
    })
    vi.mocked(dependencies.auth.signOut).mockRejectedValue(
      new AuthDependencyUnavailableError(),
    )

    const response = await createAuthHandlers(
      dependencies,
    ).register(jsonRequest("/api/auth/register", registration))

    expect(response.status).toBe(503)
    expect(dependencies.adminAuth.deleteAuthUser).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("safe-logs a compensating deletion that still fails after one retry", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.signUp).mockResolvedValue({
      user: { id: "auth-user-1", email: registration.email },
      isNewUser: true,
    })
    vi.mocked(dependencies.profileRepository.findBySupabaseUserId)
      .mockResolvedValue(null)
    vi.mocked(dependencies.profileRepository.create).mockRejectedValue(
      new Error("DATABASE_UNAVAILABLE"),
    )
    vi.mocked(dependencies.adminAuth.deleteAuthUser).mockRejectedValue(
      new AuthDependencyUnavailableError("provider secret"),
    )

    const response = await createAuthHandlers(dependencies).register(
      jsonRequest("/api/auth/register", registration),
    )

    expect(dependencies.adminAuth.deleteAuthUser).toHaveBeenCalledTimes(2)
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      message: "หากสมัครได้สำเร็จ กรุณาเข้าสู่ระบบ",
      redirectTo: "/login",
    })
    expect(consoleError).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "auth.register.compensate.delete",
        correlationId: expect.any(String),
        errorType: "AuthDependencyUnavailableError",
      }),
    )
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "provider secret",
    )
    consoleError.mockRestore()
  })

  it("routes a signed-in Team Manager using the authoritative profile role", async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.signInWithPassword).mockResolvedValue({
      id: "auth-user-1",
      email: registration.email,
    })
    vi.mocked(dependencies.profileRepository.findBySupabaseUserId)
      .mockResolvedValue({
        id: "user-1",
        supabaseUserId: "auth-user-1",
        email: registration.email,
        displayName: registration.displayName,
        role: "TEAM_MANAGER",
      })
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.login(
      jsonRequest("/api/auth/login", {
        email: registration.email,
        password: registration.password,
        next: "https://evil.example",
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      message: "เข้าสู่ระบบสำเร็จ",
      redirectTo: "/team",
    })
  })

  it("signs out the current server session", async () => {
    const dependencies = createDependencies()
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.logout()

    expect(dependencies.auth.signOut).toHaveBeenCalledOnce()
    expect(response.status).toBe(200)
  })

  it("updates a recovery-session password after confirmation validation", async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.auth.getAuthenticatedUser).mockResolvedValue({
      id: "auth-user-1",
      email: registration.email,
    })
    vi.mocked(
      dependencies.profileRepository.findBySupabaseUserId,
    ).mockResolvedValue({
      id: "user-1",
      supabaseUserId: "auth-user-1",
      email: registration.email,
      displayName: registration.displayName,
      role: "TEAM_MANAGER",
    })
    vi.mocked(dependencies.recoveryGrant.consume).mockResolvedValue(true)
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.resetPassword(
      jsonRequest("/api/auth/reset-password", {
        password: "new-secure-pass",
        passwordConfirmation: "new-secure-pass",
      }),
    )

    expect(dependencies.auth.updatePassword).toHaveBeenCalledWith(
      "new-secure-pass",
    )
    expect(dependencies.recoveryGrant.consume).toHaveBeenCalledWith(
      "user-1",
    )
    expect(response.status).toBe(200)
  })

  it("accepts a callback only when signed state matches the exchanged email", async () => {
    const dependencies = createDependencies()
    const transaction = { emailHash: "email-hash" }
    vi.mocked(
      dependencies.recoveryGrant.verifyTransactionState,
    ).mockResolvedValue(transaction)
    vi.mocked(
      dependencies.recoveryGrant.matchesTransactionEmail,
    ).mockReturnValue(true)
    vi.mocked(dependencies.auth.exchangeCodeForSession).mockResolvedValue({
      id: "auth-user-1",
      email: registration.email,
    })
    vi.mocked(
      dependencies.profileRepository.findBySupabaseUserId,
    ).mockResolvedValue({
      id: "user-1",
      supabaseUserId: "auth-user-1",
      email: registration.email,
      displayName: registration.displayName,
      role: "TEAM_MANAGER",
    })
    const handlers = createAuthHandlers(dependencies)

    const response = await handlers.callback(
      new Request(
        "http://attacker.example/auth/callback?code=auth-code&state=signed-state&next=//evil.example",
      ),
    )

    expect(dependencies.auth.exchangeCodeForSession).toHaveBeenCalledWith(
      "auth-code",
    )
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe(
      "https://courtside.example/reset-password",
    )
    expect(dependencies.recoveryGrant.issue).toHaveBeenCalledWith(
      "user-1",
    )
  })

  it("rejects a callback with missing or forged state before code exchange", async () => {
    const dependencies = createDependencies()
    vi.mocked(
      dependencies.recoveryGrant.verifyTransactionState,
    ).mockResolvedValue(null)
    const handlers = createAuthHandlers(dependencies)

    const missingStateResponse = await handlers.callback(
      new Request("http://localhost/auth/callback?code=auth-code"),
    )
    const forgedStateResponse = await handlers.callback(
      new Request(
        "http://localhost/auth/callback?code=auth-code&state=forged",
      ),
    )

    expect(missingStateResponse.status).toBe(307)
    expect(forgedStateResponse.status).toBe(307)
    expect(forgedStateResponse.headers.get("location")).toBe(
      "https://courtside.example/login?error=auth_callback",
    )
    expect(dependencies.auth.exchangeCodeForSession).not.toHaveBeenCalled()
  })

  it("rejects valid state when the exchanged account email differs", async () => {
    const dependencies = createDependencies()
    vi.mocked(
      dependencies.recoveryGrant.verifyTransactionState,
    ).mockResolvedValue({ emailHash: "email-hash" })
    vi.mocked(
      dependencies.auth.exchangeCodeForSession,
    ).mockResolvedValue({
      id: "auth-user-2",
      email: "other@example.com",
    })
    vi.mocked(
      dependencies.recoveryGrant.matchesTransactionEmail,
    ).mockReturnValue(false)

    const response = await createAuthHandlers(
      dependencies,
    ).callback(
      new Request(
        "http://localhost/auth/callback?code=auth-code&state=signed-state",
      ),
    )

    expect(response.status).toBe(307)
    expect(dependencies.recoveryGrant.issue).not.toHaveBeenCalled()
    expect(response.headers.get("location")).toBe(
      "https://courtside.example/login?error=auth_callback",
    )
  })
})

describe("Next.js auth Route Handlers", () => {
  it("dispatches every HTTP entry point to the server-composed handler", async () => {
    vi.resetModules()
    const handlers = {
      register: vi.fn(async () => new Response(null, { status: 201 })),
      login: vi.fn(async () => new Response(null, { status: 200 })),
      logout: vi.fn(async () => new Response(null, { status: 200 })),
      forgotPassword: vi.fn(
        async () => new Response(null, { status: 200 }),
      ),
      resetPassword: vi.fn(async () => new Response(null, { status: 200 })),
      callback: vi.fn(async () => Response.redirect("http://localhost/", 307)),
    }
    const finalizeResponse = vi.fn((response: Response) => response)
    vi.doMock(
      "@/features/identity/infrastructure/get-auth-handlers",
      () => ({
        getAuthRouteContext: vi.fn(async () => ({
          handlers,
          finalizeResponse,
        })),
      }),
    )

    const [
      registerRoute,
      loginRoute,
      logoutRoute,
      forgotPasswordRoute,
      resetPasswordRoute,
      callbackRoute,
    ] = await Promise.all([
      import("@/app/api/auth/register/route"),
      import("@/app/api/auth/login/route"),
      import("@/app/api/auth/logout/route"),
      import("@/app/api/auth/forgot-password/route"),
      import("@/app/api/auth/reset-password/route"),
      import("@/app/auth/callback/route"),
    ])

    const request = jsonRequest("/api/auth/register", {})
    await registerRoute.POST(request.clone())
    await loginRoute.POST(request.clone())
    await logoutRoute.POST()
    await forgotPasswordRoute.POST(request.clone())
    await resetPasswordRoute.POST(request.clone())
    await callbackRoute.GET(
      new Request("http://localhost/auth/callback?code=test"),
    )

    expect(handlers.register).toHaveBeenCalledOnce()
    expect(handlers.login).toHaveBeenCalledOnce()
    expect(handlers.logout).toHaveBeenCalledOnce()
    expect(handlers.forgotPassword).toHaveBeenCalledOnce()
    expect(handlers.resetPassword).toHaveBeenCalledOnce()
    expect(handlers.callback).toHaveBeenCalledOnce()
    expect(finalizeResponse).toHaveBeenCalledTimes(6)
    vi.doUnmock(
      "@/features/identity/infrastructure/get-auth-handlers",
    )
  })
})
