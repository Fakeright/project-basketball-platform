import { describe, expect, it } from "vitest"

import type { UserProfileRepository } from "@/features/identity/application/ports/user-profile-repository"
import { createCurrentActorProvider } from "@/features/identity/infrastructure/create-current-actor-provider"

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
