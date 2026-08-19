import { describe, expect, it } from "vitest"

import { createDemoCompetitionFixtures } from "@/features/competition/infrastructure/demo-competition-fixtures"
import { getCompetitionSummary } from "@/features/competition/application/get-competition-summary"

describe("demo competition fixtures", () => {
  it("creates a six-team ongoing bracket with two Bye entries", () => {
    const ongoing = createDemoCompetitionFixtures().find(
      (fixture) => fixture.tournamentId === "tournament-ongoing",
    )

    expect(ongoing?.teams).toHaveLength(6)
    expect(ongoing?.matches).toHaveLength(5)
    expect(
      ongoing?.entries.filter((entry) => entry.startRoundSequence === 2),
    ).toHaveLength(2)
    expect(
      ongoing?.matches.filter((match) => match.status === "COMPLETED"),
    ).toHaveLength(2)
    expect(
      ongoing?.matches.filter((match) => match.roundSequence === 2),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ homeTeamId: expect.any(String), awayTeamId: expect.any(String) }),
        expect.objectContaining({ homeTeamId: expect.any(String), awayTeamId: expect.any(String) }),
      ]),
    )
  })

  it("creates a completed eight-team bracket with a confirmed final summary", () => {
    const completed = createDemoCompetitionFixtures().find(
      (fixture) => fixture.tournamentId === "tournament-completed",
    )

    expect(completed?.teams).toHaveLength(8)
    expect(completed?.matches).toHaveLength(7)
    expect(
      completed?.matches.every((match) => match.status === "COMPLETED"),
    ).toBe(true)

    const summary = getCompetitionSummary(
      completed?.matches.map((match) => ({
        ...match,
        round: match.roundName,
        homeTeam: completed.teamNames.get(match.homeTeamId ?? "") ?? "",
        awayTeam: completed.teamNames.get(match.awayTeamId ?? "") ?? "",
      })) ?? [],
    )
    expect(summary.winner?.teamName).toBe("Bangkok Arrows")
    expect(summary.runnerUp?.teamName).toBe("Phuket Waves")
    expect(summary.eliminatedByRound).toHaveLength(2)
  })
})
