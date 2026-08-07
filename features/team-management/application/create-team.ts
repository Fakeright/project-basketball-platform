import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TeamFormat, TeamSummary } from "@/features/team-management/domain/team"
import { assertProvinceCode } from "@/features/provinces/application/assert-province-code"

import type {
  TeamMutationRepository,
  TeamRepository,
} from "./ports/team-repository"

export interface CreateTeamInput {
  name: string
  provinceCode: string
  format: TeamFormat
}

export async function createTeam(
  input: CreateTeamInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamSummary> {
  assertProvinceCode(input.provinceCode)
  authorize(actor, "team.create", { organizerId: actor.id })
  return dependencies.teams.inTransaction(async (teams) => {
    const team = await teams.create({ ...input, ownerId: actor.id })

    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.created",
      entityId: team.id,
      after: team,
    })
    await appendOverrideAudit(teams, actor, team.id)

    return team
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
