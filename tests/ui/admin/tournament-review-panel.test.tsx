import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentReviewPanel } from "@/components/admin/tournament-review-panel"

const tournament = {
  id: "tournament-1",
  title: "Bangkok Community Cup",
  version: 2,
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("TournamentReviewPanel", () => {
  it("requires a reason and confirmation before requesting changes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ tournament: { status: "CHANGES_REQUESTED" } }),
        { status: 200 },
      ),
    )
    const confirmMock = vi.fn(() => true)
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("confirm", confirmMock)
    const user = userEvent.setup()

    render(<TournamentReviewPanel tournament={tournament} />)

    await user.click(screen.getByRole("button", { name: "ขอแก้ไข" }))
    expect(await screen.findByText("กรุณาระบุเหตุผล")).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()

    await user.type(
      screen.getByLabelText("เหตุผลประกอบการพิจารณา"),
      "กรุณาเพิ่มรายละเอียดสนาม",
    )
    await user.click(screen.getByRole("button", { name: "ขอแก้ไข" }))

    expect(confirmMock).toHaveBeenCalledWith(
      "ยืนยันการส่งรายการกลับให้ผู้จัดแก้ไข?",
    )
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/tournaments/tournament-1/review",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            decision: "CHANGES_REQUESTED",
            note: "กรุณาเพิ่มรายละเอียดสนาม",
            version: 2,
          }),
        }),
      ),
    )
    expect(await screen.findByText("ส่งรายการกลับให้ผู้จัดแก้ไขแล้ว")).toBeTruthy()
  })

  it("does not approve until the administrator confirms", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("confirm", vi.fn(() => false))
    const user = userEvent.setup()

    render(<TournamentReviewPanel tournament={tournament} />)

    await user.click(screen.getByRole("button", { name: "อนุมัติ" }))

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
