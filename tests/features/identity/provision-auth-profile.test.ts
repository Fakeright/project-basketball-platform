import { describe, expect, it } from "vitest"

import { provisionAuthProfile } from "@/features/identity/application/provision-auth-profile"
import type {
  CreateUserProfileInput,
  UserProfile,
  UserProfileRepository,
} from "@/features/identity/application/ports/user-profile-repository"

class InMemoryUserProfileRepository implements UserProfileRepository {
  readonly profiles = new Map<string, UserProfile>()
  createCalls = 0

  async findBySupabaseUserId(supabaseUserId: string) {
    return this.profiles.get(supabaseUserId) ?? null
  }

  async create(input: CreateUserProfileInput) {
    this.createCalls += 1
    const profile: UserProfile = {
      id: `user-${this.createCalls}`,
      ...input,
    }
    this.profiles.set(input.supabaseUserId, profile)
    return profile
  }
}

const input = {
  supabaseUserId: "auth-user-1",
  email: "manager@example.com",
  displayName: "May",
  role: "TEAM_MANAGER_COACH",
} as const

describe("provisionAuthProfile", () => {
  it("creates a Team Manager profile for a new Supabase user", async () => {
    const repository = new InMemoryUserProfileRepository()

    await expect(provisionAuthProfile(input, repository)).resolves.toMatchObject({
      supabaseUserId: "auth-user-1",
      role: "TEAM_MANAGER_COACH",
    })
  })

  it("returns the existing linked profile without creating a duplicate", async () => {
    const repository = new InMemoryUserProfileRepository()
    const existing = await repository.create(input)

    await expect(provisionAuthProfile(input, repository)).resolves.toEqual(existing)
    expect(repository.createCalls).toBe(1)
  })

  it("rejects a crafted Platform Admin registration", async () => {
    const repository = new InMemoryUserProfileRepository()

    await expect(
      provisionAuthProfile(
        { ...input, role: "PLATFORM_ADMIN" },
        repository,
      ),
    ).rejects.toThrow("ROLE_NOT_SELF_ASSIGNABLE")
    expect(repository.createCalls).toBe(0)
  })
})
