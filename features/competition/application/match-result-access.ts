import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"

import type {
  CompetitionRepositoryTransaction,
  MatchResultContext,
} from "./ports/competition-repository"

export async function loadMutableMatchResultContext(
  input: { tournamentId: string; matchId: string; expectedVersion: number },
  actor: Actor,
  action: "result.record" | "result.confirm",
  competitions: CompetitionRepositoryTransaction,
): Promise<MatchResultContext & { homeTeamId: string; awayTeamId: string }> {
  const context = await competitions.findResultContext(input)
  if (
    !context ||
    (actor.role !== "PLATFORM_ADMIN" && context.organizerId !== actor.id)
  ) {
    throw new Error("NOT_FOUND")
  }
  authorize(actor, action, { organizerId: context.organizerId })
  if (context.matchVersion !== input.expectedVersion) throw new Error("CONFLICT")
  if (context.tournamentStatus !== "IN_PROGRESS") {
    throw new Error("TOURNAMENT_NOT_IN_PROGRESS")
  }
  if (context.bracketStatus !== "PUBLISHED") {
    throw new Error("BRACKET_NOT_PUBLISHED")
  }
  if (!context.homeTeamId || !context.awayTeamId) {
    throw new Error("MATCH_TEAMS_INCOMPLETE")
  }
  if (!(["SCHEDULED", "IN_PROGRESS"] as string[]).includes(context.matchStatus)) {
    throw new Error("MATCH_RESULT_LOCKED")
  }
  if (context.resultConfirmed) throw new Error("MATCH_RESULT_CONFIRMED")

  return {
    ...context,
    homeTeamId: context.homeTeamId,
    awayTeamId: context.awayTeamId,
  }
}
