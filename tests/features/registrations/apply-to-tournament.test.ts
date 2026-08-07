import { describe, expect, it, vi } from "vitest"

import { applyToTournament } from "@/features/registrations/application/apply-to-tournament"
import type { RegistrationRepository } from "@/features/registrations/application/ports/registration-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const teamManager = createTestActor("manager-1", "TEAM_MANAGER_COACH")
const platformAdmin = createTestActor("admin-1", "PLATFORM_ADMIN")
const team = {
  id: "team-1",
  name: "Bangkok Ballers",
  provinceCode: "10",
  province: "กรุงเทพมหานคร",
  ownerId: teamManager.id,
  format: "FIVE_V_FIVE" as const,
  isActive: true,
  deactivatedAt: null,
  version: 0,
}

const context = {
  team,
  roster: Array.from({ length: 5 }, (_, index) => ({
    id: `player-${index}`,
    teamId: team.id,
    firstName: "Player",
    lastName: String(index + 1),
    nickname: null,
    birthDate: "2008-01-01",
    jerseyNumber: index + 1,
    position: null,
    phone: null,
    isActive: true,
    deactivatedAt: null,
    createdAt: "2026-08-07T00:00:00.000Z",
    updatedAt: "2026-08-07T00:00:00.000Z",
  })),
  tournament: {
    id: "tournament-1",
    format: "FIVE_V_FIVE" as const,
    ageGroup: "Open" as const,
    startsAt: "2026-11-15T02:00:00.000Z",
    status: "PUBLISHED" as const,
    registrationDeadline: "2026-11-01T00:00:00.000Z",
    capacity: 8,
    approvedCount: 7,
  },
}

function createRepository(overrides: Partial<RegistrationRepository> = {}): RegistrationRepository {
  const repository: RegistrationRepository = {
    getApplicationContext: vi.fn(async () => context),
    findActive: vi.fn(async () => null),
    createPending: vi.fn(async () => ({
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
    })),
    findById: vi.fn(async () => null),
    cancelWithVersion: vi.fn(),
    findReviewContext: vi.fn(),
    approveWithCapacity: vi.fn(),
    rejectWithVersion: vi.fn(),
    withdrawWithVersion: vi.fn(),
    findTeam: vi.fn(async () => team),
    listByTeam: vi.fn(async () => []),
    findTournamentForReview: vi.fn(),
    listByTournament: vi.fn(async () => []),
    inTransaction: vi.fn(async (operation) => operation(repository)),
    ...overrides,
  }
  return repository
}

describe("applyToTournament", () => {
  it("rejects an inactive team", async () => {
    const repository = createRepository({
      getApplicationContext: vi.fn(async () => ({
        ...context,
        team: { ...team, isActive: false },
      })),
    })

    await expect(
      applyToTournament(
        { tournamentId: "tournament-1", teamId: "team-1" },
        teamManager,
        { registrations: repository, now: () => new Date("2026-10-01T00:00:00Z") },
      ),
    ).rejects.toThrow("TEAM_INACTIVE")
    expect(repository.createPending).not.toHaveBeenCalled()
  })

  it("rejects a team whose format does not match the tournament", async () => {
    const repository = createRepository({
      getApplicationContext: vi.fn(async () => ({
        ...context,
        tournament: { ...context.tournament, format: "THREE_V_THREE" },
      })),
    })

    await expect(
      applyToTournament(
        { tournamentId: "tournament-1", teamId: "team-1" },
        teamManager,
        { registrations: repository, now: () => new Date("2026-10-01T00:00:00Z") },
      ),
    ).rejects.toThrow("TEAM_FORMAT_MISMATCH")
    expect(repository.createPending).not.toHaveBeenCalled()
  })

  it("rejects an application after the registration deadline", async () => {
    const repository = createRepository()

    await expect(
      applyToTournament(
        { tournamentId: "tournament-1", teamId: "team-1" },
        teamManager,
        { registrations: repository, now: () => new Date("2026-11-02T00:00:00Z") },
      ),
    ).rejects.toThrow("REGISTRATION_DEADLINE_PASSED")
  })

  it("rejects a duplicate active application before creating it", async () => {
    const repository = createRepository({
      findActive: vi.fn(async () => ({
        id: "registration-existing",
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
      })),
    })

    await expect(
      applyToTournament(
        { tournamentId: "tournament-1", teamId: "team-1" },
        teamManager,
        { registrations: repository, now: () => new Date("2026-10-01T00:00:00Z") },
      ),
    ).rejects.toThrow("REGISTRATION_ALREADY_ACTIVE")
  })

  it("rejects a pending application when the approved field is full", async () => {
    const repository = createRepository({
      getApplicationContext: vi.fn(async () => ({
        ...context,
        tournament: {
          ...context.tournament,
          approvedCount: context.tournament.capacity,
        },
      })),
    })

    await expect(
      applyToTournament(
        { tournamentId: "tournament-1", teamId: "team-1" },
        teamManager,
        {
          registrations: repository,
          now: () => new Date("2026-10-01T00:00:00Z"),
        },
      ),
    ).rejects.toThrow("TOURNAMENT_CAPACITY_REACHED")
    expect(repository.createPending).not.toHaveBeenCalled()
  })

  it("creates the pending attempt within a repository transaction", async () => {
    const repository = createRepository()

    await applyToTournament(
      { tournamentId: "tournament-1", teamId: "team-1" },
      teamManager,
      { registrations: repository, now: () => new Date("2026-10-01T00:00:00Z") },
    )

    expect(repository.inTransaction).toHaveBeenCalledOnce()
    expect(repository.createPending).toHaveBeenCalledWith({
      tournamentId: "tournament-1",
      teamId: "team-1",
      actorId: teamManager.id,
      adminOverride: false,
    })
  })

  it("allows a platform admin to apply on behalf of an owned team", async () => {
    const repository = createRepository()

    await expect(
      applyToTournament(
        { tournamentId: "tournament-1", teamId: "team-1" },
        platformAdmin,
        { registrations: repository, now: () => new Date("2026-10-01T00:00:00Z") },
      ),
    ).resolves.toMatchObject({ status: "PENDING" })
    expect(repository.createPending).toHaveBeenCalledWith(
      expect.objectContaining({ adminOverride: true }),
    )
  })
})
