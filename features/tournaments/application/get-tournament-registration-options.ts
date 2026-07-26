import type { Actor } from "@/features/identity/domain/actor"
import { listOwnedTeams } from "@/features/team-management/application/list-owned-teams"
import type { TeamRepository } from "@/features/team-management/application/ports/team-repository"
import type { Tournament } from "@/features/tournaments/domain/tournament"

export async function getTournamentRegistrationOptions(
  tournament: Pick<Tournament, "status">,
  actor: Actor | null,
  dependencies: { teams: TeamRepository },
) {
  if (tournament.status !== "OPEN" || actor?.role !== "TEAM_MANAGER") {
    return []
  }

  const teams = await listOwnedTeams(actor, dependencies)
  return teams.map((team) => ({ id: team.id, name: team.name }))
}
