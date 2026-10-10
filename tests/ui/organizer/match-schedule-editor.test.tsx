import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { MatchScheduleEditor } from "@/components/organizer/match-schedule-editor"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("MatchScheduleEditor", () => {
  it("submits Bangkok local time as a UTC instant", async () => {
    const fetchMock = vi.fn(async () => Response.json({ match: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(
      <MatchScheduleEditor
        matches={[
          {
            id: "match-1",
            roundName: "Final",
            sequence: 1,
            homeTeam: "Bangkok Five",
            awayTeam: "Chiang Mai Hoops",
            scheduledAt: "2026-11-15T12:00",
            court: "Court A",
            status: "SCHEDULED",
            version: 1,
          },
        ]}
        tournamentId="tournament-1"
      />,
    )

    await user.click(screen.getByRole("button", { name: "บันทึก" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/matches/match-1/schedule",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          scheduledAt: "2026-11-15T05:00:00.000Z",
          court: "Court A",
          expectedVersion: 1,
        }),
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it("shows an empty state before bracket generation", () => {
    render(<MatchScheduleEditor matches={[]} tournamentId="tournament-1" />)
    expect(screen.getByText(/ยังไม่มีคู่แข่งขัน/)).toBeTruthy()
  })
})
