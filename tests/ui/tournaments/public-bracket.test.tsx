import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { BracketView } from "@/components/bracket-view"
import type { Match } from "@/features/tournaments/domain/tournament"

afterEach(cleanup)

describe("public BracketView", () => {
  it("shows the source, Bye notes, and rounds in explicit sequence order", () => {
    const matches: Match[] = [
      match("final", "Final", 3, 1),
      match("quarter", "Quarter Final", 1, 1),
      match("semi", "Semi Final", 2, 1),
    ]

    render(
      <BracketView
        entries={[{ teamName: "Bangkok Five", startRoundSequence: 2 }]}
        matches={matches}
        source="SYSTEM_GENERATED"
      />,
    )

    expect(screen.getByText("สายการแข่งขันที่ระบบสร้าง")).toBeTruthy()
    expect(screen.getByText("Bangkok Five ได้สิทธิ์ผ่านรอบแรก (Bye)")).toBeTruthy()
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((heading) =>
        heading.textContent,
      ),
    ).toEqual(["Quarter Final", "Semi Final", "Final"])
  })
})

function match(
  id: string,
  round: string,
  roundSequence: number,
  sequence: number,
): Match {
  return {
    id,
    tournamentSlug: "courtside-open",
    round,
    roundSequence,
    sequence,
    court: "ยังไม่กำหนดสนาม",
    scheduledAt: null,
    homeTeam: "รอยืนยันทีม",
    awayTeam: "รอยืนยันทีม",
    homeScore: null,
    awayScore: null,
  }
}
