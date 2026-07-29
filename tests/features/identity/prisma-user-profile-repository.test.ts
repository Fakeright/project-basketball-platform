import { describe, expect, it, vi } from "vitest"

import { UserProfileConflictError } from "@/features/identity/application/ports/user-profile-repository"
import { PrismaUserProfileRepository } from "@/features/identity/infrastructure/prisma-user-profile-repository"

const databaseUser = {
  id: "user-1",
  supabaseUserId: "auth-user-1",
  email: "manager@example.com",
  displayName: "May",
  role: "TEAM_MANAGER",
}

describe("PrismaUserProfileRepository", () => {
  it("finds and maps a profile by Supabase user id", async () => {
    const findUnique = vi.fn().mockResolvedValue(databaseUser)
    const repository = new PrismaUserProfileRepository({
      user: { findUnique, create: vi.fn() },
    })

    await expect(
      repository.findBySupabaseUserId("auth-user-1"),
    ).resolves.toEqual(databaseUser)
    expect(findUnique).toHaveBeenCalledWith({
      where: { supabaseUserId: "auth-user-1" },
      select: {
        id: true,
        supabaseUserId: true,
        email: true,
        displayName: true,
        role: true,
      },
    })
  })

  it("creates and maps a linked user profile", async () => {
    const create = vi.fn().mockResolvedValue(databaseUser)
    const repository = new PrismaUserProfileRepository({
      user: { findUnique: vi.fn(), create },
    })

    await expect(
      repository.create({
        supabaseUserId: "auth-user-1",
        email: "manager@example.com",
        displayName: "May",
        role: "TEAM_MANAGER",
      }),
    ).resolves.toEqual(databaseUser)
    expect(create).toHaveBeenCalledWith({
      data: {
        supabaseUserId: "auth-user-1",
        email: "manager@example.com",
        displayName: "May",
        role: "TEAM_MANAGER",
      },
      select: {
        id: true,
        supabaseUserId: true,
        email: true,
        displayName: true,
        role: true,
      },
    })
  })

  it("returns the concurrently created profile after a Supabase id race", async () => {
    const create = vi.fn().mockRejectedValue({
      code: "P2002",
      meta: { target: "User_supabaseUserId_key" },
    })
    const findUnique = vi.fn().mockResolvedValue(databaseUser)
    const repository = new PrismaUserProfileRepository({
      user: { findUnique, create },
    })

    await expect(
      repository.create({
        supabaseUserId: "auth-user-1",
        email: "manager@example.com",
        displayName: "May",
        role: "TEAM_MANAGER",
      }),
    ).resolves.toEqual(databaseUser)
    expect(findUnique).toHaveBeenCalledWith({
      where: { supabaseUserId: "auth-user-1" },
      select: {
        id: true,
        supabaseUserId: true,
        email: true,
        displayName: true,
        role: true,
      },
    })
  })

  it("returns the same-account concurrent profile when Prisma reports the email target", async () => {
    const create = vi.fn().mockRejectedValue({
      code: "P2002",
      meta: { target: ["email"] },
    })
    const findUnique = vi.fn().mockResolvedValue(databaseUser)
    const repository = new PrismaUserProfileRepository({
      user: { findUnique, create },
    })

    await expect(
      repository.create({
        supabaseUserId: "auth-user-1",
        email: "manager@example.com",
        displayName: "May",
        role: "TEAM_MANAGER",
      }),
    ).resolves.toEqual(databaseUser)
    expect(findUnique).toHaveBeenCalledWith({
      where: { supabaseUserId: "auth-user-1" },
      select: {
        id: true,
        supabaseUserId: true,
        email: true,
        displayName: true,
        role: true,
      },
    })
  })

  it("maps an existing email to a stable conflict without linking it", async () => {
    const create = vi.fn().mockRejectedValue({
      code: "P2002",
      meta: { target: "User_email_key" },
    })
    const findUnique = vi.fn()
    const repository = new PrismaUserProfileRepository({
      user: { findUnique, create },
    })

    const result = repository.create({
      supabaseUserId: "auth-user-2",
      email: "manager@example.com",
      displayName: "Another Manager",
      role: "TEAM_MANAGER",
    })

    await expect(result).rejects.toEqual(
      new UserProfileConflictError("EMAIL_ALREADY_REGISTERED"),
    )
    expect(findUnique).toHaveBeenCalledWith({
      where: { supabaseUserId: "auth-user-2" },
      select: {
        id: true,
        supabaseUserId: true,
        email: true,
        displayName: true,
        role: true,
      },
    })
  })
})
