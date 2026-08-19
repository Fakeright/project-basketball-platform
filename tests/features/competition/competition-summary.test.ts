import { describe, expect, it } from "vitest"

import { getCompetitionSummary } from "@/features/competition/application/get-competition-summary"

const matches = [
  {
    id: "semi-1",
    round: "รอบรองชนะเลิศ",
    roundSequence: 1,
    sequence: 1,
    homeTeamId: "team-1",
    homeTeam: "Bangkok Five",
    awayTeamId: "team-2",
    awayTeam: "Chiang Mai Hoops",
    homeScore: 70,
    awayScore: 60,
    winnerTeamId: "team-1",
  },
  {
    id: "semi-2",
    round: "รอบรองชนะเลิศ",
    roundSequence: 1,
    sequence: 2,
    homeTeamId: "team-3",
    homeTeam: "Phuket Waves",
    awayTeamId: "team-4",
    awayTeam: "Khon Kaen Rise",
    homeScore: 65,
    awayScore: 68,
    winnerTeamId: "team-4",
  },
  {
    id: "final",
    round: "รอบชิงชนะเลิศ",
    roundSequence: 2,
    sequence: 1,
    homeTeamId: "team-1",
    homeTeam: "Bangkok Five",
    awayTeamId: "team-4",
    awayTeam: "Khon Kaen Rise",
    homeScore: 82,
    awayScore: 78,
    winnerTeamId: "team-1",
  },
]

describe("getCompetitionSummary", () => {
  it("does not announce winner or runner-up before the final is confirmed", () => {
    const summary = getCompetitionSummary(
      matches.map((match) =>
        match.id === "final"
          ? { ...match, homeScore: null, awayScore: null, winnerTeamId: null }
          : match,
      ),
    )

    expect(summary.winner).toBeNull()
    expect(summary.runnerUp).toBeNull()
  })

  it("projects winner, runner-up, and other teams by elimination round", () => {
    const summary = getCompetitionSummary(matches)

    expect(summary.winner).toEqual({
      teamId: "team-1",
      teamName: "Bangkok Five",
    })
    expect(summary.runnerUp).toEqual({
      teamId: "team-4",
      teamName: "Khon Kaen Rise",
    })
    expect(summary.eliminatedByRound).toEqual([
      {
        roundSequence: 1,
        roundName: "รอบรองชนะเลิศ",
        teams: [
          { teamId: "team-2", teamName: "Chiang Mai Hoops" },
          { teamId: "team-3", teamName: "Phuket Waves" },
        ],
      },
    ])
  })
})
