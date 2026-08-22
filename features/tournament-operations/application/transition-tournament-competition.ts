import {
  assertTournamentCanComplete,
  assertTournamentCanStart,
} from "@/features/competition/domain/tournament-competition-policy"
import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

interface TournamentCompetitionCommand {
  tournamentId: string
  version: number
  reason?: string | null
}

interface TournamentCompetitionDependencies {
  now: () => Date
}

export function startTournamentCompetition(
  repository: TournamentOperationsRepository,
  input: TournamentCompetitionCommand,
  actor: Actor,
  dependencies: TournamentCompetitionDependencies,
): Promise<TournamentOperation> {
  return transitionTournamentCompetition(
    repository,
    input,
    actor,
    dependencies,
    "START",
  )
}

export function completeTournamentCompetition(
  repository: TournamentOperationsRepository,
  input: TournamentCompetitionCommand,
  actor: Actor,
  dependencies: TournamentCompetitionDependencies,
): Promise<TournamentOperation> {
  return transitionTournamentCompetition(
    repository,
    input,
    actor,
    dependencies,
    "COMPLETE",
  )
}

async function transitionTournamentCompetition(
  repository: TournamentOperationsRepository,
  input: TournamentCompetitionCommand,
  actor: Actor,
  dependencies: TournamentCompetitionDependencies,
  command: "START" | "COMPLETE",
): Promise<TournamentOperation> {
  const context = await repository.findCompetitionLifecycleContext(
    input.tournamentId,
  )
  if (
    !context ||
    (actor.role === "TOURNAMENT_ORGANIZER" &&
      context.organizerId !== actor.id)
  ) {
    throw new Error("NOT_FOUND")
  }

  authorize(
    actor,
    command === "START" ? "tournament.start" : "tournament.complete",
    { organizerId: context.organizerId },
  )
  assertTournamentGovernanceAllowsOperation(context.governanceStatus)
  if (context.version !== input.version) throw new Error("CONFLICT")

  const adminOverride =
    actor.role === "PLATFORM_ADMIN" && actor.id !== context.organizerId
  const reason = input.reason?.trim() || null
  if (adminOverride && !reason) throw new Error("REASON_REQUIRED")

  if (command === "START") {
    assertTournamentCanStart(context)
  } else {
    assertTournamentCanComplete(context)
  }

  return repository.transitionCompetitionWithVersion({
    tournamentId: input.tournamentId,
    version: input.version,
    sourceStatus:
      command === "START" ? "REGISTRATION_CLOSED" : "IN_PROGRESS",
    status: command === "START" ? "IN_PROGRESS" : "COMPLETED",
    actorId: actor.id,
    action:
      command === "START" ? "tournament.started" : "tournament.completed",
    adminOverride,
    reason,
    at: dependencies.now().toISOString(),
  })
}
