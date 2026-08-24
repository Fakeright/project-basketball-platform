import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentLifecycleActions } from "@/components/admin/tournament-lifecycle-actions"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("TournamentLifecycleActions", () => {
  it("publishes an approved tournament only after confirmation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ tournament: { status: "PUBLISHED" } }), {
        status: 200,
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("confirm", vi.fn(() => true))
    const user = userEvent.setup()

    render(
      <TournamentLifecycleActions
        status="APPROVED"
        tournamentId="tournament-1"
        version={3}
      />,
    )

    await user.click(screen.getByRole("button", { name: "เผยแพร่รายการ" }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/tournaments/tournament-1/publish",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ version: 3 }),
        }),
      ),
    )
    expect(await screen.findByText("เผยแพร่รายการแล้ว")).toBeTruthy()
  })

  it("closes registration from a published tournament", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ tournament: { status: "REGISTRATION_CLOSED" } }),
        { status: 200 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("confirm", vi.fn(() => true))
    const user = userEvent.setup()

    render(
      <TournamentLifecycleActions
        status="PUBLISHED"
        tournamentId="tournament-1"
        version={4}
      />,
    )

    await user.click(screen.getByRole("button", { name: "ปิดรับสมัคร" }))

    expect(confirm).toHaveBeenCalledWith(
      "ยืนยันการปิดรับสมัคร? ทีมใหม่จะไม่สามารถส่งใบสมัครได้",
    )
    expect(await screen.findByText("ปิดรับสมัครแล้ว")).toBeTruthy()
  })
})
