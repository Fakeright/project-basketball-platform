import type { Actor } from "@/features/identity/domain/actor"
import type { TeamSummary } from "@/features/team-management/domain/team"
import { assertProvinceCode } from "@/features/provinces/application/assert-province-code"

import type { CreateTeamInput } from "./create-team"
import { authorizeTeamAccess } from "./team-access"
import type { TeamRepository } from "./ports/team-repository"

export interface UpdateTeamInput extends CreateTeamInput {
  teamId: string
  expectedVersion: number
}

export async function updateTeam(
  input: UpdateTeamInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamSummary> {
  assertProvinceCode(input.provinceCode)
  return dependencies.teams.inTransaction(async (teams) => {
    const team = await teams.findByIdForUpdate(input.teamId)
    if (!team) throw new Error("NOT_FOUND")

    const isOverride = authorizeTeamAccess(actor, "team.update", team)
    if (team.version !== input.expectedVersion) throw new Error("CONFLICT")

    if (
      team.format !== input.format &&
      (await teams.hasActiveRegistration(team.id))
    ) {
      throw new Error("TEAM_FORMAT_CHANGE_BLOCKED")
    }

    const updated = await teams.update(team.id, {
      name: input.name,
      provinceCode: input.provinceCode,
      format: input.format,
      expectedVersion: input.expectedVersion,
    })

    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.updated",
      entityId: team.id,
      before: team,
      after: updated,
    })
    if (isOverride) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.admin_override",
        entityId: team.id,
        before: team,
        after: updated,
      })
    }

    return updated
  })
}
