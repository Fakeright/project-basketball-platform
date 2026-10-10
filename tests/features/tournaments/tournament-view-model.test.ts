import { describe, expect, it } from "vitest"

import {
  formatTournamentDateRange,
  formatTournamentFormat,
} from "@/features/tournaments/presentation/tournament-view-model"

describe("tournament view model", () => {
  it("formats a Thai date range within the same month", () => {
    expect(formatTournamentDateRange("2026-07-27", "2026-07-29")).toBe("27-29 ก.ค. 2026")
  })

  it("formats a same-day tournament as one Thai date", () => {
    expect(formatTournamentDateRange("2026-10-04", "2026-10-04")).toBe("4 ต.ค. 2026")
  })

  it("formats tournament instants using the Bangkok calendar day", () => {
    expect(
      formatTournamentDateRange(
        "2026-10-03T17:30:00.000Z",
        "2026-10-03T17:30:00.000Z",
      ),
    ).toBe("4 ต.ค. 2026")
  })

  it("formats the three-on-three tournament format", () => {
    expect(formatTournamentFormat("THREE_V_THREE")).toBe("3x3")
  })
})
