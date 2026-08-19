import type { Actor } from "@/features/identity/domain/actor"
import { decideMatchAdvancement } from "@/features/competition/domain/match-result-policy"

import { loadMutableMatchResultContext } from "./match-result-access"
import type {
  CompetitionRepository,
  ResultCompetitionMatch,
} from "./ports/competition-repository"

export interface ConfirmMatchResultInput {
  tournamentId: string
  matchId: string
  homeScore: number
  awayScore: number
  expectedVersion: number
}

export async function confirmMatchResult(
  input: ConfirmMatchResultInput,
  actor: Actor,
  dependencies: { competitions: CompetitionRepository; now: () => Date },
): Promise<ResultCompetitionMatch> {
  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await loadMutableMatchResultContext(
      input,
      actor,
      "result.confirm",
      competitions,
    )
    const advancement = decideMatchAdvancement({
      homeTeamId: context.homeTeamId,
      awayTeamId: context.awayTeamId,
      homeScore: input.homeScore,
      awayScore: input.awayScore,
      nextMatchId: context.nextMatchId,
      nextSlot: context.nextSlot,
    })
    if (
      context.nextSlotTeamId &&
      context.nextSlotTeamId !== advancement.winnerTeamId
    ) {
      throw new Error("MATCH_ADVANCEMENT_CONFLICT")
    }

    return competitions.confirmResultAndAdvance({
      ...input,
      ...advancement,
      actorId: actor.id,
      adminOverride: actor.role === "PLATFORM_ADMIN",
      at: dependencies.now().toISOString(),
    })
  })
}
