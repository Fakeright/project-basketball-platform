import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ExternalMatchEditor } from "@/components/organizer/external-match-editor"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }))

describe("ExternalMatchEditor", () => {
  afterEach(cleanup)
  beforeEach(() => {
    vi.restoreAllMocks()
    refresh.mockReset()
  })

  it("shows searchable team fields and a vertical-friendly creation form", () => {
    renderEditor()

    expect(screen.getByLabelText("ทีมเหย้า")).toBeTruthy()
    expect(screen.getByLabelText("ทีมเยือน")).toBeTruthy()
    expect(screen.getByLabelText("ชื่อรอบ")).toBeTruthy()
    expect(screen.getByLabelText("วันและเวลา")).toBeTruthy()
    expect(screen.getByRole("button", { name: "เพิ่มคู่แข่งขัน" })).toBeTruthy()
  })

  it("submits selected locked teams to the external match endpoint", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ match: { id: "match-1" } }), { status: 201 }))
    renderEditor()

    chooseTeam("ทีมเหย้า", "Bangkok Hoops")
    chooseTeam("ทีมเยือน", "Chiang Mai Five")
    fireEvent.change(screen.getByLabelText("ชื่อรอบ"), { target: { value: "Final" } })
    fireEvent.change(screen.getByLabelText("ลำดับคู่"), { target: { value: "1" } })
    fireEvent.change(screen.getByLabelText("วันและเวลา"), {
      target: { value: "2026-08-20T13:00" },
    })
    fireEvent.change(screen.getByLabelText("สนาม"), { target: { value: "สนาม A" } })
    fireEvent.click(screen.getByRole("button", { name: "เพิ่มคู่แข่งขัน" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, request] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/organizer/tournaments/tournament-1/matches")
    expect(JSON.parse(String(request?.body))).toMatchObject({
      homeTeamId: "team-1",
      awayTeamId: "team-2",
      roundName: "Final",
      sequence: 1,
      expectedVersion: 3,
    })
    expect(refresh).toHaveBeenCalled()
  })
})

function renderEditor() {
  render(
    <ExternalMatchEditor
      bracketVersion={3}
      teams={[
        { id: "team-1", name: "Bangkok Hoops" },
        { id: "team-2", name: "Chiang Mai Five" },
      ]}
      tournamentId="tournament-1"
    />,
  )
}

function chooseTeam(label: string, teamName: string) {
  const input = screen.getByLabelText(label)
  fireEvent.click(screen.getByRole("button", { name: `เปิดรายชื่อ${label}` }))
  fireEvent.change(input, { target: { value: teamName } })
  fireEvent.click(screen.getByRole("option", { name: teamName }))
}
