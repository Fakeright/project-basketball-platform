import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type {
  TeamFormat,
  TeamPlayer,
  TeamPlayerDraft,
  TeamSummary,
} from "@/features/team-management/domain/team"
import { projectTeamPlayerBatchAuditSnapshot } from "@/features/team-management/domain/team-player-audit"
import { assertTeamPlayerBatch } from "@/features/team-management/domain/team-player-batch-policy"
import { assertProvinceCode } from "@/features/provinces/application/assert-province-code"

import type {
  TeamMutationRepository,
  TeamRepository,
} from "./ports/team-repository"

export interface CreateTeamInput {
  name: string
  provinceCode: string
  format: TeamFormat
  players?: readonly TeamPlayerDraft[]
}

export interface CreateTeamResult {
  team: TeamSummary
  players: TeamPlayer[]
}

export async function createTeam(
  input: CreateTeamInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<CreateTeamResult> {
  assertProvinceCode(input.provinceCode)
  authorize(actor, "team.create", { organizerId: actor.id })
  const initialPlayers = input.players ?? []
  assertTeamPlayerBatch(initialPlayers, { allowEmpty: true })

  return dependencies.teams.inTransaction(async (teams) => {
    const team = await teams.create({
      name: input.name,
      provinceCode: input.provinceCode,
      format: input.format,
      ownerId: actor.id,
    })
    const players = initialPlayers.length > 0
      ? await teams.addPlayers(team.id, initialPlayers)
      : []

    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.created",
      entityId: team.id,
      after: { team, initialPlayerCount: players.length },
    })
    if (players.length > 0) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.players_added",
        entityId: team.id,
        after: projectTeamPlayerBatchAuditSnapshot(players, []),
      })
    }
    await appendOverrideAudit(teams, actor, team.id)

    return { team, players }
  })
}

async function appendOverrideAudit(
  teams: TeamMutationRepository,
  actor: Actor,
  teamId: string,
) {
  if (actor.role !== "PLATFORM_ADMIN") return

  await teams.appendAuditEvent({
    actorId: actor.id,
    action: "team.admin_override",
    entityId: teamId,
  })
}
