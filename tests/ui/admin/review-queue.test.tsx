import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentReviewQueue } from "@/components/admin/tournament-review-queue"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("TournamentReviewQueue", () => {
  it("links every submission to a working review detail route", () => {
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

    expect(
      screen.getByRole("link", { name: "ตรวจรายการ" }).getAttribute("href"),
    ).toBe("/admin/reviews/tournament-1")
    expect(screen.queryByRole("button", { name: "อนุมัติ" })).toBeNull()
  })
})
