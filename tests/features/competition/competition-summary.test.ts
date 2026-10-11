import { describe, expect, it } from "vitest"

import { getCompetitionSummary } from "@/features/competition/application/get-competition-summary"

const matches = [
  {
    id: "semi-1",
    purpose: "STANDARD" as const,
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
    purpose: "STANDARD" as const,
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
    purpose: "CHAMPIONSHIP" as const,
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
  {
    id: "third-place",
    purpose: "THIRD_PLACE" as const,
    round: "ชิงอันดับ 3",
    roundSequence: 2,
    sequence: 2,
    homeTeamId: "team-2",
    homeTeam: "Chiang Mai Hoops",
    awayTeamId: "team-3",
    awayTeam: "Phuket Waves",
    homeScore: 74,
    awayScore: 70,
    winnerTeamId: "team-2",
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
    expect(summary.thirdPlace).toEqual({
      teamId: "team-2",
      teamName: "Chiang Mai Hoops",
    })
  })

  it("projects explicit placement matches even when the final is not last", () => {
    const summary = getCompetitionSummary(matches)

    expect(summary.winner).toEqual({
      teamId: "team-1",
      teamName: "Bangkok Five",
    })
    expect(summary.runnerUp).toEqual({
      teamId: "team-4",
      teamName: "Khon Kaen Rise",
    })
    expect(summary.thirdPlace).toEqual({
      teamId: "team-2",
      teamName: "Chiang Mai Hoops",
    })
    expect(summary.eliminatedByRound).toEqual([
      {
        roundSequence: 1,
        roundName: "รอบรองชนะเลิศ",
        teams: [
          { teamId: "team-3", teamName: "Phuket Waves" },
        ],
      },
    ])
  })

  it("does not infer a placement from an unclassified match", () => {
    const summary = getCompetitionSummary(
      matches.map((match) => ({ ...match, purpose: "STANDARD" as const })),
    )

    expect(summary.winner).toBeNull()
    expect(summary.runnerUp).toBeNull()
    expect(summary.thirdPlace).toBeNull()
  })
})
