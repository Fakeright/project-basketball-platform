import { describe, expect, it } from "vitest"

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
    entriesLockedAt: "2026-08-20T09:00:00.000Z",
    entryCount: 4,
    matches: [
      {
        id: "semi-1",
        purpose: "STANDARD",
        status: "SCHEDULED",
        homeTeamId: "team-1",
        awayTeamId: "team-2",
        winnerTeamId: null,
        resultConfirmed: false,
      },
      {
        id: "final",
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
