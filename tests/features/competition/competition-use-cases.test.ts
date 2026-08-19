import { describe, expect, it, vi } from "vitest"

import { lockBracketEntries } from "@/features/competition/application/lock-bracket-entries"
import { generateBracketDraft } from "@/features/competition/application/generate-bracket"
import { getOrganizerCompetition } from "@/features/competition/application/get-organizer-competition"
import {
  publishBracket,
  unpublishBracket,
} from "@/features/competition/application/publish-bracket"
import { scheduleMatch } from "@/features/competition/application/schedule-match"
import type { CompetitionRepository } from "@/features/competition/application/ports/competition-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")

function createRepository(
  context: Awaited<ReturnType<CompetitionRepository["findLockContext"]>>,
): CompetitionRepository {
  const transaction = {
    findLockContext: vi.fn(async () => context),
    lockEntries: vi.fn(async () => ({
      id: "bracket-1",
      tournamentId: "tournament-1",
      version: 1,
      entries: [
        { teamId: "team-1", teamNameSnapshot: "Team One" },
        { teamId: "team-2", teamNameSnapshot: "Team Two" },
      ],
    })),
    persistGeneratedPlan: vi.fn(),
    findGenerationContext: vi.fn(),
    findPublicationContext: vi.fn(),
    setPublication: vi.fn(),
  }
  return {
    ...transaction,
    findOrganizerWorkspace: vi.fn(),
    inTransaction: vi.fn(
      async (
        operation: (repository: typeof transaction) => Promise<unknown>,
      ) => operation(transaction),
    ),
  }
}

describe("lockBracketEntries", () => {
  it("hides another organizer's tournament", async () => {
    const repository = createRepository({
      tournamentId: "tournament-1",
      organizerId: "another-organizer",
      tournamentStatus: "REGISTRATION_CLOSED",
      capacity: 6,
      version: 0,
      approvedEntries: [],
      hasStartedMatch: false,
    })

    await expect(
      lockBracketEntries(
        { tournamentId: "tournament-1", expectedVersion: 0 },
        organizer,
        { competitions: repository, now: () => new Date("2026-08-19T05:00:00Z") },
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("locks approved team snapshots for the owning organizer", async () => {
    const repository = createRepository({
      tournamentId: "tournament-1",
      organizerId: organizer.id,
      tournamentStatus: "REGISTRATION_CLOSED",
      capacity: 6,
      version: 0,
      approvedEntries: [
        {
          registrationId: "registration-1",
          teamId: "team-1",
          teamName: "Team One",
        },
        {
          registrationId: "registration-2",
          teamId: "team-2",
          teamName: "Team Two",
        },
      ],
      hasStartedMatch: false,
    })

    await expect(
      lockBracketEntries(
        { tournamentId: "tournament-1", expectedVersion: 0 },
        organizer,
        { competitions: repository, now: () => new Date("2026-08-19T05:00:00Z") },
      ),
    ).resolves.toMatchObject({
      entries: [{ teamId: "team-1" }, { teamId: "team-2" }],
    })
  })
})

describe("generateBracketDraft", () => {
  function generationRepository() {
    const transaction = {
      findLockContext: vi.fn(),
      lockEntries: vi.fn(),
      findGenerationContext: vi.fn(async () => ({
        tournamentId: "tournament-1",
        organizerId: organizer.id,
        bracketId: "bracket-1",
        bracketVersion: 2,
        drawToken: null,
        generationMethod: null,
        hasStartedMatch: false,
        entries: [
          lockedEntry("entry-1", "team-1", 1),
          lockedEntry("entry-2", "team-2", 2),
        ],
      })),
      persistGeneratedPlan: vi.fn(async () => ({
        id: "bracket-1",
        tournamentId: "tournament-1",
        version: 3,
      })),
    }
    return {
      transaction,
      repository: {
        ...transaction,
        inTransaction: vi.fn(
          async (operation: (repository: typeof transaction) => Promise<unknown>) =>
            operation(transaction),
        ),
      } as unknown as CompetitionRepository,
    }
  }

  it("generates and persists a complete seeded draft", async () => {
    const { repository, transaction } = generationRepository()

    const result = await generateBracketDraft(
      {
        tournamentId: "tournament-1",
        expectedVersion: 2,
        method: "SEEDED",
        seeds: [
          { entryId: "entry-1", seed: 2 },
          { entryId: "entry-2", seed: 1 },
        ],
      },
      organizer,
      {
        competitions: repository,
        now: () => new Date("2026-08-19T06:00:00Z"),
        createDrawToken: () => "unused-token",
        shuffle: vi.fn(),
      },
    )

    expect(result).toMatchObject({ id: "bracket-1", version: 3 })
    expect(transaction.persistGeneratedPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        bracketId: "bracket-1",
        expectedVersion: 2,
        generationMethod: "SEEDED",
        drawToken: null,
        entries: [
          expect.objectContaining({ id: "entry-1", seed: 2 }),
          expect.objectContaining({ id: "entry-2", seed: 1 }),
        ],
      }),
    )
  })

  it("rejects an incomplete seed list", async () => {
    const { repository, transaction } = generationRepository()

    await expect(
      generateBracketDraft(
        {
          tournamentId: "tournament-1",
          expectedVersion: 2,
          method: "SEEDED",
          seeds: [{ entryId: "entry-1", seed: 1 }],
        },
        organizer,
        {
          competitions: repository,
          now: () => new Date(),
          createDrawToken: () => "unused-token",
          shuffle: vi.fn(),
        },
      ),
    ).rejects.toThrow("BRACKET_SEED_INVALID")
    expect(transaction.persistGeneratedPlan).not.toHaveBeenCalled()
  })

  it("uses an injected shuffle and persists its draw token", async () => {
    const { repository, transaction } = generationRepository()
    const shuffle = vi.fn((entries: readonly { id: string }[]) => [...entries].reverse())

    await generateBracketDraft(
      {
        tournamentId: "tournament-1",
        expectedVersion: 2,
        method: "RANDOM",
        redraw: false,
      },
      organizer,
      {
        competitions: repository,
        now: () => new Date("2026-08-19T06:00:00Z"),
        createDrawToken: () => "draw-token-1",
        shuffle,
      },
    )

    expect(shuffle).toHaveBeenCalledWith(expect.any(Array), "draw-token-1")
    expect(transaction.persistGeneratedPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        drawToken: "draw-token-1",
        entries: [
          expect.objectContaining({ id: "entry-1", seed: 2 }),
          expect.objectContaining({ id: "entry-2", seed: 1 }),
        ],
      }),
    )
  })

  it("rejects regeneration after a match has started", async () => {
    const { repository, transaction } = generationRepository()
    transaction.findGenerationContext.mockResolvedValueOnce({
      tournamentId: "tournament-1",
      organizerId: organizer.id,
      bracketId: "bracket-1",
      bracketVersion: 2,
      drawToken: null,
      generationMethod: null,
      hasStartedMatch: true,
      entries: [lockedEntry("entry-1", "team-1", 1), lockedEntry("entry-2", "team-2", 2)],
    })

    await expect(
      generateBracketDraft(
        {
          tournamentId: "tournament-1",
          expectedVersion: 2,
          method: "RANDOM",
          redraw: false,
        },
        organizer,
        {
          competitions: repository,
          now: () => new Date(),
          createDrawToken: () => "draw-token",
          shuffle: (entries) => [...entries],
        },
      ),
    ).rejects.toThrow("BRACKET_STRUCTURE_LOCKED")
  })
})

