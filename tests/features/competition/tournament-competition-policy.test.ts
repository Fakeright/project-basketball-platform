import { describe, expect, it } from "vitest"

import { generateSingleEliminationBracket } from "@/features/competition/domain/bracket-generator"
import { decideMatchAdvancement } from "@/features/competition/domain/match-result-policy"
import {
  assertTournamentCanComplete,
  assertTournamentCanStart,
  getCompletionIssues,
  getStartIssues,
  TournamentCompetitionPolicyError,
} from "@/features/competition/domain/tournament-competition-policy"
import type { TournamentCompetitionLifecycleContext } from "@/features/competition/domain/competition"

const validClosedContext: TournamentCompetitionLifecycleContext = {
  tournamentId: "tournament-1",
  organizerId: "organizer-1",
  tournamentGovernanceStatus: "ACTIVE",
  status: "REGISTRATION_CLOSED",
  version: 4,
  activeBracket: {
    id: "bracket-1",
    status: "PUBLISHED",
    mode: "EXTERNAL_DOCUMENT",
    entriesLockedAt: "2026-08-20T09:00:00.000Z",
    entryCount: 4,
    matches: [
      {
        id: "semi-1",
        roundSequence: 1,
        nextMatchId: null,
        nextSlot: null,
        purpose: "STANDARD",
        status: "SCHEDULED",
        homeTeamId: "team-1",
        awayTeamId: "team-2",
        winnerTeamId: null,
        resultConfirmed: false,
      },
      {
        id: "final",
        roundSequence: 2,
        nextMatchId: null,
        nextSlot: null,
        purpose: "CHAMPIONSHIP",
        status: "SCHEDULED",
        homeTeamId: "team-1",
        awayTeamId: "team-3",
        winnerTeamId: null,
        resultConfirmed: false,
      },
    ],
  },
}

const validCompletionContext: TournamentCompetitionLifecycleContext = {
  ...validClosedContext,
  status: "IN_PROGRESS",
  activeBracket: {
    ...validClosedContext.activeBracket!,
    matches: validClosedContext.activeBracket!.matches.map((match) => ({
      ...match,
      status: "COMPLETED",
      winnerTeamId: match.homeTeamId,
      resultConfirmed: true,
    })),
  },
}

