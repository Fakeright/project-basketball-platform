import type { TournamentCompetitionLifecycleContext } from "./competition"

export type TournamentCompetitionIssueCode =
  | "TOURNAMENT_STATUS_INVALID"
  | "BRACKET_MISSING"
  | "BRACKET_NOT_PUBLISHED"
  | "ENTRIES_NOT_LOCKED"
  | "ENTRY_COUNT_INVALID"
  | "MATCH_MISSING"
  | "CHAMPIONSHIP_MISSING"
  | "CHAMPIONSHIP_DUPLICATE"
  | "THIRD_PLACE_DUPLICATE"
  | "PLACEMENT_TEAMS_INCOMPLETE"
  | "MATCH_RESULT_PENDING"
  | "MATCH_RESULT_INVALID"

export class TournamentCompetitionPolicyError extends Error {
  readonly issues: readonly TournamentCompetitionIssueCode[]

  constructor(issues: readonly TournamentCompetitionIssueCode[]) {
    super("TOURNAMENT_COMPETITION_NOT_READY")
    this.name = "TournamentCompetitionPolicyError"
    this.issues = issues
  }
}

export function getStartIssues(
  context: TournamentCompetitionLifecycleContext,
): TournamentCompetitionIssueCode[] {
  return getStructureIssues(context, "REGISTRATION_CLOSED")
}

export function getCompletionIssues(
  context: TournamentCompetitionLifecycleContext,
): TournamentCompetitionIssueCode[] {
  const issues = getStructureIssues(context, "IN_PROGRESS")
  const matches = context.activeBracket?.matches ?? []

  if (
    matches.some(
      (match) => match.status !== "COMPLETED" || !match.resultConfirmed,
    )
  ) {
    issues.push("MATCH_RESULT_PENDING")
  }

  if (
    matches.some(
      (match) =>
        match.status === "COMPLETED" &&
        match.resultConfirmed &&
        (!match.homeTeamId ||
          !match.awayTeamId ||
          !match.winnerTeamId ||
          (match.winnerTeamId !== match.homeTeamId &&
            match.winnerTeamId !== match.awayTeamId)),
    )
  ) {
    issues.push("MATCH_RESULT_INVALID")
  }

  return uniqueIssues(issues)
}

export function assertTournamentCanStart(
  context: TournamentCompetitionLifecycleContext,
): void {
  assertNoIssues(getStartIssues(context))
}

export function assertTournamentCanComplete(
  context: TournamentCompetitionLifecycleContext,
): void {
  assertNoIssues(getCompletionIssues(context))
}

function getStructureIssues(
  context: TournamentCompetitionLifecycleContext,
  expectedStatus: "REGISTRATION_CLOSED" | "IN_PROGRESS",
): TournamentCompetitionIssueCode[] {
  const issues: TournamentCompetitionIssueCode[] = []
  if (context.status !== expectedStatus) issues.push("TOURNAMENT_STATUS_INVALID")

  const bracket = context.activeBracket
  if (!bracket) return [...issues, "BRACKET_MISSING"]

  if (bracket.status !== "PUBLISHED") issues.push("BRACKET_NOT_PUBLISHED")
  if (!bracket.entriesLockedAt) issues.push("ENTRIES_NOT_LOCKED")
  if (bracket.entryCount < 2) issues.push("ENTRY_COUNT_INVALID")
  if (bracket.matches.length === 0) issues.push("MATCH_MISSING")

  const championships = bracket.matches.filter(
    (match) => match.purpose === "CHAMPIONSHIP",
  )
  const thirdPlaceMatches = bracket.matches.filter(
    (match) => match.purpose === "THIRD_PLACE",
  )
  if (championships.length === 0) issues.push("CHAMPIONSHIP_MISSING")
  if (championships.length > 1) issues.push("CHAMPIONSHIP_DUPLICATE")
  if (thirdPlaceMatches.length > 1) issues.push("THIRD_PLACE_DUPLICATE")
  if (
    [...championships, ...thirdPlaceMatches].some(
      (match) => !match.homeTeamId || !match.awayTeamId,
    )
  ) {
    issues.push("PLACEMENT_TEAMS_INCOMPLETE")
  }

  return uniqueIssues(issues)
}

function assertNoIssues(issues: readonly TournamentCompetitionIssueCode[]) {
  if (issues.length > 0) throw new TournamentCompetitionPolicyError(issues)
}

function uniqueIssues(
  issues: readonly TournamentCompetitionIssueCode[],
): TournamentCompetitionIssueCode[] {
  return [...new Set(issues)]
}
