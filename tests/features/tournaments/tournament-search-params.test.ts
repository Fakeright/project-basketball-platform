import { describe, expect, it } from "vitest"

import {
  parseTournamentSearchParams,
  toTournamentSearchParams,
} from "@/features/tournaments/presentation/tournament-search-params"

describe("tournament search params", () => {
  it("keeps only known province codes from the public URL", () => {
    expect(parseTournamentSearchParams({ province: "92" })).toMatchObject({
      provinceCode: "92",
    })
    expect(parseTournamentSearchParams({ province: "Trang" })).not.toHaveProperty(
      "provinceCode",
    )
  })

  it("parses recognized scalar filters", () => {
    expect(parseTournamentSearchParams({ q: "Bangkok", format: "THREE_V_THREE" })).toEqual({
      query: "Bangkok",
      format: "THREE_V_THREE",
    })
  })

  it("serializes filters in the URL contract order", () => {
    expect(toTournamentSearchParams({ provinceCode: "50", ageGroup: "U18" }).toString()).toBe(
      "province=50&ageGroup=U18",
    )
  })

  it("ignores invalid enum values and repeated values", () => {
    expect(parseTournamentSearchParams({ format: "invalid", status: ["OPEN", "CLOSED"] })).toEqual({})
  })

  it.each(["U12", "U14", "U16", "U18", "U23", "Open"])(
    "parses the canonical age group %s",
    (ageGroup) => {
      expect(parseTournamentSearchParams({ ageGroup })).toEqual({ ageGroup })
    },
  )

  it.each(["U20", "35+", "open"])(
    "ignores the unsupported age group %s",
    (ageGroup) => {
      expect(parseTournamentSearchParams({ ageGroup })).toEqual({})
    },
  )
})