describe("tournament competition policy", () => {
  it("allows a closed tournament with a published and classified bracket to start", () => {
    expect(getStartIssues(validClosedContext)).toEqual([])
    expect(() => assertTournamentCanStart(validClosedContext)).not.toThrow()
  })

  it.each([2, 6, 8, 16, 32])(
    "starts a generated %i-team bracket while later rounds wait for winners",
    (teamCount) => {
      const plan = generateSingleEliminationBracket({
        entries: Array.from({ length: teamCount }, (_, index) => ({
          entryId: `entry-${index + 1}`,
          teamId: `team-${index + 1}`,
          seed: index + 1,
        })),
      })
      const context: TournamentCompetitionLifecycleContext = {
        ...validClosedContext,
        activeBracket: {
          ...validClosedContext.activeBracket!,
          mode: "SYSTEM_GENERATED",
          entryCount: teamCount,
          matches: plan.matches.map((match) => ({
            id: match.key,
            purpose: match.purpose,
            status: "SCHEDULED",
            roundSequence: match.roundSequence,
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            winnerTeamId: null,
            resultConfirmed: false,
            nextMatchId: match.nextMatchKey,
            nextSlot: match.nextSlot,
          })),
        },
      }

      expect(getStartIssues(context)).toEqual([])
      expect(() => assertTournamentCanStart(context)).not.toThrow()
      expect(getCompletionIssues({ ...context, status: "IN_PROGRESS" })).toContain(
        "MATCH_RESULT_PENDING",
      )
    },
  )

  it("rejects a generated bracket when a waiting final slot has no source match", () => {
    const plan = generateSingleEliminationBracket({
      entries: Array.from({ length: 6 }, (_, index) => ({
        entryId: `entry-${index + 1}`,
        teamId: `team-${index + 1}`,
        seed: index + 1,
      })),
    })
    const context: TournamentCompetitionLifecycleContext = {
      ...validClosedContext,
      activeBracket: {
        ...validClosedContext.activeBracket!,
        mode: "SYSTEM_GENERATED",
        entryCount: 6,
        matches: plan.matches.map((match) => ({
          id: match.key,
          purpose: match.purpose,
          status: "SCHEDULED",
          roundSequence: match.roundSequence,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          winnerTeamId: null,
          resultConfirmed: false,
          nextMatchId:
            match.nextMatchKey === plan.matches.at(-1)?.key &&
            match.nextSlot === "HOME"
              ? null
              : match.nextMatchKey,
          nextSlot: match.nextSlot,
        })),
      },
    }

    expect(getStartIssues(context)).toContain("PLACEMENT_TEAMS_INCOMPLETE")
  })

  it("rejects an unfilled standard match even when the final has two teams", () => {
    const context: TournamentCompetitionLifecycleContext = {
      ...validClosedContext,
      activeBracket: {
        ...validClosedContext.activeBracket!,
        mode: "SYSTEM_GENERATED",
        matches: [
          { ...validClosedContext.activeBracket!.matches[0]!, awayTeamId: null },
          validClosedContext.activeBracket!.matches[1]!,
        ],
      },
    }

    expect(getStartIssues(context)).toContain("MATCH_TEAMS_INCOMPLETE")
  })

  it("keeps external-document placement matches blocked until both teams are set", () => {
    const context: TournamentCompetitionLifecycleContext = {
      ...validClosedContext,
      activeBracket: {
        ...validClosedContext.activeBracket!,
        matches: validClosedContext.activeBracket!.matches.map((match) =>
          match.purpose === "CHAMPIONSHIP"
            ? { ...match, awayTeamId: null }
            : match,
        ),
      },
    }

    expect(getStartIssues(context)).toContain("PLACEMENT_TEAMS_INCOMPLETE")
  })

  it("still requires both placement teams before completing a generated tournament", () => {
    const context: TournamentCompetitionLifecycleContext = {
      ...validCompletionContext,
      activeBracket: {
        ...validCompletionContext.activeBracket!,
        mode: "SYSTEM_GENERATED",
        matches: validCompletionContext.activeBracket!.matches.map((match) =>
          match.purpose === "CHAMPIONSHIP"
            ? { ...match, awayTeamId: null }
            : match,
        ),
      },
    }

    expect(getCompletionIssues(context)).toEqual(
      expect.arrayContaining(["PLACEMENT_TEAMS_INCOMPLETE", "MATCH_RESULT_INVALID"]),
    )
  })

  it("completes a six-team generated bracket after each winner reaches the final", () => {
    const plan = generateSingleEliminationBracket({
      entries: Array.from({ length: 6 }, (_, index) => ({
        entryId: `entry-${index + 1}`,
        teamId: `team-${index + 1}`,
        seed: index + 1,
      })),
    })
    const matches = plan.matches.map((match) => ({
      id: match.key,
      purpose: match.purpose,
      status: "SCHEDULED",
      roundSequence: match.roundSequence,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      winnerTeamId: null as string | null,
      resultConfirmed: false,
      nextMatchId: match.nextMatchKey,
      nextSlot: match.nextSlot,
    }))
    const context: TournamentCompetitionLifecycleContext = {
      ...validClosedContext,
      activeBracket: {
        ...validClosedContext.activeBracket!,
        mode: "SYSTEM_GENERATED",
        entryCount: 6,
        matches,
      },
    }
    expect(getStartIssues(context)).toEqual([])

    for (const match of matches) {
      expect(match.homeTeamId).not.toBeNull()
      expect(match.awayTeamId).not.toBeNull()
      const result = decideMatchAdvancement({
        homeTeamId: match.homeTeamId!,
        awayTeamId: match.awayTeamId!,
        homeScore: 80,
        awayScore: 70,
        nextMatchId: match.nextMatchId,
        nextSlot: match.nextSlot,
      })
      match.winnerTeamId = result.winnerTeamId
      match.status = "COMPLETED"
      match.resultConfirmed = true
      if (result.nextMatchId) {
        const nextMatch = matches.find((candidate) => candidate.id === result.nextMatchId)
        expect(nextMatch).toBeDefined()
        if (result.nextSlot === "HOME") nextMatch!.homeTeamId = result.winnerTeamId
        if (result.nextSlot === "AWAY") nextMatch!.awayTeamId = result.winnerTeamId
      }
    }

    expect(getCompletionIssues({ ...context, status: "IN_PROGRESS" })).toEqual([])
    const final = matches.find((match) => match.purpose === "CHAMPIONSHIP")
    expect(final?.winnerTeamId).toBe(final?.homeTeamId)
    expect(final?.awayTeamId).not.toBeNull()
  })

  it.each([
    [
      "TOURNAMENT_STATUS_INVALID",
      { ...validClosedContext, status: "PUBLISHED" },
    ],
    ["BRACKET_MISSING", { ...validClosedContext, activeBracket: null }],
    [
      "BRACKET_NOT_PUBLISHED",
      {
        ...validClosedContext,
        activeBracket: { ...validClosedContext.activeBracket!, status: "DRAFT" },
      },
    ],
    [
      "ENTRIES_NOT_LOCKED",
      {
        ...validClosedContext,
        activeBracket: {
          ...validClosedContext.activeBracket!,
          entriesLockedAt: null,
        },
      },
    ],
    [
      "ENTRY_COUNT_INVALID",
      {
        ...validClosedContext,
        activeBracket: { ...validClosedContext.activeBracket!, entryCount: 1 },
      },
    ],
    [
      "MATCH_MISSING",
      {
        ...validClosedContext,
        activeBracket: { ...validClosedContext.activeBracket!, matches: [] },
      },
    ],
    [
      "CHAMPIONSHIP_MISSING",
      {
        ...validClosedContext,
        activeBracket: {
          ...validClosedContext.activeBracket!,
          matches: validClosedContext.activeBracket!.matches.map((match) => ({
            ...match,
            purpose: "STANDARD" as const,
          })),
        },
      },
    ],
  ] as const)("reports %s when start readiness is incomplete", (issue, context) => {
    expect(getStartIssues(context)).toContain(issue)
  })

  it("rejects duplicate placement matches and incomplete placement teams", () => {
    const championship = validClosedContext.activeBracket!.matches[1]!
    const issues = getStartIssues({
      ...validClosedContext,
      activeBracket: {
        ...validClosedContext.activeBracket!,
        matches: [
          ...validClosedContext.activeBracket!.matches,
          { ...championship, id: "final-2", homeTeamId: null },
          {
            ...championship,
            id: "third-1",
            purpose: "THIRD_PLACE",
          },
          {
            ...championship,
            id: "third-2",
            purpose: "THIRD_PLACE",
          },
        ],
      },
    })

    expect(issues).toEqual(
      expect.arrayContaining([
        "CHAMPIONSHIP_DUPLICATE",
        "THIRD_PLACE_DUPLICATE",
        "PLACEMENT_TEAMS_INCOMPLETE",
      ]),
    )
  })

  it("allows completion only after every created match has a valid confirmed result", () => {
    expect(getCompletionIssues(validCompletionContext)).toEqual([])
    expect(() => assertTournamentCanComplete(validCompletionContext)).not.toThrow()

    const pendingContext: TournamentCompetitionLifecycleContext = {
      ...validCompletionContext,
      activeBracket: {
        ...validCompletionContext.activeBracket!,
        matches: validCompletionContext.activeBracket!.matches.map((match, index) =>
          index === 0
            ? { ...match, status: "IN_PROGRESS", resultConfirmed: false }
            : match,
        ),
      },
    }
    expect(getCompletionIssues(pendingContext)).toContain("MATCH_RESULT_PENDING")
  })

  it("reports a confirmed winner that is not one of the competing teams", () => {
    const context: TournamentCompetitionLifecycleContext = {
      ...validCompletionContext,
      activeBracket: {
        ...validCompletionContext.activeBracket!,
        matches: validCompletionContext.activeBracket!.matches.map((match) =>
          match.purpose === "CHAMPIONSHIP"
            ? { ...match, winnerTeamId: "team-outside" }
            : match,
        ),
      },
    }

    expect(getCompletionIssues(context)).toContain("MATCH_RESULT_INVALID")
    expect(() => assertTournamentCanComplete(context)).toThrow(
      TournamentCompetitionPolicyError,
    )
  })

  it("exposes all actionable issues on the policy error", () => {
    try {
      assertTournamentCanStart({ ...validClosedContext, activeBracket: null })
      throw new Error("EXPECTED_POLICY_ERROR")
    } catch (error) {
      expect(error).toBeInstanceOf(TournamentCompetitionPolicyError)
      expect((error as TournamentCompetitionPolicyError).issues).toContain(
        "BRACKET_MISSING",
      )
    }
  })
})
