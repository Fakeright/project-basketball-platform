import { describe, expect, it, vi } from "vitest"

import type { TournamentCompetitionLifecycleContext } from "@/features/competition/domain/competition"
import {
  completeTournamentCompetition,
  startTournamentCompetition,
} from "@/features/tournament-operations/application/transition-tournament-competition"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"
import type { TournamentCompetitionOperationContext } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const otherOrganizer = createTestActor("organizer-2", "TOURNAMENT_ORGANIZER")
const admin = createTestActor("admin-1", "PLATFORM_ADMIN")
const now = () => new Date("2026-08-20T10:00:00.000Z")

const tournament: TournamentOperation = {
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
  capacity: 4,
  status: "REGISTRATION_CLOSED",
  governanceStatus: "ACTIVE",
  governanceReason: null,
  governanceUpdatedAt: null,
  version: 4,
  createdAt: "2026-07-26T01:00:00.000Z",
  updatedAt: "2026-07-26T02:00:00.000Z",
}

const closedContext: TournamentCompetitionLifecycleContext = {
  tournamentId: tournament.id,
  organizerId: organizer.id,
  status: "REGISTRATION_CLOSED",
  tournamentGovernanceStatus: "ACTIVE",
  version: 4,
  activeBracket: {
    id: "bracket-1",
    status: "PUBLISHED",
    entriesLockedAt: "2026-08-20T09:00:00.000Z",
    entryCount: 4,
    matches: [
      {
        id: "final",
        purpose: "CHAMPIONSHIP",
        status: "SCHEDULED",
        homeTeamId: "team-1",
        awayTeamId: "team-2",
        winnerTeamId: null,
        resultConfirmed: false,
      },
    ],
  },
}

function createRepository(
  context: TournamentCompetitionOperationContext | null = closedContext,
) {
  const findCompetitionLifecycleContext = vi.fn(async () => context)
  const transitionCompetitionWithVersion = vi.fn(async (input) => ({
    ...tournament,
    status: input.status,
    version: input.version + 1,
  }))
  const repository = {
    create: vi.fn(),
    findById: vi.fn(async () => tournament),
    findCompetitionLifecycleContext,
    listByOrganizer: vi.fn(),
    listForAdmin: vi.fn(),
    listByStatus: vi.fn(),
    updateWithVersion: vi.fn(),
    reviewWithVersion: vi.fn(),
    transitionWithVersion: vi.fn(),
    transitionCompetitionWithVersion,
  } as unknown as TournamentOperationsRepository

  return {
    repository,
    findCompetitionLifecycleContext,
    transitionCompetitionWithVersion,
  }
}

