import { describe, expect, it } from "vitest"

import type { UserProfileRepository } from "@/features/identity/application/ports/user-profile-repository"
import {
  SupabaseCurrentActorProvider,
  type AuthenticatedUserReader,
} from "@/features/identity/infrastructure/supabase-current-actor-provider"

const profile = {
  id: "user-1",
  supabaseUserId: "auth-user-1",
  role: "TEAM_MANAGER",
  email: "manager@example.com",
  displayName: "May",
} as const

function createRepository(
  linkedProfile: typeof profile | null,
): UserProfileRepository {
  return {
    async findBySupabaseUserId() {
      return linkedProfile
    },
    async create() {
      throw new Error("NOT_USED")
    },
  }
}

function createReader(
  authenticatedUserId: string | null,
): AuthenticatedUserReader {
  return {
    async getAuthenticatedUser() {
      return authenticatedUserId ? { id: authenticatedUserId } : null
    },
  }
}

describe("SupabaseCurrentActorProvider", () => {
  it("maps an authenticated user and linked profile to the current actor", async () => {
    const provider = new SupabaseCurrentActorProvider(
      createReader("auth-user-1"),
      createRepository(profile),
    )

    await expect(provider.getCurrentActor()).resolves.toEqual({
      id: "user-1",
      role: "TEAM_MANAGER",
      email: "manager@example.com",
      displayName: "May",
    })
  })

  it("returns null when no authenticated user exists", async () => {
    const provider = new SupabaseCurrentActorProvider(
      createReader(null),
      createRepository(profile),
    )

    await expect(provider.getCurrentActor()).resolves.toBeNull()
  })

  it("propagates authenticated reader infrastructure failures", async () => {
    const provider = new SupabaseCurrentActorProvider(
      {
        async getAuthenticatedUser() {
          throw new Error("AUTH_SERVICE_UNAVAILABLE")
        },
      },
      createRepository(profile),
    )

    await expect(provider.getCurrentActor()).rejects.toThrow(
      "AUTH_SERVICE_UNAVAILABLE",
    )
  })

  it("returns null when the authenticated user has no linked profile", async () => {
    const provider = new SupabaseCurrentActorProvider(
      createReader("auth-user-1"),
      createRepository(null),
    )

    await expect(provider.getCurrentActor()).resolves.toBeNull()
  })
})
