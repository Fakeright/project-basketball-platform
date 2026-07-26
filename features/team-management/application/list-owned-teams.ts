import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TeamSummary } from "@/features/team-management/domain/team"

import type { TeamRepository } from "./ports/team-repository"

export async function listOwnedTeams(
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamSummary[]> {
  authorize(actor, "team.update", { organizerId: actor.id })
  return dependencies.teams.listByOwner(actor.id)
}
