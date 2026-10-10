import type {
  LegacyTeamReconciliationContext,
  TeamRepository,
} from "./ports/team-repository"

export type LegacyTeamReconciliationIssue =
  | "LEGACY_PLAYERS_REQUIRE_MANUAL_REENTRY"
  | "LEGACY_COACHES_REQUIRE_REVIEW"
  | "INACTIVE_LEGACY_HISTORY_REQUIRES_PRESERVATION"
  | "TEAM_FORMAT_REQUIRES_REVIEW"

export interface LegacyTeamReconciliationSummary
  extends LegacyTeamReconciliationContext {
  activeLegacyMemberCount: number
  inactiveLegacyMemberCount: number
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
  if (
    context.inactiveLegacyPlayerCount > 0 ||
    context.inactiveLegacyCoachCount > 0
  ) {
    issues.push("INACTIVE_LEGACY_HISTORY_REQUIRES_PRESERVATION")
  }
  issues.push("TEAM_FORMAT_REQUIRES_REVIEW")

  return {
    ...context,
    activeLegacyMemberCount:
      context.activeLegacyPlayerCount + context.activeLegacyCoachCount,
    inactiveLegacyMemberCount:
      context.inactiveLegacyPlayerCount + context.inactiveLegacyCoachCount,
    readyForLegacyRemoval: context.totalLegacyMemberCount === 0,
    issues,
  }
}

export function createLegacyTeamReconciliationAuditReport(
  teams: LegacyTeamReconciliationSummary[],
) {
  return {
    legacyTeamReconciliation: {
      teamCount: teams.length,
      readyForLegacyRemoval: teams.every((team) => team.readyForLegacyRemoval),
      teams,
    },
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
