import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TeamPlayer, TeamPlayerDraft } from "@/features/team-management/domain/team"

import type { TeamRepository } from "./ports/team-repository"

const maximumPlayerBatchSize = 30

export interface AddTeamPlayersInput {
  teamId: string
  players: readonly TeamPlayerDraft[]
}

export async function addTeamPlayers(
  input: AddTeamPlayersInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamPlayer[]> {
  if (input.players.length === 0 || input.players.length > maximumPlayerBatchSize) {
    throw new Error("PLAYER_BATCH_INVALID")
  }

  return dependencies.teams.inTransaction(async (teams) => {
    const team = await teams.findByIdForUpdate(input.teamId)
    if (!team) throw new Error("NOT_FOUND")

    const isOverride = authorizePlayerRosterAccess(actor, team.ownerId)
    if (!team.isActive) throw new Error("TEAM_INACTIVE")

    const existingPlayers = await teams.findExistingPlayersByIdentities(
      team.id,
      input.players,
    )
    const reactivatedPlayerIds = existingPlayers
      .filter((player) => !player.isActive)
      .map((player) => player.id)
    const players = await teams.addPlayers(team.id, input.players)

    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.players_added",
      entityId: team.id,
      after: {
        playerIds: players.map((player) => player.id),
        reactivatedPlayerIds,
        count: players.length,
      },
    })
    if (isOverride) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.admin_override",
        entityId: team.id,
        after: { playerIds: players.map((player) => player.id), count: players.length },
      })
    }

    return players
  })
}

function authorizePlayerRosterAccess(actor: Actor, ownerId: string): boolean {
  authorize(actor, "team.roster.manage", { organizerId: ownerId })
  return actor.role === "PLATFORM_ADMIN" && actor.id !== ownerId
}
