import { describe, expect, it } from "vitest"

import type {
  TeamPlayer,
  TeamRosterMember,
} from "@/features/team-management/domain/team"
import {
  assertLegacyRegistrationRosterEligibility,
  assertRosterEligibility,
} from "@/features/team-management/domain/team-policy"

function player(id: string, isActive = true): TeamPlayer {
  return {
    id,
    teamId: "team-1",
    firstName: `Player ${id}`,
    lastName: "Test",
    nickname: null,
    birthDate: "2008-01-01",
    jerseyNumber: Number(id),
    position: null,
    phone: null,
    isActive,
    deactivatedAt: null,
    createdAt: "2026-08-07T00:00:00.000Z",
    updatedAt: "2026-08-07T00:00:00.000Z",
  }
}

function legacyMember(
  id: string,
  role: TeamRosterMember["role"],
): TeamRosterMember {
  return {
    id,
    userId: `user-${id}`,
    role,
    isActive: true,
    deactivatedAt: null,
  }
}

describe("assertRosterEligibility", () => {
  it("requires five active players for a 5v5 application", () => {
    expect(() =>
      assertRosterEligibility("FIVE_V_FIVE", [1, 2, 3, 4].map(String).map((id) => player(id))),
    ).toThrow(
      "ROSTER_INCOMPLETE",
    )
    expect(() =>
      assertRosterEligibility("FIVE_V_FIVE", [1, 2, 3, 4, 5].map(String).map((id) => player(id))),
    ).not.toThrow()
  })

  it("requires three active players for a 3v3 application", () => {
    expect(() =>
      assertRosterEligibility("THREE_V_THREE", [1, 2].map(String).map((id) => player(id))),
    ).toThrow(
      "ROSTER_INCOMPLETE",
    )
    expect(() =>
      assertRosterEligibility("THREE_V_THREE", [1, 2, 3].map(String).map((id) => player(id))),
    ).not.toThrow()
  })

  it("does not count inactive players", () => {
    expect(() =>
      assertRosterEligibility("FIVE_V_FIVE", [
        ...[1, 2, 3, 4].map(String).map((id) => player(id)),
        player("5", false),
      ]),
    ).toThrow("ROSTER_INCOMPLETE")
  })
})

describe("assertLegacyRegistrationRosterEligibility", () => {
  it("does not count legacy coaches as players", () => {
    expect(() =>
      assertLegacyRegistrationRosterEligibility("THREE_V_THREE", [
        legacyMember("player-1", "PLAYER"),
        legacyMember("player-2", "PLAYER"),
        legacyMember("coach-1", "COACH"),
      ]),
    ).toThrow("ROSTER_INCOMPLETE")
  })
})
