import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

export async function authorizeTournamentMediaMutation(
  tournamentId: string,
  actor: Actor,
  dependencies: {
    tournaments: Pick<TournamentOperationsRepository, "findById">
  },
) {
  const tournament = await dependencies.tournaments.findById(tournamentId)
  if (!tournament) throw new Error("NOT_FOUND")
  authorize(actor, "tournament.update", {
    organizerId: tournament.organizerId,
  })
  return tournament
}
