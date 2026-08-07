import type { Actor } from "@/features/identity/domain/actor"
import type {
  TeamPlayer,
  TeamSummary,
} from "@/features/team-management/domain/team"

import { authorizeTeamAccess } from "./team-access"
import type { TeamRepository } from "./ports/team-repository"

export interface OwnedTeamWorkspace {
  team: TeamSummary
  players: TeamPlayer[]
}

export async function getOwnedTeamWorkspace(
  teamId: string,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<OwnedTeamWorkspace> {
  const team = await dependencies.teams.findById(teamId)
  if (!team) throw new Error("NOT_FOUND")

  authorizeTeamAccess(actor, "team.update", team)
  const players = await dependencies.teams.listActivePlayers(team.id)

  return { team, players }
}
