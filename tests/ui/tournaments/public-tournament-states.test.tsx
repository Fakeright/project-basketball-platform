import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import TournamentError from "@/app/(public)/tournaments/error"
import TournamentLoading from "@/app/(public)/tournaments/loading"
import TournamentNotFound from "@/app/(public)/tournaments/[slug]/not-found"

afterEach(cleanup)

describe("public tournament route states", () => {
  it("shows a stable loading region while public data is loading", () => {
    render(<TournamentLoading />)

    expect(screen.getByRole("status").textContent).toContain(
      "กำลังโหลดรายการแข่งขัน",
    )
  })

  it("offers a retry command for an unexpected public data error", async () => {
    const retry = vi.fn()
    const user = userEvent.setup()
    render(
      <TournamentError
        error={new Error("database unavailable")}
        unstable_retry={retry}
      />,
    )

    await user.click(screen.getByRole("button", { name: "ลองอีกครั้ง" }))

    expect(retry).toHaveBeenCalledOnce()
    expect(screen.queryByText("database unavailable")).toBeNull()
  })

  it("links a missing tournament back to public discovery", () => {
    render(<TournamentNotFound />)

    expect(
      screen.getByRole("link", { name: "ดูรายการแข่งขันทั้งหมด" }),
    ).toHaveProperty("href", "http://localhost:3000/tournaments")
  })
})
