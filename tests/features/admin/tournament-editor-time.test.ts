import { describe, expect, it } from "vitest"

import {
  bangkokDateTimeLocalToUtc,
  utcToBangkokDateTimeLocal,
} from "@/features/admin/presentation/tournament-editor-time"

describe("tournament editor Bangkok wall time", () => {
  it("converts midnight in Bangkok to the previous UTC calendar day", () => {
    expect(bangkokDateTimeLocalToUtc("2026-10-04T00:30")).toBe(
      "2026-10-03T17:30:00.000Z",
    )
  })

  it("maps a stored UTC instant back to the same Bangkok datetime-local value", () => {
    expect(utcToBangkokDateTimeLocal("2026-10-03T17:30:00.000Z")).toBe(
      "2026-10-04T00:30",
    )
  })

  it("rejects normalized or incomplete local date values", () => {
    expect(() => bangkokDateTimeLocalToUtc("2026-02-30T09:00")).toThrow(
      "DATE_INVALID",
    )
    expect(() => bangkokDateTimeLocalToUtc("2026-10-04")).toThrow(
      "DATE_INVALID",
    )
  })
})
