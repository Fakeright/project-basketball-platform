import type { MatchSlot } from "./competition"

export function assertScoreCanBeConfirmed(input: {
  homeScore: number
  awayScore: number
}): void {
  if (
    !Number.isInteger(input.homeScore) ||
    !Number.isInteger(input.awayScore) ||
    input.homeScore < 0 ||
    input.awayScore < 0 ||
    input.homeScore === input.awayScore
  ) {
    throw new Error("MATCH_SCORE_INVALID")
  }
}

export function decideMatchAdvancement(input: {
  homeTeamId: string
  awayTeamId: string
  homeScore: number
  awayScore: number
  nextMatchId: string | null
  nextSlot: MatchSlot | null
}): {
  winnerTeamId: string
  nextMatchId: string | null
  nextSlot: MatchSlot | null
} {
  assertScoreCanBeConfirmed(input)

  return {
    winnerTeamId:
      input.homeScore > input.awayScore ? input.homeTeamId : input.awayTeamId,
    nextMatchId: input.nextMatchId,
    nextSlot: input.nextSlot,
  }
}
