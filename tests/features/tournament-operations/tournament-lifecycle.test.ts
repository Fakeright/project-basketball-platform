import { describe, expect, it, vi } from "vitest"

import {
  closeTournamentRegistration,
  publishTournament,
} from "@/features/tournament-operations/application/transition-tournament-lifecycle"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const admin = createTestActor("admin-1", "PLATFORM_ADMIN")

const approvedTournament: TournamentOperation = {
  id: "tournament-1",
  organizerId: organizer.id,
  title: "Bangkok Open",
  description: "Community tournament",
  rules: "Standard rules",
  provinceCode: "10",
  province: "กรุงเทพมหานคร",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE",
  ageGroup: "Open",
  startsAt: "2026-11-15T02:00:00.000Z",
  endsAt: "2026-11-16T11:00:00.000Z",
  registrationDeadline: "2026-11-01T16:59:00.000Z",
  capacity: 16,
  status: "APPROVED",
  governanceStatus: "ACTIVE",
  governanceReason: null,
  governanceUpdatedAt: null,
  version: 3,
  createdAt: "2026-07-26T01:00:00.000Z",
  updatedAt: "2026-07-26T02:00:00.000Z",
}

function createRepository(
  tournament: TournamentOperation = approvedTournament,
): TournamentOperationsRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(async () => tournament),
    findGovernanceContext: vi.fn(),
    findCompetitionLifecycleContext: vi.fn(),
    listByOrganizer: vi.fn(),
    listForAdmin: vi.fn(),
    listByStatus: vi.fn(),
    updateWithVersion: vi.fn(),
    reviewWithVersion: vi.fn(),
    transitionWithVersion: vi.fn(async (input) => ({
      ...tournament,
      status: input.status,
      version: input.version + 1,
    })),
    transitionCompetitionWithVersion: vi.fn(),
    governWithVersion: vi.fn(),
    permanentlyDeleteWithVersion: vi.fn(),
  }
}

describe("tournament public lifecycle", () => {
  it("publishes an approved owned tournament with optimistic versioning", async () => {
    const repository = createRepository()

    const published = await publishTournament(
      repository,
      { tournamentId: approvedTournament.id, version: 3 },
      organizer,
      { now: () => new Date("2026-10-01T00:00:00.000Z") },
    )

    expect(published.status).toBe("PUBLISHED")
    expect(repository.transitionWithVersion).toHaveBeenCalledWith({
      tournamentId: approvedTournament.id,
      version: 3,
      sourceStatus: "APPROVED",
      status: "PUBLISHED",
      actorId: organizer.id,
      action: "tournament.published",
      adminOverride: false,
    })
  })

  it("closes registration from the published state", async () => {
    const published = {
      ...approvedTournament,
      status: "PUBLISHED" as const,
      version: 4,
    }
    const repository = createRepository(published)

    const closed = await closeTournamentRegistration(
      repository,
      { tournamentId: published.id, version: 4 },
      organizer,
    )

    expect(closed.status).toBe("REGISTRATION_CLOSED")
  })

  it("distinguishes a platform-admin lifecycle override", async () => {
    const repository = createRepository()

    await publishTournament(
      repository,
      { tournamentId: approvedTournament.id, version: 3 },
      admin,
      { now: () => new Date("2026-10-01T00:00:00.000Z") },
    )

    expect(repository.transitionWithVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: admin.id,
        adminOverride: true,
      }),
    )
  })

  it("rejects a stale lifecycle command before persistence", async () => {
    const repository = createRepository()

    await expect(
      publishTournament(
        repository,
        { tournamentId: approvedTournament.id, version: 2 },
        organizer,
        { now: () => new Date("2026-10-01T00:00:00.000Z") },
      ),
    ).rejects.toThrow("CONFLICT")
    expect(repository.transitionWithVersion).not.toHaveBeenCalled()
  })

  it("blocks publishing a suspended tournament before persistence", async () => {
    const repository = createRepository({
      ...approvedTournament,
      governanceStatus: "SUSPENDED",
    })

    await expect(
      publishTournament(
        repository,
        { tournamentId: approvedTournament.id, version: 3 },
        organizer,
        { now: () => new Date("2026-10-01T00:00:00.000Z") },
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(repository.transitionWithVersion).not.toHaveBeenCalled()
  })

  it("blocks closing registration for a removed tournament before persistence", async () => {
    const removedTournament = {
      ...approvedTournament,
      status: "PUBLISHED" as const,
      governanceStatus: "REMOVED" as const,
      version: 4,
    }
    const repository = createRepository(removedTournament)

    await expect(
      closeTournamentRegistration(
        repository,
        { tournamentId: removedTournament.id, version: 4 },
        organizer,
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_REMOVED"] })
    expect(repository.transitionWithVersion).not.toHaveBeenCalled()
  })
})
