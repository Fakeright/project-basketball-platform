import { describe, expect, it } from "vitest"

import type {
  TeamPlayer,
  TeamPlayerDraft,
} from "@/features/team-management/domain/team"
import {
  assertTeamPlayerBatch,
  maximumTeamPlayerBatchSize,
} from "@/features/team-management/domain/team-player-batch-policy"
import {
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

function draft(index: number): TeamPlayerDraft {
  return {
    firstName: `Player ${index}`,
    lastName: "Test",
    nickname: null,
    birthDate: "2008-01-01",
    jerseyNumber: index,
    position: null,
    phone: null,
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

describe("assertTeamPlayerBatch", () => {
  it("allows an empty batch only when configured to do so", () => {
    expect(() => assertTeamPlayerBatch([], { allowEmpty: true })).not.toThrow()
    expect(() => assertTeamPlayerBatch([], { allowEmpty: false })).toThrow(
      "PLAYER_BATCH_INVALID",
    )
  })

  it("accepts at most 30 players", () => {
    expect(maximumTeamPlayerBatchSize).toBe(30)
    expect(() =>
      assertTeamPlayerBatch(
        Array.from({ length: maximumTeamPlayerBatchSize }, (_, index) => draft(index + 1)),
        { allowEmpty: true },
      ),
    ).not.toThrow()
    expect(() =>
      assertTeamPlayerBatch(
        Array.from({ length: maximumTeamPlayerBatchSize + 1 }, (_, index) =>
          draft(index + 1),
        ),
        { allowEmpty: true },
      ),
    ).toThrow("PLAYER_BATCH_INVALID")
  })

  it("rejects duplicate normalized player identities", () => {
    expect(() =>
      assertTeamPlayerBatch(
        [draft(1), { ...draft(2), firstName: " PLAYER 1 " }],
        { allowEmpty: true },
      ),
    ).toThrow("PLAYER_ALREADY_EXISTS")
  })

  it("rejects duplicate non-null jerseys but allows multiple null jerseys", () => {
    expect(() =>
      assertTeamPlayerBatch(
        [draft(1), { ...draft(2), jerseyNumber: 1 }],
        { allowEmpty: true },
      ),
    ).toThrow("JERSEY_ALREADY_IN_USE")

    expect(() =>
      assertTeamPlayerBatch(
        [
          { ...draft(1), jerseyNumber: null },
          { ...draft(2), jerseyNumber: null },
        ],
        { allowEmpty: true },
      ),
    ).not.toThrow()
  })
})
