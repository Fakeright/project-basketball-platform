import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TeamSummary } from "@/features/team-management/domain/team"

import type { TeamRepository } from "./ports/team-repository"

export interface CreateTeamInput {
  name: string
  province: string
}

export async function createTeam(
  input: CreateTeamInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamSummary> {
  authorize(actor, "team.create", { organizerId: actor.id })
  const team = await dependencies.teams.create({ ...input, ownerId: actor.id })

  await dependencies.teams.appendAuditEvent({
    actorId: actor.id,
    action: "team.created",
    entityId: team.id,
    after: team,
  })
  await appendOverrideAudit(dependencies.teams, actor, team.id)

  return team
}

async function appendOverrideAudit(
  teams: TeamRepository,
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
