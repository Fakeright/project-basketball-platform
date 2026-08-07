import type { Actor, Role } from "@/features/identity/domain/actor"

import type { TeamRepository } from "./ports/team-repository"
import { authorizeTeamAccess } from "./team-access"

export interface TeamMemberCandidate {
  id: string
  displayName: string
  role: Extract<Role, "PLAYER">
}

export async function listTeamMemberCandidates(
  teamId: string,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamMemberCandidate[]> {
  const team = await dependencies.teams.findById(teamId)
  if (!team) throw new Error("NOT_FOUND")

  authorizeTeamAccess(actor, "team.roster.manage", team)
  const candidates = await dependencies.teams.listUsersByRoles(["PLAYER"])

  return candidates as TeamMemberCandidate[]
}
