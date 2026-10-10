import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"
import {
  getTournamentGovernanceIssues,
  getTournamentGovernanceReasonIssues,
  TournamentGovernancePolicyError,
  type TournamentGovernanceAction,
} from "@/features/tournament-operations/domain/tournament-governance-policy"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

export type TournamentGovernanceCommand =
  | TournamentGovernanceTransitionCommand
  | TournamentPermanentDeleteCommand

interface TournamentGovernanceCommandBase {
  tournamentId: string
  version: number
  reason: string
}

interface TournamentGovernanceTransitionCommand
  extends TournamentGovernanceCommandBase {
  action: Exclude<TournamentGovernanceAction, "PERMANENT_DELETE">
}

interface TournamentPermanentDeleteCommand
  extends TournamentGovernanceCommandBase {
  action: "PERMANENT_DELETE"
  confirmationTitle: string
}

const permissionByAction = {
  SUSPEND: "tournament.suspend",
  RESUME: "tournament.suspend",
  REMOVE: "tournament.remove",
  ARCHIVE: "tournament.archive",
  REOPEN_REGISTRATION: "tournament.registration.reopen",
  PERMANENT_DELETE: "tournament.remove",
} as const

export async function governTournament(
  repository: TournamentOperationsRepository,
  command: TournamentGovernanceCommand,
  actor: Actor,
  dependencies: { now: () => Date },
): Promise<TournamentOperation | null> {
  if (actor.role !== "PLATFORM_ADMIN") throw new Error("FORBIDDEN")

  const context = await repository.findGovernanceContext(command.tournamentId)
  if (!context) throw new Error("NOT_FOUND")

  authorize(actor, permissionByAction[command.action], {
    organizerId: context.organizerId,
  })
  if (command.version !== context.version) throw new Error("CONFLICT")

  const reason = command.reason.trim()
  const now = dependencies.now()
  const issues = [
    ...getTournamentGovernanceReasonIssues(reason),
    ...getTournamentGovernanceIssues(
      command.action,
      context,
      now,
      command.action === "PERMANENT_DELETE"
        ? command.confirmationTitle
        : undefined,
    ),
  ]
  if (issues.length > 0) throw new TournamentGovernancePolicyError(issues)

  const at = now.toISOString()
  if (command.action === "PERMANENT_DELETE") {
    await repository.permanentlyDeleteWithVersion({
      tournamentId: command.tournamentId,
      expectedVersion: context.version,
      confirmationTitle: command.confirmationTitle,
      reason,
      actorId: actor.id,
      at,
    })
    return null
  }

  return repository.governWithVersion({
    action: command.action,
    tournamentId: command.tournamentId,
    expectedVersion: context.version,
    sourceStatus: context.status,
    sourceGovernanceStatus: context.governanceStatus,
    reason,
    actorId: actor.id,
    at,
  })
}
