import { describe, expect, it } from "vitest"

import {
  assertRosterAgeEligibility,
  PlayerAgeIneligibleError,
  TournamentAgeGroupUnsupportedError,
} from "@/features/registrations/domain/player-age-policy"
import type { TeamPlayer } from "@/features/team-management/domain/team"

function player(id: string, birthDate: string): TeamPlayer {
  return {
    id,
    teamId: "team-1",
    firstName: "Player",
    lastName: id,
    nickname: null,
    birthDate,
    jerseyNumber: null,
    position: null,
    phone: null,
    isActive: true,
    deactivatedAt: null,
    createdAt: "2026-08-07T00:00:00.000Z",
    updatedAt: "2026-08-07T00:00:00.000Z",
  }
}

describe("assertRosterAgeEligibility", () => {
  it("requires U18 players to be strictly younger than 18 on the start date", () => {
    expect(() =>
      assertRosterAgeEligibility("U18", "2026-11-15T02:00:00.000Z", [
        player("eligible", "2008-11-16"),
      ]),
    ).not.toThrow()

    let caught: unknown
    try {
      assertRosterAgeEligibility("U18", "2026-11-15T02:00:00.000Z", [
        player("ineligible", "2008-11-15"),
      ])
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(PlayerAgeIneligibleError)
    expect(caught).toMatchObject({
      message: "PLAYER_AGE_INELIGIBLE",
      details: { playerIds: ["ineligible"] },
    })
  })

  it("uses completed calendar years for leap-day birthdays", () => {
    const leapDayPlayer = player("leap-day", "2008-02-29")

    expect(() =>
      assertRosterAgeEligibility("U18", "2026-02-28T12:00:00.000Z", [
        leapDayPlayer,
      ]),
    ).not.toThrow()
    expect(() =>
      assertRosterAgeEligibility("U18", "2026-03-01T00:00:00.000Z", [
        leapDayPlayer,
      ]),
    ).toThrow("PLAYER_AGE_INELIGIBLE")
  })

  it("does not apply an age limit to Open tournaments", () => {
    expect(() =>
      assertRosterAgeEligibility("Open", "2026-11-15T02:00:00.000Z", [
        player("adult", "1980-01-01"),
      ]),
    ).not.toThrow()
  })

  it("fails closed for an unknown persisted age group", () => {
    expect(() =>
      assertRosterAgeEligibility("U20", "2026-11-15T02:00:00.000Z", [
        player("player-1", "2010-01-01"),
      ]),
    ).toThrow(TournamentAgeGroupUnsupportedError)
    expect(() =>
      assertRosterAgeEligibility("U20", "2026-11-15T02:00:00.000Z", []),
    ).toThrow("TOURNAMENT_AGE_GROUP_UNSUPPORTED")
  })
})
