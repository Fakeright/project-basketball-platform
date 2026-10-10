import { describe, expect, it } from "vitest"

import * as reconciliation from "@/features/team-management/application/legacy-team-reconciliation"

describe("legacy team member audit report", () => {
  it("reports inactive-only history as not ready for legacy removal", () => {
    const createReport = (
      reconciliation as typeof reconciliation & {
        createLegacyTeamReconciliationAuditReport?: (
          teams: reconciliation.LegacyTeamReconciliationSummary[],
        ) => unknown
      }
    ).createLegacyTeamReconciliationAuditReport

    expect(createReport).toBeTypeOf("function")
    if (!createReport) return

    expect(
      createReport([
        {
          teamId: "team-inactive-only",
          format: "FIVE_V_FIVE",
          activeLegacyPlayerCount: 0,
          activeLegacyCoachCount: 0,
          inactiveLegacyPlayerCount: 2,
          inactiveLegacyCoachCount: 1,
          totalLegacyMemberCount: 3,
          activeLegacyMemberCount: 0,
          inactiveLegacyMemberCount: 3,
          activeTeamPlayerCount: 0,
          registrationHistoryCount: 0,
          registrationStatusCounts: {
            PENDING: 0,
            APPROVED: 0,
            REJECTED: 0,
            CANCELLED: 0,
            WITHDRAWN: 0,
          },
          readyForLegacyRemoval: false,
          issues: [
            "INACTIVE_LEGACY_HISTORY_REQUIRES_PRESERVATION",
            "TEAM_FORMAT_REQUIRES_REVIEW",
          ],
        },
      ]),
    ).toEqual({
      legacyTeamReconciliation: {
        teamCount: 1,
        readyForLegacyRemoval: false,
        teams: [expect.objectContaining({
          teamId: "team-inactive-only",
          inactiveLegacyMemberCount: 3,
          totalLegacyMemberCount: 3,
        })],
      },
    })
  })
})
