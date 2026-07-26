import type { Actor } from "@/features/identity/domain/actor"
import type { TeamSummary } from "@/features/team-management/domain/team"

import { authorizeTeamAccess } from "./team-access"
import type { TeamRepository } from "./ports/team-repository"

export interface UpdateTeamInput {
  teamId: string
  name: string
  province: string
}

export async function updateTeam(
  input: UpdateTeamInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamSummary> {
  const team = await dependencies.teams.findById(input.teamId)
  if (!team) throw new Error("NOT_FOUND")

  const isOverride = authorizeTeamAccess(actor, "team.update", team)
  const updated = await dependencies.teams.update(team.id, {
    name: input.name,
    province: input.province,
  })

  await dependencies.teams.appendAuditEvent({
    actorId: actor.id,
    action: "team.updated",
    entityId: team.id,
    before: team,
    after: updated,
  })
  if (isOverride) {
    await dependencies.teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.admin_override",
      entityId: team.id,
      before: team,
      after: updated,
    })
  }

  return updated
}
