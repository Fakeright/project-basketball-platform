import { describe, expect, it } from "vitest"

import {
  parseTournamentSearchParams,
  toTournamentSearchParams,
} from "@/features/tournaments/presentation/tournament-search-params"

describe("tournament search params", () => {
  it("parses recognized scalar filters", () => {
    expect(parseTournamentSearchParams({ q: "Bangkok", format: "THREE_V_THREE" })).toEqual({
      query: "Bangkok",
      format: "THREE_V_THREE",
    })
  })

  it("serializes filters in the URL contract order", () => {
    expect(toTournamentSearchParams({ province: "Chiang Mai", ageGroup: "U18" }).toString()).toBe(
      "province=Chiang+Mai&ageGroup=U18",
    )
  })

  it("ignores invalid enum values and repeated values", () => {
    expect(parseTournamentSearchParams({ format: "invalid", status: ["OPEN", "CLOSED"] })).toEqual({})
  })
})
