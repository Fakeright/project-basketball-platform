import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { MatchResultEditor } from "@/components/organizer/match-result-editor"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }))

const match = {
  id: "match-1",
  roundName: "Final",
  sequence: 1,
  homeTeam: "Bangkok Five",
  awayTeam: "Chiang Mai Hoops",
  homeScore: null,
  awayScore: null,
  winnerTeam: null,
  status: "SCHEDULED",
  version: 2,
  teamsComplete: true,
  purpose: "STANDARD" as const,
  purposeEditable: false,
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("MatchResultEditor", () => {
  it("labels championship and third-place matches", () => {
    render(
      <MatchResultEditor
        matches={[
          { ...match, id: "final", purpose: "CHAMPIONSHIP" },
          { ...match, id: "third-place", purpose: "THIRD_PLACE" },
        ]}
        tournamentId="tournament-1"
      />,
    )

    expect(screen.getByText("ชิงชนะเลิศ")).toBeTruthy()
    expect(screen.getByText("ชิงอันดับ 3")).toBeTruthy()
  })

  it("saves a tied draft without confirmation", async () => {
    const fetchMock = vi.fn(async () => Response.json({ match: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<MatchResultEditor matches={[match]} tournamentId="tournament-1" />)

    await user.type(screen.getByLabelText("คะแนนทีมแรก"), "10")
    await user.type(screen.getByLabelText("คะแนนทีมสอง"), "10")
    await user.click(screen.getByRole("button", { name: "บันทึกร่าง" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/matches/match-1/score",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ homeScore: 10, awayScore: 10, expectedVersion: 2 }),
      }),
    )
  })

  it("confirms a decisive result explicitly", async () => {
    const fetchMock = vi.fn(async () => Response.json({ match: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true)
    const user = userEvent.setup()
    render(<MatchResultEditor matches={[match]} tournamentId="tournament-1" />)

    await user.type(screen.getByLabelText("คะแนนทีมแรก"), "72")
    await user.type(screen.getByLabelText("คะแนนทีมสอง"), "68")
    await user.click(screen.getByRole("button", { name: "ยืนยันผล" }))

    expect(confirm).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/matches/match-1/confirm",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          homeScore: 72,
          awayScore: 68,
          expectedVersion: 2,
          confirm: true,
        }),
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })
})
