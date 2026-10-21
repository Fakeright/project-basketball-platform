import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"

import type {
  AdminTeamDetail,
  AdminTeamListItem,
  AdminTeamReadRepository,
} from "./ports/admin-team-read-repository"

export async function listAdminTeams(
  actor: Actor,
  dependencies: { teams: AdminTeamReadRepository },
): Promise<AdminTeamListItem[]> {
  assertAdminTeamAccess(actor)
  return dependencies.teams.listAll()
}

export async function getAdminTeamDetail(
  teamId: string,
  actor: Actor,
  dependencies: { teams: AdminTeamReadRepository },
): Promise<AdminTeamDetail> {
  assertAdminTeamAccess(actor)
  const team = await dependencies.teams.findById(teamId)
  if (!team) throw new Error("NOT_FOUND")
  return team
}

function assertAdminTeamAccess(actor: Actor): void {
  if (actor.role !== "PLATFORM_ADMIN") throw new Error("NOT_FOUND")
  authorize(actor, "team.read")
}