function lockedEntry(id: string, teamId: string, seed: number) {
  return {
    id,
    bracketId: "bracket-1",
    registrationId: `registration-${id}`,
    teamId,
    teamNameSnapshot: `Team ${seed}`,
    seed,
    drawPosition: seed,
    startRoundSequence: 1,
  }
}

describe("getOrganizerCompetition", () => {
  it("returns a view-ready workspace to its organizer", async () => {
    const workspace = {
      tournament: {
        id: "tournament-1",
        title: "COURTSIDE OPEN",
        organizerId: organizer.id,
        status: "REGISTRATION_CLOSED",
        version: 4,
      },
      bracket: null,
      approvedTeamCount: 6,
    }
    const competitions = {
      findOrganizerWorkspace: vi.fn(async () => workspace),
    } as unknown as CompetitionRepository

    await expect(
      getOrganizerCompetition("tournament-1", organizer, { competitions }),
    ).resolves.toEqual(workspace)
  })

  it("hides another organizer's workspace", async () => {
    const competitions = {
      findOrganizerWorkspace: vi.fn(async () => ({
        tournament: {
          id: "tournament-1",
          title: "Private tournament",
          organizerId: "another-organizer",
          status: "REGISTRATION_CLOSED",
          version: 1,
        },
        bracket: null,
        approvedTeamCount: 2,
      })),
    } as unknown as CompetitionRepository

    await expect(
      getOrganizerCompetition("tournament-1", organizer, { competitions }),
    ).rejects.toThrow("NOT_FOUND")
  })
})

