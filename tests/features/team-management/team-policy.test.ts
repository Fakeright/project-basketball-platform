import { describe, expect, it } from "vitest"

import type { TeamRosterMember } from "@/features/team-management/domain/team"
import { assertRosterEligibility } from "@/features/team-management/domain/team-policy"

function rosterWithPlayers(count: number): TeamRosterMember[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    userId: `user-${index + 1}`,
    role: "PLAYER",
    isActive: true,
    deactivatedAt: null,
  }))
}

describe("assertRosterEligibility", () => {
  it("requires five active players for a 5v5 application", () => {
    expect(() => assertRosterEligibility("FIVE_V_FIVE", rosterWithPlayers(4))).toThrow(
      "ROSTER_INCOMPLETE",
    )
    expect(() => assertRosterEligibility("FIVE_V_FIVE", rosterWithPlayers(5))).not.toThrow()
  })

  it("requires three active players for a 3v3 application", () => {
    expect(() => assertRosterEligibility("THREE_V_THREE", rosterWithPlayers(2))).toThrow(
      "ROSTER_INCOMPLETE",
    )
    expect(() => assertRosterEligibility("THREE_V_THREE", rosterWithPlayers(3))).not.toThrow()
  })

  it("ignores deactivated members when counting players", () => {
    const roster = rosterWithPlayers(4)
    roster.push({
      id: "deactivated-player",
      userId: "deactivated-user",
      role: "PLAYER",
      isActive: false,
      deactivatedAt: "2026-07-26T05:00:00.000Z",
    })

    expect(() => assertRosterEligibility("FIVE_V_FIVE", roster)).toThrow("ROSTER_INCOMPLETE")
  })

  it("rejects more than one active coach", () => {
    const roster = rosterWithPlayers(5)
    roster.push(
      {
        id: "coach-1",
        userId: "coach-user-1",
        role: "COACH",
        isActive: true,
        deactivatedAt: null,
      },
      {
        id: "coach-2",
        userId: "coach-user-2",
        role: "COACH",
        isActive: true,
        deactivatedAt: null,
      },
    )

    expect(() => assertRosterEligibility("FIVE_V_FIVE", roster)).toThrow("ROSTER_COACH_LIMIT_EXCEEDED")
  })
})
