import { describe, expect, it } from "vitest"

import {
  generateSingleEliminationBracket,
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
