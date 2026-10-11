import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TeamRepository } from "@/features/team-management/application/ports/team-repository"
import {
  projectReusableTeamPlayers,
  type ReusableTeamPlayer,
} from "@/features/team-management/domain/team-player-history"

export async function listReusableTeamPlayers(
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<ReusableTeamPlayer[]> {
  authorize(actor, "team.create", { organizerId: actor.id })
  const sources = await dependencies.teams.listPlayerHistoryByOwner(actor.id)
  return projectReusableTeamPlayers(sources)
}