describe("bracket publication", () => {
  function publicationRepository(overrides: Record<string, unknown> = {}) {
    const context = {
      tournamentId: "tournament-1",
      organizerId: organizer.id,
      bracketId: "bracket-1",
      bracketVersion: 3,
      bracketStatus: "DRAFT",
      entryCount: 6,
      roundCount: 3,
      matchCount: 5,
      hasStartedMatch: false,
      ...overrides,
    }
    const transaction = {
      findPublicationContext: vi.fn(async () => context),
      setPublication: vi.fn(async () => ({
        id: "bracket-1",
        tournamentId: "tournament-1",
        version: 4,
      })),
    }
    const repository = {
      ...transaction,
      inTransaction: vi.fn(
        async (operation: (repository: typeof transaction) => Promise<unknown>) =>
          operation(transaction),
      ),
    } as unknown as CompetitionRepository
    return { repository, transaction }
  }

  it("publishes a complete generated draft", async () => {
    const { repository, transaction } = publicationRepository()

    await expect(
      publishBracket(
        { tournamentId: "tournament-1", expectedVersion: 3 },
        organizer,
        { competitions: repository, now: () => new Date("2026-08-19T07:00:00Z") },
      ),
    ).resolves.toMatchObject({ version: 4 })
    expect(transaction.setPublication).toHaveBeenCalledWith(
      expect.objectContaining({ published: true, expectedVersion: 3 }),
    )
  })

  it("rejects an incomplete draft", async () => {
    const { repository } = publicationRepository({ matchCount: 4 })

    await expect(
      publishBracket(
        { tournamentId: "tournament-1", expectedVersion: 3 },
        organizer,
        { competitions: repository, now: () => new Date() },
      ),
    ).rejects.toThrow("BRACKET_DRAFT_INCOMPLETE")
  })

  it("requires a reason to unpublish and blocks it after a match starts", async () => {
    const missingReason = publicationRepository({ bracketStatus: "PUBLISHED" })
    await expect(
      unpublishBracket(
        { tournamentId: "tournament-1", expectedVersion: 3, reason: "  " },
        organizer,
        { competitions: missingReason.repository, now: () => new Date() },
      ),
    ).rejects.toThrow("REASON_REQUIRED")

    const started = publicationRepository({
      bracketStatus: "PUBLISHED",
      hasStartedMatch: true,
    })
    await expect(
      unpublishBracket(
        { tournamentId: "tournament-1", expectedVersion: 3, reason: "แก้สาย" },
        organizer,
        { competitions: started.repository, now: () => new Date() },
      ),
    ).rejects.toThrow("BRACKET_STRUCTURE_LOCKED")
  })
})

describe("scheduleMatch", () => {
  function scheduleRepository(overrides: Record<string, unknown> = {}) {
    const transaction = {
      findMatchScheduleContext: vi.fn(async () => ({
        tournamentId: "tournament-1",
        organizerId: organizer.id,
        tournamentStartsAt: "2026-11-15T02:00:00.000Z",
        tournamentEndsAt: "2026-11-16T11:00:00.000Z",
        bracketStatus: "PUBLISHED",
        matchId: "match-1",
        matchStatus: "SCHEDULED",
        matchVersion: 1,
        hasCourtConflict: false,
        ...overrides,
      })),
      scheduleMatch: vi.fn(async () => ({
        id: "match-1",
        scheduledAt: "2026-11-15T05:00:00.000Z",
        court: "Court A",
        version: 2,
      })),
    }
    return {
      transaction,
      repository: {
        ...transaction,
        inTransaction: vi.fn(
          async (operation: (repository: typeof transaction) => Promise<unknown>) =>
            operation(transaction),
        ),
      } as unknown as CompetitionRepository,
    }
  }

  it("schedules a published match inside the tournament range", async () => {
    const { repository, transaction } = scheduleRepository()
    const result = await scheduleMatch(
      {
        tournamentId: "tournament-1",
        matchId: "match-1",
        scheduledAt: "2026-11-15T05:00:00.000Z",
        court: "  Court A  ",
        expectedVersion: 1,
      },
      organizer,
      { competitions: repository, now: () => new Date("2026-08-19T08:00:00Z") },
    )

    expect(result.version).toBe(2)
    expect(transaction.scheduleMatch).toHaveBeenCalledWith(
      expect.objectContaining({ court: "Court A", expectedVersion: 1 }),
    )
  })

  it.each([
    [{ hasCourtConflict: true }, "MATCH_SCHEDULE_CONFLICT"],
    [{ matchStatus: "COMPLETED" }, "MATCH_SCHEDULE_LOCKED"],
    [{ bracketStatus: "DRAFT" }, "BRACKET_NOT_PUBLISHED"],
  ])("rejects invalid scheduling context", async (overrides, errorCode) => {
    const { repository } = scheduleRepository(overrides)
    await expect(
      scheduleMatch(
        {
          tournamentId: "tournament-1",
          matchId: "match-1",
          scheduledAt: "2026-11-15T05:00:00.000Z",
          court: "Court A",
          expectedVersion: 1,
        },
        organizer,
        { competitions: repository, now: () => new Date() },
      ),
    ).rejects.toThrow(errorCode)
  })

  it("rejects organizer scheduling outside the tournament range", async () => {
    const { repository } = scheduleRepository()
    await expect(
      scheduleMatch(
        {
          tournamentId: "tournament-1",
          matchId: "match-1",
          scheduledAt: "2026-11-17T05:00:00.000Z",
          court: "Court A",
          expectedVersion: 1,
        },
        organizer,
        { competitions: repository, now: () => new Date() },
      ),
    ).rejects.toThrow("MATCH_SCHEDULE_OUTSIDE_TOURNAMENT")
  })
})
