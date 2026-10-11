import { describe, expect, it } from "vitest"

import {
  assertBracketStructureMutable,
  assertEntriesCanBeLocked,
  validateSeeds,
} from "@/features/competition/domain/bracket-policy"

describe("competition bracket policy", () => {
  it("allows locking 2-32 approved teams after registration closes", () => {
    expect(() =>
      assertEntriesCanBeLocked({
        tournamentStatus: "REGISTRATION_CLOSED",
        approvedTeamIds: ["team-1", "team-2"],
        capacity: 6,
      }),
    ).not.toThrow()
  })

  it.each([1, 33])("rejects %s entries", (count) => {
    expect(() =>
      assertEntriesCanBeLocked({
        tournamentStatus: "REGISTRATION_CLOSED",
        approvedTeamIds: Array.from(
          { length: count },
          (_, index) => `team-${index}`,
        ),
        capacity: 32,
      }),
    ).toThrow("BRACKET_ENTRY_COUNT_INVALID")
  })

  it("rejects locking entries before registration closes", () => {
    expect(() =>
      assertEntriesCanBeLocked({
        tournamentStatus: "PUBLISHED",
        approvedTeamIds: ["team-1", "team-2"],
        capacity: 2,
      }),
    ).toThrow("BRACKET_ENTRY_LOCK_UNAVAILABLE")
  })

  it("rejects duplicate, incomplete, and out-of-range seeds", () => {
    expect(() =>
      validateSeeds([
        { entryId: "entry-1", seed: 1 },
        { entryId: "entry-2", seed: 1 },
      ]),
    ).toThrow("BRACKET_SEED_INVALID")

    expect(() =>
      validateSeeds([
        { entryId: "entry-1", seed: 1 },
        { entryId: "entry-2", seed: 3 },
      ]),
    ).toThrow("BRACKET_SEED_INVALID")
  })

  it("locks structure after a match starts", () => {
    expect(() => assertBracketStructureMutable({ hasStartedMatch: true })).toThrow(
      "BRACKET_STRUCTURE_LOCKED",
    )
  })
})
