import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import { assertScoreCanBeConfirmed } from "@/features/competition/domain/match-result-policy"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"

import type {
  CompetitionRepository,
  ResultCompetitionMatch,
} from "./ports/competition-repository"

export interface CorrectMatchResultInput {
  tournamentId: string
  matchId: string
  homeScore: number
  awayScore: number
  expectedVersion: number
  reason: string
}

export async function correctMatchResult(
  input: CorrectMatchResultInput,
  actor: Actor,
  dependencies: { competitions: CompetitionRepository; now: () => Date },
): Promise<ResultCompetitionMatch> {
  const reason = input.reason.trim()
  if (!reason) throw new Error("REASON_REQUIRED")
  authorize(actor, "result.correct")
  assertScoreCanBeConfirmed(input)

  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await competitions.findResultCorrectionContext(input)
    if (!context) throw new Error("NOT_FOUND")
    if (context.matchVersion !== input.expectedVersion) throw new Error("CONFLICT")
    assertTournamentGovernanceAllowsOperation(
      context.tournamentGovernanceStatus,
    )
    if (context.matchStatus !== "COMPLETED") {
      throw new Error("MATCH_RESULT_NOT_CONFIRMED")
    }

    const winnerTeamId =
      input.homeScore > input.awayScore
        ? context.homeTeamId
        : context.awayTeamId
    const replaceDownstreamSlot =
      winnerTeamId !== context.currentWinnerTeamId &&
      context.nextMatchId !== null

    if (replaceDownstreamSlot) {
      const downstreamLocked =
        !context.nextSlot ||
        context.nextSlotTeamId !== context.currentWinnerTeamId ||
        context.nextMatchStatus !== "SCHEDULED" ||
        context.nextResultConfirmed ||
        context.nextHasScore
      if (downstreamLocked) {
        throw new Error("RESULT_CORRECTION_DOWNSTREAM_LOCKED")
      }
    }

    return competitions.correctResult({
      ...input,
      reason,
      previousWinnerTeamId: context.currentWinnerTeamId,
      winnerTeamId,
      nextMatchId: context.nextMatchId,
      nextSlot: context.nextSlot,
      replaceDownstreamSlot,
      actorId: actor.id,
      at: dependencies.now().toISOString(),
    })
  })
}
