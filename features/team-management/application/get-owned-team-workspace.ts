import type { Actor } from "@/features/identity/domain/actor"
import type { TeamRosterMember, TeamSummary } from "@/features/team-management/domain/team"

import { authorizeTeamAccess } from "./team-access"
import type { TeamRepository } from "./ports/team-repository"

export interface OwnedTeamWorkspace {
  team: TeamSummary
  members: TeamRosterMember[]
}

export async function getOwnedTeamWorkspace(
  teamId: string,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<OwnedTeamWorkspace> {
  const team = await dependencies.teams.findById(teamId)
  if (!team) throw new Error("NOT_FOUND")

  authorizeTeamAccess(actor, "team.update", team)
  const members = await dependencies.teams.listActiveMembers(team.id)

  return { team, members }
}
