import { describe, expect, it, vi } from "vitest"

import {
  createAdminAuthService,
  createAuthCommandService,
} from "@/features/identity/infrastructure/get-auth-handlers"
import {
  AuthCommandRejectedError,
  AuthDependencyUnavailableError,
} from "@/features/identity/presentation/auth-handler"

function createSupabase(authOverrides: Record<string, unknown>) {
  return {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      getUser: vi.fn(),
      ...authOverrides,
    },
  }
}

describe("Supabase auth command service", () => {
  it("maps provider 4xx to a typed external rejection", async () => {
    const service = createAuthCommandService(
      createSupabase({
        signInWithPassword: vi.fn(async () => ({
          data: { user: null },
          error: { status: 400 },
        })),
      }),
    )

    await expect(
      service.signInWithPassword({
        email: "manager@example.com",
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(AuthCommandRejectedError)
  })

  it("preserves an invalid-email rejection reason from Supabase", async () => {
    const service = createAuthCommandService(
      createSupabase({
        signUp: vi.fn(async () => ({
          data: { user: null, session: null },
          error: { status: 400, code: "email_address_invalid" },
        })),
      }),
    )

    await expect(
      service.signUp({
        email: "invalid@example.com",
        password: "secure-pass",
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "AuthCommandRejectedError",
        reason: "EMAIL_INVALID",
      }),
    )
  })

  it("reports when a new registration requires email confirmation", async () => {
    const service = createAuthCommandService(
      createSupabase({
        signUp: vi.fn(async () => ({
          data: {
            user: {
              id: "auth-user-1",
              email: "manager@example.com",
              identities: [{ id: "identity-1" }],
            },
            session: null,
          },
          error: null,
        })),
      }),
    )

    await expect(
      service.signUp({
        email: "manager@example.com",
        password: "secure-pass",
      }),
    ).resolves.toMatchObject({
      isNewUser: true,
      requiresEmailConfirmation: true,
    })
  })

  it("maps provider 5xx and network failures to dependency unavailability", async () => {
    const provider5xx = createAuthCommandService(
      createSupabase({
        updateUser: vi.fn(async () => ({
          data: { user: null },
          error: { status: 503 },
        })),
      }),
    )
    const networkFailure = createAuthCommandService(
      createSupabase({
        getUser: vi.fn(async () => {
          throw new Error("fetch failed with secret")
        }),
      }),
    )

    await expect(provider5xx.updatePassword("new-secure-pass"))
      .rejects.toBeInstanceOf(AuthDependencyUnavailableError)
    await expect(networkFailure.getAuthenticatedUser())
      .rejects.toBeInstanceOf(AuthDependencyUnavailableError)
  })

  it("treats an unclassified provider error as unavailable rather than a credential rejection", async () => {
    const service = createAuthCommandService(
      createSupabase({
        signUp: vi.fn(async () => ({
          data: { user: null },
          error: { message: "opaque provider failure" },
        })),
      }),
    )

    await expect(
      service.signUp({
        email: "manager@example.com",
        password: "secure-pass",
      }),
    ).rejects.toBeInstanceOf(AuthDependencyUnavailableError)
  })

  it("maps transient admin deletion failure without leaking provider details", async () => {
    const adminClient = {
      auth: {
        admin: {
          deleteUser: vi.fn(async () => ({
            data: null,
            error: { status: 500, message: "service-role detail" },
          })),
        },
      },
    }

    await expect(
      createAdminAuthService(() => adminClient).deleteAuthUser(
        "auth-user-1",
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "AuthDependencyUnavailableError",
        message: "AUTH_DEPENDENCY_UNAVAILABLE",
      }),
    )
  })
})
