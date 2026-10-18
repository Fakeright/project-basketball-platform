import { describe, expect, it } from "vitest"

import {
  generateSingleEliminationBracket,
  generateOrderedSingleEliminationBracket,
  mirroredSeedOrder,
} from "@/features/competition/domain/bracket-generator"

function seededEntries(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    entryId: `entry-${index + 1}`,
    teamId: `team-${index + 1}`,
    seed: index + 1,
  }))
}

describe("single elimination generator", () => {
  it("pairs adjacent ordered teams and links their winners", () => {
    const plan = generateOrderedSingleEliminationBracket({
      entries: Array.from({ length: 8 }, (_, index) => ({
        entryId: `entry-${index + 1}`,
        teamId: `team-${index + 1}`,
        position: index + 1,
      })),
    })

    expect(plan.matches.filter((match) => match.roundSequence === 1).map((match) => [
      match.homeTeamId,
      match.awayTeamId,
      match.nextMatchKey,
    ])).toEqual([
      ["team-1", "team-2", "round-2-match-1"],
      ["team-3", "team-4", "round-2-match-1"],
      ["team-5", "team-6", "round-2-match-2"],
      ["team-7", "team-8", "round-2-match-2"],
    ])
    expect(plan.matches.filter((match) => match.roundSequence === 2).map((match) => match.nextMatchKey)).toEqual([
      "round-3-match-1",
      "round-3-match-1",
    ])
    expect(plan.entryStarts.every((entry) => entry.roundSequence === 1)).toBe(true)
  })

  it.each([8, 16, 32])("creates %i-team ordered brackets without byes", (count) => {
    const plan = generateOrderedSingleEliminationBracket({
      entries: Array.from({ length: count }, (_, index) => ({
        entryId: `entry-${index + 1}`,
        teamId: `team-${index + 1}`,
        position: index + 1,
      })),
    })

    expect(plan.matches).toHaveLength(count - 1)
    expect(plan.matches.filter((match) => match.purpose === "CHAMPIONSHIP")).toHaveLength(1)
  })

  it.each([
    [2, [1, 2]],
    [4, [1, 4, 2, 3]],
    [8, [1, 8, 4, 5, 2, 7, 3, 6]],
    [16, [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11]],
  ])("creates mirrored order for size %s", (size, expected) => {
    expect(mirroredSeedOrder(size)).toEqual(expected)
  })

  it.each([2, 6, 10, 14, 32])(
    "creates N-1 real matches for %s teams",
    (count) => {
      const plan = generateSingleEliminationBracket({
        entries: seededEntries(count),
      })

      expect(plan.matches).toHaveLength(count - 1)
      expect(plan.matches.filter((match) => match.nextMatchKey === null)).toHaveLength(
        1,
      )
    },
  )

  it("starts seeds 1 and 2 in the semifinal for six teams", () => {
    const plan = generateSingleEliminationBracket({ entries: seededEntries(6) })

    expect(plan.entryStarts).toEqual(
      expect.arrayContaining([
        { entryId: "entry-1", roundSequence: 2 },
        { entryId: "entry-2", roundSequence: 2 },
      ]),
    )
  })

  it("classifies exactly one terminal match as the championship", () => {
    const plan = generateSingleEliminationBracket({ entries: seededEntries(6) })
    const championshipMatches = plan.matches.filter(
      (match) => match.purpose === "CHAMPIONSHIP",
    )

    expect(championshipMatches).toHaveLength(1)
    expect(championshipMatches[0]?.nextMatchKey).toBeNull()
    expect(
      plan.matches
        .filter((match) => match.nextMatchKey !== null)
        .every((match) => match.purpose === "STANDARD"),
    ).toBe(true)
  })

  it("keeps round-one match positions and connects each winner once", () => {
    const plan = generateSingleEliminationBracket({ entries: seededEntries(6) })
    const firstRoundMatches = plan.matches.filter(
      (match) => match.roundSequence === 1,
    )

    expect(firstRoundMatches.map((match) => match.sequence)).toEqual([2, 4])
    expect(firstRoundMatches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          homeTeamId: "team-4",
          awayTeamId: "team-5",
          nextSlot: "AWAY",
        }),
        expect.objectContaining({
          homeTeamId: "team-3",
          awayTeamId: "team-6",
          nextSlot: "AWAY",
        }),
      ]),
    )
  })

  it("rejects invalid bracket size and duplicate seeds", () => {
    expect(() => mirroredSeedOrder(6)).toThrow("BRACKET_SIZE_INVALID")
    expect(() =>
      generateSingleEliminationBracket({
        entries: [
          { entryId: "entry-1", teamId: "team-1", seed: 1 },
          { entryId: "entry-2", teamId: "team-2", seed: 1 },
        ],
      }),
    ).toThrow("BRACKET_SEED_INVALID")
  })
})
