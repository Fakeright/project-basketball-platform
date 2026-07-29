import { describe, expect, it } from "vitest"

import type { UserProfileRepository } from "@/features/identity/application/ports/user-profile-repository"
import { createCurrentActorProvider } from "@/features/identity/infrastructure/create-current-actor-provider"
import {
  createSupabaseAuthenticatedUserReader,
  isDevelopmentCookieSessionMode,
  resolveIdentitySessionMode,
} from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { AuthDependencyUnavailableError } from "@/features/identity/presentation/auth-handler"

const profile = {
  id: "user-1",
  supabaseUserId: "auth-user-1",
  role: "TEAM_MANAGER",
  email: "manager@example.com",
  displayName: "May",
} as const

const repository: UserProfileRepository = {
  async findBySupabaseUserId() {
    return profile
  },
  async create() {
    throw new Error("NOT_USED")
  },
}

describe("createCurrentActorProvider", () => {
  it("allows missing Supabase configuration only for development fallback", () => {
    expect(resolveIdentitySessionMode("development", false)).toBe(
      "DEVELOPMENT_COOKIE",
    )
    expect(() =>
      resolveIdentitySessionMode("production", false),
    ).toThrow("SUPABASE_PUBLIC_CONFIGURATION_MISSING")
    expect(() => resolveIdentitySessionMode("test", false)).toThrow(
      "SUPABASE_PUBLIC_CONFIGURATION_MISSING",
    )
  })

  it("enables development cookie controls only in development without Supabase", () => {
    expect(isDevelopmentCookieSessionMode("development", false)).toBe(true)
    expect(isDevelopmentCookieSessionMode("development", true)).toBe(false)
    expect(isDevelopmentCookieSessionMode("test", false)).toBe(false)
    expect(isDevelopmentCookieSessionMode("production", false)).toBe(false)
  })

  it("maps current-session provider outage to typed dependency unavailability", async () => {
    const reader = createSupabaseAuthenticatedUserReader(async () => ({
      auth: {
        getUser: async () => ({
          data: { user: null },
          error: {
            status: 503,
            message: "provider secret detail",
          },
        }),
      },
    }))

    await expect(
      reader.getAuthenticatedUser(),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "AuthDependencyUnavailableError",
        message: "AUTH_DEPENDENCY_UNAVAILABLE",
      }),
    )
    await expect(
      createSupabaseAuthenticatedUserReader(async () => ({
        auth: {
          getUser: async () => {
            throw new Error("network secret detail")
          },
        },
      })).getAuthenticatedUser(),
    ).rejects.toBeInstanceOf(AuthDependencyUnavailableError)
  })

  it("treats a thrown Supabase session-missing error as anonymous", async () => {
    const reader = createSupabaseAuthenticatedUserReader(async () => ({
      auth: {
        getUser: async () => {
          const error = new Error("Auth session missing!")
          error.name = "AuthSessionMissingError"
          throw error
        },
      },
    }))

    await expect(reader.getAuthenticatedUser()).resolves.toBeNull()
  })
  it("uses the authenticated reader when one is injected", async () => {
    const provider = createCurrentActorProvider({
      environment: "production",
      authenticatedUserReader: {
        async getAuthenticatedUser() {
          return { id: "auth-user-1" }
        },
      },
      userProfileRepository: repository,
      readDevelopmentActorCookie: async () => "admin-1",
    })

    await expect(provider.getCurrentActor()).resolves.toEqual({
      id: "user-1",
      role: "TEAM_MANAGER",
      email: "manager@example.com",
      displayName: "May",
    })
  })

  it("does not fall back to a development cookie when Supabase mode is active", async () => {
    const provider = createCurrentActorProvider({
      environment: "development",
      authenticatedUserReader: {
        async getAuthenticatedUser() {
          return null
        },
      },
      userProfileRepository: repository,
      readDevelopmentActorCookie: async () => "team-manager-1",
    })

    await expect(provider.getCurrentActor()).resolves.toBeNull()
  })

  it("uses the explicit development cookie only in local development", async () => {
    const provider = createCurrentActorProvider({
      environment: "development",
      readDevelopmentActorCookie: async () => "team-manager-1",
    })

    await expect(provider.getCurrentActor()).resolves.toMatchObject({
      id: "team-manager-1",
      role: "TEAM_MANAGER",
    })
  })

  it("fails closed in production when no authenticated reader is wired", async () => {
    const provider = createCurrentActorProvider({
      environment: "production",
      readDevelopmentActorCookie: async () => "admin-1",
    })

    await expect(provider.getCurrentActor()).resolves.toBeNull()
  })
})
