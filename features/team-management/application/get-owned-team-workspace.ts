import type { Actor } from "@/features/identity/domain/actor"
import type {
  TeamPlayer,
  TeamSummary,
} from "@/features/team-management/domain/team"

import { authorizeTeamAccess } from "./team-access"
import {
  listLegacyTeamReconciliations,
  type LegacyTeamReconciliationSummary,
} from "./legacy-team-reconciliation"
import type { TeamRepository } from "./ports/team-repository"

export interface OwnedTeamWorkspace {
  team: TeamSummary
  players: TeamPlayer[]
  legacyReconciliation: LegacyTeamReconciliationSummary | null
}

export async function getOwnedTeamWorkspace(
  teamId: string,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<OwnedTeamWorkspace> {
  const team = await dependencies.teams.findById(teamId)
  if (!team) throw new Error("NOT_FOUND")

  authorizeTeamAccess(actor, "team.update", team)
  const [players, legacyReconciliations] = await Promise.all([
    dependencies.teams.listActivePlayers(team.id),
    listLegacyTeamReconciliations(dependencies, team.id),
  ])

  return {
    team,
    players,
    legacyReconciliation: legacyReconciliations[0] ?? null,
  }
}
