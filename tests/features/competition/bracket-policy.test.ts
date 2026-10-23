/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ features/competition/domain/bracket-policy.ts โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { describe, expect, it } from "vitest"

import {
  assertBracketStructureMutable,
  assertEntriesCanBeLocked,
  assertSystemBracketEntryCount,
  validateOrderedPositions,
  validateSeeds,
} from "@/features/competition/domain/bracket-policy"

describe("competition bracket policy", () => {
  it.each([8, 16, 32])("accepts %i entries for system generation", (count) => {
    expect(() => assertSystemBracketEntryCount(count)).not.toThrow()
  })

  it.each([2, 6, 10, 12, 14, 24])("rejects %i entries for system generation", (count) => {
    expect(() => assertSystemBracketEntryCount(count)).toThrow("BRACKET_ENTRY_COUNT_UNSUPPORTED")
  })

  it("rejects duplicate, missing, and out-of-range ordered positions", () => {
    const entries = Array.from({ length: 8 }, (_, index) => ({
      entryId: `entry-${index + 1}`,
      position: index + 1,
    }))
    expect(() => validateOrderedPositions(entries)).not.toThrow()
    expect(() => validateOrderedPositions([{ ...entries[0], position: 2 }, ...entries.slice(1)])).toThrow("BRACKET_ORDER_INVALID")
    expect(() => validateOrderedPositions([{ ...entries[0], position: 9 }, ...entries.slice(1)])).toThrow("BRACKET_ORDER_INVALID")
    expect(() => validateOrderedPositions([{ ...entries[0], entryId: "entry-2" }, ...entries.slice(1)])).toThrow("BRACKET_ORDER_INVALID")
  })

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
