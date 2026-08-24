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
    const validationMessage = await screen.findByText("กรุณาระบุเหตุผล")
    expect(validationMessage.getAttribute("aria-live")).toBe("polite")
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

  it("keeps the successful review result readable with a link back to the queue", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ tournament: { status: "PUBLISHED" } }),
        { status: 200 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("confirm", vi.fn(() => true))
    const user = userEvent.setup()

    render(<TournamentReviewPanel tournament={tournament} />)

    await user.click(screen.getByRole("button", { name: "อนุมัติ" }))

    expect(
      (await screen.findByRole("link", { name: "กลับคิวตรวจสอบ" })).getAttribute("href"),
    ).toBe("/admin/reviews")
    const successMessage = screen.getByRole("status")
    expect(successMessage.textContent).toContain("อนุมัติรายการแล้ว")
    expect(successMessage.getAttribute("aria-live")).toBeNull()
    expect(screen.getByLabelText("เหตุผลประกอบการพิจารณา").disabled).toBe(
      true,
    )
    expect(screen.getByRole("button", { name: "อนุมัติ" }).disabled).toBe(
      true,
    )
    expect(screen.getByRole("button", { name: "ขอแก้ไข" }).disabled).toBe(
      true,
    )
    expect(screen.getByRole("button", { name: "ปฏิเสธ" }).disabled).toBe(
      true,
    )
  })
})
