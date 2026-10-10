import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { MatchResultCorrectionDialog } from "@/components/admin/match-result-correction-dialog"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }))

const match = {
  id: "match-1",
  roundName: "รอบชิงชนะเลิศ",
  sequence: 1,
  homeTeam: "Bangkok Five",
  awayTeam: "Chiang Mai Hoops",
  homeScore: 72,
  awayScore: 68,
  winnerTeam: "Bangkok Five",
  version: 3,
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("MatchResultCorrectionDialog", () => {
  it("previews the corrected winner and requires a reason", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(
      <MatchResultCorrectionDialog match={match} tournamentId="tournament-1" />,
    )

    await user.clear(screen.getByLabelText("คะแนน Bangkok Five"))
    await user.type(screen.getByLabelText("คะแนน Bangkok Five"), "68")
    await user.clear(screen.getByLabelText("คะแนน Chiang Mai Hoops"))
    await user.type(screen.getByLabelText("คะแนน Chiang Mai Hoops"), "72")

    expect(screen.getByText("ผู้ชนะหลังแก้: Chiang Mai Hoops")).toBeTruthy()
    await user.type(screen.getByLabelText("เหตุผลการแก้ผล"), " ")
    await user.click(screen.getByRole("button", { name: "ยืนยันการแก้ผล" }))
    expect(screen.getByText("กรุณาระบุเหตุผล")).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("submits an explicitly confirmed correction", async () => {
    const fetchMock = vi.fn(async () => Response.json({ match: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true)
    const user = userEvent.setup()
    render(
      <MatchResultCorrectionDialog match={match} tournamentId="tournament-1" />,
    )

    await user.clear(screen.getByLabelText("คะแนน Bangkok Five"))
    await user.type(screen.getByLabelText("คะแนน Bangkok Five"), "68")
    await user.clear(screen.getByLabelText("คะแนน Chiang Mai Hoops"))
    await user.type(screen.getByLabelText("คะแนน Chiang Mai Hoops"), "72")
    await user.type(
      screen.getByLabelText("เหตุผลการแก้ผล"),
      "แก้คะแนนตามใบบันทึกการแข่งขัน",
    )
    await user.click(screen.getByRole("button", { name: "ยืนยันการแก้ผล" }))

    expect(confirm).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/tournaments/tournament-1/matches/match-1/result-correction",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          homeScore: 68,
          awayScore: 72,
          expectedVersion: 3,
          reason: "แก้คะแนนตามใบบันทึกการแข่งขัน",
          confirm: true,
        }),
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it("offers a refresh action when the correction conflicts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { message: "ข้อมูลคู่แข่งขันมีการเปลี่ยนแปลง กรุณาลองใหม่" },
          { status: 409 },
        ),
      ),
    )
    vi.spyOn(window, "confirm").mockReturnValue(true)
    const user = userEvent.setup()
    render(
      <MatchResultCorrectionDialog match={match} tournamentId="tournament-1" />,
    )

    await user.type(screen.getByLabelText("เหตุผลการแก้ผล"), "แก้คะแนน")
    await user.click(screen.getByRole("button", { name: "ยืนยันการแก้ผล" }))
    await user.click(screen.getByRole("button", { name: "โหลดข้อมูลล่าสุด" }))

    expect(refresh).toHaveBeenCalledOnce()
  })
})
