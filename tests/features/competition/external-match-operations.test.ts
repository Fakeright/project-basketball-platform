import { describe, expect, it, vi } from "vitest"

import { confirmMatchResult } from "@/features/competition/application/confirm-match-result"
import { createExternalMatch } from "@/features/competition/application/create-external-match"
import { updateExternalMatchPurpose } from "@/features/competition/application/update-external-match-purpose"
import type { CompetitionRepository } from "@/features/competition/application/ports/competition-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")

describe("createExternalMatch", () => {
  it("creates a scheduled match from two distinct locked teams", async () => {
    const { repository, transaction } = repositoryWithContext()

    await createExternalMatch(
      {
        tournamentId: "tournament-1",
        roundName: "  รอบรองชนะเลิศ  ",
        sequence: 1,
        homeTeamId: "team-1",
        awayTeamId: "team-2",
        scheduledAt: "2026-08-20T06:00:00.000Z",
        court: " สนาม A ",
        expectedVersion: 3,
        purpose: "CHAMPIONSHIP",
      },
      organizer,
      { competitions: repository, now: () => new Date("2026-08-19T10:00:00Z") },
    )

    expect(transaction.createExternalMatch).toHaveBeenCalledWith(
      expect.objectContaining({
        roundName: "รอบรองชนะเลิศ",
        sequence: 1,
        court: "สนาม A",
        bracketId: "bracket-1",
        expectedVersion: 3,
        purpose: "CHAMPIONSHIP",
      }),
    )
  })

  it("defaults an omitted purpose to a standard match", async () => {
    const { repository, transaction } = repositoryWithContext()

    await createExternalMatch(
      {
        tournamentId: "tournament-1",
        roundName: "รอบแรก",
        sequence: 1,
        homeTeamId: "team-1",
        awayTeamId: "team-2",
        scheduledAt: "2026-08-20T06:00:00.000Z",
        court: "สนาม A",
        expectedVersion: 3,
      },
      organizer,
      { competitions: repository, now: () => new Date() },
    )

    expect(transaction.createExternalMatch).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: "STANDARD" }),
    )
  })

  it.each([
    ["the bracket uses generated mode", { bracketMode: "SYSTEM_GENERATED" }, "EXTERNAL_BRACKET_REQUIRED"],
    ["a team is not locked", { awayTeamId: "team-3" }, "MATCH_TEAM_NOT_LOCKED"],
    ["the same team is selected twice", { awayTeamId: "team-1" }, "MATCH_TEAMS_DUPLICATE"],
    ["the sequence is already used", { sequenceTaken: true }, "MATCH_SEQUENCE_CONFLICT"],
  ])("rejects %s", async (_label, override, code) => {
    const { repository, transaction } = repositoryWithContext(override)

    await expect(
      createExternalMatch(
        {
          tournamentId: "tournament-1",
          roundName: "Final",
          sequence: 1,
          homeTeamId: "team-1",
          awayTeamId: override.awayTeamId ?? "team-2",
          scheduledAt: "2026-08-20T06:00:00.000Z",
          court: "สนาม A",
          expectedVersion: 3,
        },
        organizer,
        { competitions: repository, now: () => new Date() },
      ),
    ).rejects.toThrow(code)
    expect(transaction.createExternalMatch).not.toHaveBeenCalled()
  })

  it("blocks external match creation for a suspended tournament", async () => {
    const { repository, transaction } = repositoryWithContext({
      tournamentGovernanceStatus: "SUSPENDED",
    })

    await expect(
      createExternalMatch(
        {
          tournamentId: "tournament-1",
          roundName: "Final",
          sequence: 1,
          homeTeamId: "team-1",
          awayTeamId: "team-2",
          scheduledAt: "2026-08-20T06:00:00.000Z",
          court: "สนาม A",
          expectedVersion: 3,
        },
        organizer,
        { competitions: repository, now: () => new Date() },
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(transaction.createExternalMatch).not.toHaveBeenCalled()
  })
})

