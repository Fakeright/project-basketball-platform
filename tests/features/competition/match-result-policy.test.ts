import { describe, expect, it } from "vitest"

import {
  assertScoreCanBeConfirmed,
  decideMatchAdvancement,
} from "@/features/competition/domain/match-result-policy"

describe("competition match result policy", () => {
  it.each([
    [10, 10],
    [-1, 2],
    [1.5, 2],
  ])("rejects invalid score %s-%s", (homeScore, awayScore) => {
    expect(() => assertScoreCanBeConfirmed({ homeScore, awayScore })).toThrow(
      "MATCH_SCORE_INVALID",
    )
  })

  it("selects the winner and its next match slot", () => {
    expect(
      decideMatchAdvancement({
        homeTeamId: "team-home",
        awayTeamId: "team-away",
        homeScore: 71,
        awayScore: 65,
        nextMatchId: "match-2",
        nextSlot: "AWAY",
      }),
    ).toEqual({
      winnerTeamId: "team-home",
      nextMatchId: "match-2",
      nextSlot: "AWAY",
    })
  })

  it("allows a final winner with no downstream match", () => {
    expect(
      decideMatchAdvancement({
        homeTeamId: "team-home",
        awayTeamId: "team-away",
        homeScore: 66,
        awayScore: 70,
        nextMatchId: null,
        nextSlot: null,
      }),
    ).toEqual({
      winnerTeamId: "team-away",
      nextMatchId: null,
      nextSlot: null,
    })
  })
})
