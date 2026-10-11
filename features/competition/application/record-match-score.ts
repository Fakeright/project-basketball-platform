import type { Actor } from "@/features/identity/domain/actor"
import { assertDraftScore } from "@/features/competition/domain/match-result-policy"

import { loadMutableMatchResultContext } from "./match-result-access"
import type {
  CompetitionRepository,
  ResultCompetitionMatch,
} from "./ports/competition-repository"

export interface RecordMatchScoreInput {
  tournamentId: string
  matchId: string
  homeScore: number
  awayScore: number
  expectedVersion: number
}

export async function recordMatchScore(
  input: RecordMatchScoreInput,
  actor: Actor,
  dependencies: { competitions: CompetitionRepository; now: () => Date },
): Promise<ResultCompetitionMatch> {
  assertDraftScore(input)
  return dependencies.competitions.inTransaction(async (competitions) => {
    await loadMutableMatchResultContext(
      input,
      actor,
      "result.record",
      competitions,
    )
    return competitions.recordScore({
      ...input,
      actorId: actor.id,
      adminOverride: actor.role === "PLATFORM_ADMIN",
      at: dependencies.now().toISOString(),
    })
  })
}