describe("updateExternalMatchPurpose", () => {
  it("updates an unstarted external match with optimistic versioning", async () => {
    const { repository, transaction } = repositoryWithContext()

    await updateExternalMatchPurpose(
      {
        tournamentId: "tournament-1",
        matchId: "match-1",
        purpose: "THIRD_PLACE",
        expectedVersion: 2,
      },
      organizer,
      { competitions: repository, now: () => new Date("2026-08-20T05:00:00Z") },
    )

    expect(transaction.updateExternalMatchPurpose).toHaveBeenCalledWith({
      tournamentId: "tournament-1",
      matchId: "match-1",
      purpose: "THIRD_PLACE",
      previousPurpose: "STANDARD",
      expectedVersion: 2,
      actorId: organizer.id,
      adminOverride: false,
      overrideReason: null,
      at: "2026-08-20T05:00:00.000Z",
    })
  })

  it.each([
    [{ bracketMode: "SYSTEM_GENERATED" }, "EXTERNAL_BRACKET_REQUIRED"],
    [{ matchStatus: "IN_PROGRESS" }, "MATCH_PURPOSE_LOCKED"],
    [{ hasScore: true }, "MATCH_PURPOSE_LOCKED"],
    [{ resultConfirmed: true }, "MATCH_PURPOSE_LOCKED"],
  ])("rejects a locked purpose context", async (override, code) => {
    const { repository, transaction } = repositoryWithContext()
    transaction.findExternalMatchPurposeContext.mockResolvedValueOnce({
      tournamentId: "tournament-1",
      organizerId: organizer.id,
      tournamentGovernanceStatus: "ACTIVE",
      bracketMode: "EXTERNAL_DOCUMENT",
      matchId: "match-1",
      matchPurpose: "STANDARD",
      matchStatus: "SCHEDULED",
      matchVersion: 2,
      hasScore: false,
      resultConfirmed: false,
      ...override,
    })

    await expect(
      updateExternalMatchPurpose(
        {
          tournamentId: "tournament-1",
          matchId: "match-1",
          purpose: "CHAMPIONSHIP",
          expectedVersion: 2,
        },
        organizer,
        { competitions: repository, now: () => new Date() },
      ),
    ).rejects.toThrow(code)
    expect(transaction.updateExternalMatchPurpose).not.toHaveBeenCalled()
  })

  it("blocks external match purpose updates for a suspended tournament", async () => {
    const { repository, transaction } = repositoryWithContext()
    transaction.findExternalMatchPurposeContext.mockResolvedValueOnce({
      tournamentId: "tournament-1",
      organizerId: organizer.id,
      tournamentGovernanceStatus: "SUSPENDED",
      bracketMode: "EXTERNAL_DOCUMENT",
      matchId: "match-1",
      matchPurpose: "STANDARD",
      matchStatus: "SCHEDULED",
      matchVersion: 2,
      hasScore: false,
      resultConfirmed: false,
    })

    await expect(
      updateExternalMatchPurpose(
        {
          tournamentId: "tournament-1",
          matchId: "match-1",
          purpose: "CHAMPIONSHIP",
          expectedVersion: 2,
        },
        organizer,
        { competitions: repository, now: () => new Date() },
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(transaction.updateExternalMatchPurpose).not.toHaveBeenCalled()
  })
})

describe("confirmMatchResult in external mode", () => {
  it("confirms without advancing a winner into another match", async () => {
    const { repository, transaction } = repositoryWithContext()
    transaction.findResultContext.mockResolvedValue({
      tournamentId: "tournament-1",
      organizerId: organizer.id,
      tournamentGovernanceStatus: "ACTIVE",
      tournamentStatus: "IN_PROGRESS",
      bracketStatus: "PUBLISHED",
      bracketMode: "EXTERNAL_DOCUMENT",
      matchId: "match-1",
      matchStatus: "IN_PROGRESS",
      matchVersion: 4,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
      nextMatchId: "should-not-advance",
      nextSlot: "HOME",
      nextSlotTeamId: null,
      resultConfirmed: false,
    })

    await confirmMatchResult(
      {
        tournamentId: "tournament-1",
        matchId: "match-1",
        homeScore: 82,
        awayScore: 75,
        expectedVersion: 4,
      },
      organizer,
      { competitions: repository, now: () => new Date("2026-08-20T08:00:00Z") },
    )

    expect(transaction.confirmResultAndAdvance).toHaveBeenCalledWith(
      expect.objectContaining({ nextMatchId: null, nextSlot: null }),
    )
  })
})

function repositoryWithContext(override: Record<string, unknown> = {}) {
  const context = {
    tournamentId: "tournament-1",
    organizerId: organizer.id,
    tournamentGovernanceStatus: "ACTIVE",
    tournamentStartsAt: "2026-08-20T00:00:00.000Z",
    tournamentEndsAt: "2026-08-22T12:00:00.000Z",
    bracketId: "bracket-1",
    bracketVersion: 3,
    bracketStatus: "PUBLISHED",
    bracketMode: "EXTERNAL_DOCUMENT",
    lockedTeamIds: ["team-1", "team-2"],
    sequenceTaken: false,
    hasCourtConflict: false,
    ...override,
  }
  const transaction = {
    findExternalMatchCreationContext: vi.fn().mockResolvedValue(context),
    createExternalMatch: vi.fn().mockResolvedValue({
      id: "match-1",
      version: 0,
      bracketVersion: 4,
    }),
    findExternalMatchPurposeContext: vi.fn().mockResolvedValue({
      tournamentId: "tournament-1",
      organizerId: organizer.id,
      tournamentGovernanceStatus: "ACTIVE",
      bracketMode: "EXTERNAL_DOCUMENT",
      matchId: "match-1",
      matchPurpose: "STANDARD",
      matchStatus: "SCHEDULED",
      matchVersion: 2,
      hasScore: false,
      resultConfirmed: false,
    }),
    updateExternalMatchPurpose: vi.fn().mockResolvedValue({
      id: "match-1",
      purpose: "THIRD_PLACE",
      version: 3,
    }),
    findResultContext: vi.fn(),
    confirmResultAndAdvance: vi.fn().mockResolvedValue({
      id: "match-1",
      status: "COMPLETED",
      homeScore: 82,
      awayScore: 75,
      winnerTeamId: "team-1",
      version: 5,
    }),
  }
  const repository = {
    inTransaction: vi.fn(async (operation) => operation(transaction)),
  } as unknown as CompetitionRepository
  return { repository, transaction }
}
