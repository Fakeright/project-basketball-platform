import type { Actor } from "@/features/identity/domain/actor"

import type { TeamRepository } from "./ports/team-repository"
import { authorizeTeamAccess } from "./team-access"

export interface RemoveOrDeactivateTeamInput {
  teamId: string
  confirmationName: string
  expectedVersion: number
  at: string
}

export interface RemoveOrDeactivateTeamResult {
  outcome: "DELETED" | "DEACTIVATED"
}

const blockingRegistrationStatuses = new Set(["PENDING", "APPROVED"])

export async function removeOrDeactivateTeam(
  input: RemoveOrDeactivateTeamInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<RemoveOrDeactivateTeamResult> {
  return dependencies.teams.inTransaction(async (teams) => {
    const context = await teams.getRemovalContextForUpdate(input.teamId)
    if (!context) throw new Error("NOT_FOUND")

    const { team, registrationStatuses, totalLegacyMemberCount } = context
    const isOverride = authorizeTeamAccess(actor, "team.update", team)
    if (team.version !== input.expectedVersion) throw new Error("CONFLICT")
    if (input.confirmationName.trim() !== team.name) {
      throw new Error("TEAM_NAME_CONFIRMATION_MISMATCH")
    }
    if (!team.isActive) throw new Error("TEAM_INACTIVE")
    if (registrationStatuses.some((status) => blockingRegistrationStatuses.has(status))) {
      throw new Error("TEAM_REMOVAL_BLOCKED")
    }

    if (registrationStatuses.length === 0 && totalLegacyMemberCount === 0) {
      await teams.deleteTeam(team.id)
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.deleted",
        entityId: team.id,
        before: team,
        after: null,
      })
      if (isOverride) {
        await teams.appendAuditEvent({
          actorId: actor.id,
          action: "team.admin_override",
          entityId: team.id,
          before: team,
          after: null,
        })
      }
      return { outcome: "DELETED" }
    }

    const deactivated = await teams.deactivateTeam(
      team.id,
      input.expectedVersion,
      input.at,
    )
    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.deactivated",
      entityId: team.id,
      before: team,
      after: deactivated,
    })
    if (isOverride) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.admin_override",
        entityId: team.id,
        before: team,
        after: deactivated,
      })
    }
    return { outcome: "DEACTIVATED" }
  })
}
