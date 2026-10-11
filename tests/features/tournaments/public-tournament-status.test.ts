import { describe, expect, it } from "vitest"

import { resolvePublicTournamentStatus } from "@/features/tournaments/domain/public-tournament-status"

describe("resolvePublicTournamentStatus", () => {
  const deadline = "2026-10-10T10:00:00.000Z"

  it("keeps registration open through the exact deadline", () => {
    expect(resolvePublicTournamentStatus("OPEN", deadline, new Date(deadline))).toBe("OPEN")
  })

  it("closes public registration after the deadline or when the date is invalid", () => {
    expect(resolvePublicTournamentStatus("OPEN", deadline, new Date("2026-10-10T10:00:01.000Z"))).toBe("CLOSED")
    expect(resolvePublicTournamentStatus("OPEN", "invalid", new Date(deadline))).toBe("CLOSED")
  })

  it("preserves lifecycle states other than open registration", () => {
    expect(resolvePublicTournamentStatus("ONGOING", deadline, new Date("2026-10-11T00:00:00.000Z"))).toBe("ONGOING")
    expect(resolvePublicTournamentStatus("COMPLETED", deadline, new Date("2026-10-11T00:00:00.000Z"))).toBe("COMPLETED")
  })
})
