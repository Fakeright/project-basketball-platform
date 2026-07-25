import type { Actor } from "@/features/identity/domain/actor"
import { authorize } from "@/features/identity/application/authorize"
import type { TournamentOperation, TournamentOperationInput } from "@/features/tournament-operations/domain/tournament-operation"
import { canSubmit, validateTournamentInput } from "@/features/tournament-operations/domain/tournament-workflow"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

export async function createTournament(repository: TournamentOperationsRepository, input: TournamentOperationInput, actor: Actor): Promise<TournamentOperation> {
  validateTournamentInput(input)
  authorize(actor, "tournament.create", { organizerId: actor.id })
  return repository.create({ ...input, organizerId: actor.id })
}

export async function submitTournament(repository: TournamentOperationsRepository, id: string, actor: Actor): Promise<TournamentOperation> {
  const tournament = await repository.findById(id)
  if (!tournament) throw new Error("NOT_FOUND")
  authorize(actor, "tournament.submit", { organizerId: tournament.organizerId })
  if (!canSubmit(tournament.status)) throw new Error("INVALID_SUBMIT_STATUS")
  return repository.updateWithVersion(id, tournament.version, { status: "SUBMITTED" })
}
