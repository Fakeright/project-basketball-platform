import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TeamPlayer } from "@/features/team-management/domain/team"

import type { TeamRepository } from "./ports/team-repository"

export interface DeactivateTeamPlayerInput {
  teamId: string
  playerId: string
  at: string
}

export async function deactivateTeamPlayer(
  input: DeactivateTeamPlayerInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamPlayer> {
  return dependencies.teams.inTransaction(async (teams) => {
    const team = await teams.findByIdForUpdate(input.teamId)
    if (!team) throw new Error("NOT_FOUND")

    const isOverride = authorizePlayerRosterAccess(actor, team.ownerId)
    if (!team.isActive) throw new Error("TEAM_INACTIVE")

    const player = (await teams.listActivePlayers(team.id)).find(
      (candidate) => candidate.id === input.playerId,
    )
    if (!player) throw new Error("PLAYER_NOT_FOUND")

    const deactivated = await teams.deactivatePlayer(team.id, player.id, input.at)
    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.player_deactivated",
      entityId: team.id,
      before: player,
      after: deactivated,
    })
    if (isOverride) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.admin_override",
        entityId: team.id,
        before: player,
        after: deactivated,
      })
    }

    return deactivated
  })
}

function authorizePlayerRosterAccess(actor: Actor, ownerId: string): boolean {
  authorize(actor, "team.roster.manage", { organizerId: ownerId })
  return actor.role === "PLATFORM_ADMIN" && actor.id !== ownerId
}
