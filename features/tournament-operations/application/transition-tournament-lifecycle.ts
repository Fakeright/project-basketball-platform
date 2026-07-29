import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"
import {
  assertCanCloseRegistration,
  assertCanPublish,
} from "@/features/tournament-operations/domain/tournament-workflow"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

interface LifecycleCommand {
  tournamentId: string
  version: number
}

export async function publishTournament(
  repository: TournamentOperationsRepository,
  input: LifecycleCommand,
  actor: Actor,
  dependencies: { now: () => Date },
): Promise<TournamentOperation> {
  const tournament = await loadAuthorizedTournament(repository, input, actor)
  assertCanPublish(tournament, dependencies.now())
  return repository.transitionWithVersion({
    tournamentId: tournament.id,
    version: input.version,
    sourceStatus: "APPROVED",
    status: "PUBLISHED",
    actorId: actor.id,
    action: "tournament.published",
    adminOverride: isAdminOverride(actor, tournament.organizerId),
  })
}

export async function closeTournamentRegistration(
  repository: TournamentOperationsRepository,
  input: LifecycleCommand,
  actor: Actor,
): Promise<TournamentOperation> {
  const tournament = await loadAuthorizedTournament(repository, input, actor)
  assertCanCloseRegistration(tournament)
  return repository.transitionWithVersion({
    tournamentId: tournament.id,
    version: input.version,
    sourceStatus: "PUBLISHED",
    status: "REGISTRATION_CLOSED",
    actorId: actor.id,
    action: "tournament.registration_closed",
    adminOverride: isAdminOverride(actor, tournament.organizerId),
  })
}

async function loadAuthorizedTournament(
  repository: TournamentOperationsRepository,
  input: LifecycleCommand,
  actor: Actor,
) {
  const tournament = await repository.findById(input.tournamentId)
  if (!tournament) throw new Error("NOT_FOUND")
  authorize(actor, "tournament.publish", {
    organizerId: tournament.organizerId,
  })
  if (input.version !== tournament.version) throw new Error("CONFLICT")
  return tournament
}

function isAdminOverride(actor: Actor, organizerId: string) {
  return actor.role === "PLATFORM_ADMIN" && actor.id !== organizerId
}
