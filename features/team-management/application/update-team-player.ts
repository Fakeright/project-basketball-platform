import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TeamPlayer, TeamPlayerDraft } from "@/features/team-management/domain/team"

import type { TeamRepository } from "./ports/team-repository"

export interface UpdateTeamPlayerInput {
  teamId: string
  playerId: string
  player: TeamPlayerDraft
}

export async function updateTeamPlayer(
  input: UpdateTeamPlayerInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamPlayer> {
  const team = await dependencies.teams.findById(input.teamId)
  if (!team) throw new Error("NOT_FOUND")

  const isOverride = authorizePlayerRosterAccess(actor, team.ownerId)
  if (!team.isActive) throw new Error("TEAM_INACTIVE")

  const player = (await dependencies.teams.listActivePlayers(team.id)).find(
    (candidate) => candidate.id === input.playerId,
  )
  if (!player) throw new Error("PLAYER_NOT_FOUND")

  return dependencies.teams.inTransaction(async (teams) => {
    const updated = await teams.updatePlayer(team.id, player.id, input.player)
    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.player_updated",
      entityId: team.id,
      before: player,
      after: updated,
    })
    if (isOverride) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.admin_override",
        entityId: team.id,
        before: player,
        after: updated,
      })
    }

    return updated
  })
}

function authorizePlayerRosterAccess(actor: Actor, ownerId: string): boolean {
  authorize(actor, "team.roster.manage", { organizerId: ownerId })
  return actor.role === "PLATFORM_ADMIN" && actor.id !== ownerId
}
