import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentReviewQueue } from "@/components/admin/tournament-review-queue"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("TournamentReviewQueue", () => {
  it("approves a submitted tournament through the review endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ tournament: { status: "APPROVED" } }), {
        status: 200,
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <TournamentReviewQueue
        items={[
          {
            id: "tournament-1",
            title: "Bangkok Community Cup",
            organizerName: "Bangkok Hoops",
            submittedAt: "25 ก.ค. 2026",
            version: 1,
          },
        ]}
      />,
    )

    await user.click(screen.getByRole("button", { name: "อนุมัติ" }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/tournaments/tournament-1/review",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            decision: "APPROVED",
            note: "",
            version: 1,
          }),
        }),
      ),
    )
    expect(await screen.findByText("อนุมัติรายการแล้ว")).toBeTruthy()
  })

  it("recovers when the review request cannot reach the server", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")))
    const user = userEvent.setup()

    render(
      <TournamentReviewQueue
        items={[
          {
            id: "tournament-1",
            title: "Bangkok Community Cup",
            organizerName: "Bangkok Hoops",
            submittedAt: "25 ก.ค. 2026",
            version: 1,
          },
        ]}
      />,
    )

    await user.click(screen.getByRole("button", { name: "อนุมัติ" }))

    expect(
      await screen.findByText(
        "ไม่สามารถอนุมัติรายการได้ กรุณาลองอีกครั้ง",
      ),
    ).toBeTruthy()
    expect(
      (screen.getByRole("button", { name: "อนุมัติ" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false)
  })
})
