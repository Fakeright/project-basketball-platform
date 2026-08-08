import type {
  LegacyTeamReconciliationContext,
  TeamRepository,
} from "./ports/team-repository"

export type LegacyTeamReconciliationIssue =
  | "LEGACY_PLAYERS_REQUIRE_MANUAL_REENTRY"
  | "LEGACY_COACHES_REQUIRE_REVIEW"
  | "TEAM_FORMAT_REQUIRES_REVIEW"

export interface LegacyTeamReconciliationSummary
  extends LegacyTeamReconciliationContext {
  activeLegacyMemberCount: number
  readyForLegacyRemoval: boolean
  issues: LegacyTeamReconciliationIssue[]
}

export function summarizeLegacyTeamReconciliation(
  context: LegacyTeamReconciliationContext,
): LegacyTeamReconciliationSummary {
  const issues: LegacyTeamReconciliationIssue[] = []
  if (context.activeLegacyPlayerCount > 0) {
    issues.push("LEGACY_PLAYERS_REQUIRE_MANUAL_REENTRY")
  }
  if (context.activeLegacyCoachCount > 0) {
    issues.push("LEGACY_COACHES_REQUIRE_REVIEW")
  }
  issues.push("TEAM_FORMAT_REQUIRES_REVIEW")

  return {
    ...context,
    activeLegacyMemberCount:
      context.activeLegacyPlayerCount + context.activeLegacyCoachCount,
    readyForLegacyRemoval: false,
    issues,
  }
}

export async function listLegacyTeamReconciliations(
  dependencies: {
    teams: Pick<TeamRepository, "listLegacyReconciliationContexts">
  },
  teamId?: string,
): Promise<LegacyTeamReconciliationSummary[]> {
  const contexts = await dependencies.teams.listLegacyReconciliationContexts(teamId)
  return contexts.map(summarizeLegacyTeamReconciliation)
}
