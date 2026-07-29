import { describe, expect, it, vi } from "vitest"

import { cancelRegistration } from "@/features/registrations/application/cancel-registration"
import type { RegistrationRepository } from "@/features/registrations/application/ports/registration-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const owner = createTestActor("manager-1", "TEAM_MANAGER")
const anotherManager = createTestActor("manager-2", "TEAM_MANAGER")
const platformAdmin = createTestActor("admin-1", "PLATFORM_ADMIN")

function createRepository(ownerId = owner.id): RegistrationRepository {
  const repository: RegistrationRepository = {
    getApplicationContext: vi.fn(),
    findActive: vi.fn(),
    createPending: vi.fn(),
    findById: vi.fn(async () => ({
      id: "registration-1",
      tournamentId: "tournament-1",
      teamId: "team-1",
      status: "PENDING" as const,
      decisionNote: null,
      decidedAt: null,
      cancelledAt: null,
      withdrawnAt: null,
      version: 0,
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
      team: { id: "team-1", name: "Ballers", province: "Bangkok", ownerId },
    })),
    cancelWithVersion: vi.fn(async () => ({
      id: "registration-1",
      tournamentId: "tournament-1",
      teamId: "team-1",
      status: "CANCELLED" as const,
      decisionNote: null,
      decidedAt: null,
      cancelledAt: "2026-10-02T00:00:00.000Z",
      withdrawnAt: null,
      version: 1,
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-02T00:00:00.000Z",
    })),
    findReviewContext: vi.fn(),
    approveWithCapacity: vi.fn(),
    rejectWithVersion: vi.fn(),
    withdrawWithVersion: vi.fn(),
    findTeam: vi.fn(async () => ({ id: "team-1", name: "Ballers", province: "Bangkok", ownerId })),
    listByTeam: vi.fn(async () => []),
    findTournamentForReview: vi.fn(),
    listByTournament: vi.fn(async () => []),
    inTransaction: vi.fn(async (operation) => operation(repository)),
  }
  return repository
}

describe("cancelRegistration", () => {
  it("hides another manager's pending application", async () => {
    await expect(
      cancelRegistration(
        { registrationId: "registration-1", version: 0 },
        anotherManager,
        { registrations: createRepository(), now: () => new Date("2026-10-02T00:00:00Z") },
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("cancels a pending application with the submitted version", async () => {
    const repository = createRepository()

    await cancelRegistration(
      { registrationId: "registration-1", version: 0 },
      owner,
      { registrations: repository, now: () => new Date("2026-10-02T00:00:00Z") },
    )

    expect(repository.cancelWithVersion).toHaveBeenCalledWith(
      "registration-1",
      0,
      owner.id,
      "2026-10-02T00:00:00.000Z",
      false,
    )
  })

  it("marks a platform-admin cancellation as an audited override", async () => {
    const repository = createRepository()

    await cancelRegistration(
      { registrationId: "registration-1", version: 0 },
      platformAdmin,
      {
        registrations: repository,
        now: () => new Date("2026-10-02T00:00:00Z"),
      },
    )

    expect(repository.cancelWithVersion).toHaveBeenCalledWith(
      "registration-1",
      0,
      platformAdmin.id,
      "2026-10-02T00:00:00.000Z",
      true,
    )
  })
})
