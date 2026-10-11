import { describe, expect, it } from "vitest"

describe("TeamPlayer audit retention report", () => {
  it("reports historical PII keys by audit id without returning their values", async () => {
    const auditModule = await import(
      "@/features/team-management/domain/team-player-audit"
    ) as Record<string, unknown>
    const createReport = auditModule.createTeamPlayerAuditPiiReport

    expect(typeof createReport).toBe("function")
    if (typeof createReport !== "function") return

    const report = createReport([
      {
        id: "audit-old",
        action: "team.player_updated",
        beforeJson: {
          id: "player-1",
          firstName: "Sensitive",
          nested: [{ phone: "0800000000" }],
        },
        afterJson: { playerId: "player-1", teamId: "team-1", isActive: true },
      },
      {
        id: "audit-safe",
        action: "team.player_deactivated",
        beforeJson: { playerId: "player-2", teamId: "team-1", isActive: true },
        afterJson: { playerId: "player-2", teamId: "team-1", isActive: false },
      },
    ]) as unknown

    expect(report).toEqual({
      eventsScanned: 2,
      eventsWithPlayerPii: 1,
      containsHistoricalPlayerPii: true,
      findings: [
        {
          auditLogId: "audit-old",
          action: "team.player_updated",
          snapshots: ["beforeJson"],
          piiKeys: ["firstName", "phone"],
        },
      ],
    })
    expect(JSON.stringify(report)).not.toContain("Sensitive")
    expect(JSON.stringify(report)).not.toContain("0800000000")
  })
})