describe("tournament competition lifecycle", () => {
  it("starts an owned ready tournament with optimistic versioning", async () => {
    const { repository, transitionCompetitionWithVersion } = createRepository()

    const started = await startTournamentCompetition(
      repository,
      { tournamentId: tournament.id, version: 4 },
      organizer,
      { now },
    )

    expect(started.status).toBe("IN_PROGRESS")
    expect(transitionCompetitionWithVersion).toHaveBeenCalledWith({
      tournamentId: tournament.id,
      version: 4,
      sourceStatus: "REGISTRATION_CLOSED",
      status: "IN_PROGRESS",
      actorId: organizer.id,
      action: "tournament.started",
      adminOverride: false,
      reason: null,
      at: "2026-08-20T10:00:00.000Z",
    })
  })

  it("completes an in-progress tournament after all results are confirmed", async () => {
    const completeContext: TournamentCompetitionOperationContext = {
      ...closedContext,
      status: "IN_PROGRESS",
      version: 5,
      activeBracket: {
        ...closedContext.activeBracket!,
        matches: closedContext.activeBracket!.matches.map((match) => ({
          ...match,
          status: "COMPLETED",
          winnerTeamId: "team-1",
          resultConfirmed: true,
        })),
      },
    }
    const { repository, transitionCompetitionWithVersion } =
      createRepository(completeContext)

    await completeTournamentCompetition(
      repository,
      { tournamentId: tournament.id, version: 5 },
      organizer,
      { now },
    )

    expect(transitionCompetitionWithVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceStatus: "IN_PROGRESS",
        status: "COMPLETED",
        action: "tournament.completed",
      }),
    )
  })

  it("hides another organizer's tournament", async () => {
    const { repository, transitionCompetitionWithVersion } = createRepository()

    await expect(
      startTournamentCompetition(
        repository,
        { tournamentId: tournament.id, version: 4 },
        otherOrganizer,
        { now },
      ),
    ).rejects.toThrow("NOT_FOUND")
    expect(transitionCompetitionWithVersion).not.toHaveBeenCalled()
  })

  it("requires a reason when an admin operates another organizer's tournament", async () => {
    const { repository, transitionCompetitionWithVersion } = createRepository()

    await expect(
      startTournamentCompetition(
        repository,
        { tournamentId: tournament.id, version: 4 },
        admin,
        { now },
      ),
    ).rejects.toThrow("REASON_REQUIRED")
    expect(transitionCompetitionWithVersion).not.toHaveBeenCalled()
  })

  it("records a trimmed reason for an admin override", async () => {
    const { repository, transitionCompetitionWithVersion } = createRepository()

    await startTournamentCompetition(
      repository,
      {
        tournamentId: tournament.id,
        version: 4,
        reason: "  เริ่มรายการแทนผู้จัดตามคำขอ  ",
      },
      admin,
      { now },
    )

    expect(transitionCompetitionWithVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: admin.id,
        adminOverride: true,
        reason: "เริ่มรายการแทนผู้จัดตามคำขอ",
      }),
    )
  })

  it("rejects a stale command before persistence", async () => {
    const { repository, transitionCompetitionWithVersion } = createRepository()

    await expect(
      startTournamentCompetition(
        repository,
        { tournamentId: tournament.id, version: 3 },
        organizer,
        { now },
      ),
    ).rejects.toThrow("CONFLICT")
    expect(transitionCompetitionWithVersion).not.toHaveBeenCalled()
  })

  it("returns structured policy issues before persistence", async () => {
    const { repository, transitionCompetitionWithVersion } = createRepository({
      ...closedContext,
      activeBracket: null,
    })

    await expect(
      startTournamentCompetition(
        repository,
        { tournamentId: tournament.id, version: 4 },
        organizer,
        { now },
      ),
    ).rejects.toMatchObject({
      issues: expect.arrayContaining(["BRACKET_MISSING"]),
    })
    expect(transitionCompetitionWithVersion).not.toHaveBeenCalled()
  })

  it("blocks starting a suspended tournament before persistence", async () => {
    const { repository, transitionCompetitionWithVersion } = createRepository({
      ...closedContext,
      tournamentGovernanceStatus: "SUSPENDED",
    })

    await expect(
      startTournamentCompetition(
        repository,
        { tournamentId: tournament.id, version: 4 },
        organizer,
        { now },
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(transitionCompetitionWithVersion).not.toHaveBeenCalled()
  })

  it("blocks completing a removed tournament before persistence", async () => {
    const { repository, transitionCompetitionWithVersion } = createRepository({
      ...closedContext,
      status: "IN_PROGRESS",
      tournamentGovernanceStatus: "REMOVED",
      version: 5,
      activeBracket: {
        ...closedContext.activeBracket!,
        matches: closedContext.activeBracket!.matches.map((match) => ({
          ...match,
          status: "COMPLETED",
          winnerTeamId: "team-1",
          resultConfirmed: true,
        })),
      },
    })

    await expect(
      completeTournamentCompetition(
        repository,
        { tournamentId: tournament.id, version: 5 },
        organizer,
        { now },
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_REMOVED"] })
    expect(transitionCompetitionWithVersion).not.toHaveBeenCalled()
  })
})
