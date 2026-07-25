import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentMediaManager } from "@/components/admin/tournament-media-manager"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("TournamentMediaManager", () => {
  it("rejects an oversized poster before it reaches the upload route", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<TournamentMediaManager tournamentId="tournament-1" assets={[]} />)

    await user.upload(
      screen.getByLabelText("โปสเตอร์การแข่งขัน"),
      new File([new Uint8Array(5_000_001)], "poster.webp", {
        type: "image/webp",
      }),
    )

    expect(await screen.findByText("รูปโปสเตอร์ต้องมีขนาดไม่เกิน 5 MB")).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
