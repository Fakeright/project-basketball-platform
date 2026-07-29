import type { Actor } from "@/features/identity/domain/actor"
import { authorize } from "@/features/identity/application/authorize"
import type { TournamentOperation, TournamentOperationInput } from "@/features/tournament-operations/domain/tournament-operation"
import { canSubmit, validateTournamentInput } from "@/features/tournament-operations/domain/tournament-workflow"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"
import { assertProvinceCode } from "@/features/provinces/application/assert-province-code"

export async function createTournament(repository: TournamentOperationsRepository, input: TournamentOperationInput, actor: Actor): Promise<TournamentOperation> {
  assertProvinceCode(input.provinceCode)
  validateTournamentInput(input)
  authorize(actor, "tournament.create", { organizerId: actor.id })
  return repository.create(
    { ...input, organizerId: actor.id },
    {
      actorId: actor.id,
      action: "tournament.created",
      adminOverride: false,
    },
  )
}

export async function updateTournament(
  repository: TournamentOperationsRepository,
  id: string,
  input: TournamentOperationInput & { version: number },
  actor: Actor,
): Promise<TournamentOperation> {
  assertProvinceCode(input.provinceCode)
  const tournament = await repository.findById(id)
  if (!tournament) throw new Error("NOT_FOUND")
  authorize(actor, "tournament.update", {
    organizerId: tournament.organizerId,
  })
  if (tournament.status !== "DRAFT" && tournament.status !== "CHANGES_REQUESTED") {
    throw new Error("INVALID_UPDATE_STATUS")
  }
  validateTournamentInput(input)
  const { version, ...changes } = input
  return repository.updateWithVersion(id, version, changes, {
    actorId: actor.id,
    action: "tournament.updated",
    adminOverride:
      actor.role === "PLATFORM_ADMIN" && actor.id !== tournament.organizerId,
  })
}

export async function submitTournament(repository: TournamentOperationsRepository, id: string, actor: Actor): Promise<TournamentOperation> {
  const tournament = await repository.findById(id)
  if (!tournament) throw new Error("NOT_FOUND")
  authorize(actor, "tournament.submit", { organizerId: tournament.organizerId })
  if (!canSubmit(tournament.status)) throw new Error("INVALID_SUBMIT_STATUS")
  return repository.updateWithVersion(
    id,
    tournament.version,
    { status: "SUBMITTED" },
    {
      actorId: actor.id,
      action: "tournament.submitted",
      adminOverride:
        actor.role === "PLATFORM_ADMIN" && actor.id !== tournament.organizerId,
    },
  )
}
