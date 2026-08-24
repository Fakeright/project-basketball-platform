import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TournamentCompetitionLifecyclePanel } from "@/components/organizer/tournament-competition-lifecycle-panel"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

beforeEach(() => {
  refresh.mockReset()
  vi.spyOn(window, "confirm").mockReturnValue(true)
})

describe("TournamentCompetitionLifecyclePanel", () => {
  it("enables starting when a closed tournament is ready", () => {
    renderPanel()

    expect(
      (screen.getByRole("button", {
        name: "เริ่มการแข่งขัน",
      }) as HTMLButtonElement).disabled,
    ).toBe(false)
  })

  it("shows readiness issues and blocks starting", () => {
    renderPanel({ startIssues: ["CHAMPIONSHIP_MISSING"] })

    expect(screen.getByText("ยังไม่มีคู่ชิงชนะเลิศ")).toBeTruthy()
    expect(
      (screen.getByRole("button", {
        name: "เริ่มการแข่งขัน",
      }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it("completes a ready in-progress tournament and refreshes", async () => {
    let resolveRequest!: (response: Response) => void
    const fetchMock = vi.fn(
      () => new Promise<Response>((resolve) => (resolveRequest = resolve)),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    renderPanel({ status: "IN_PROGRESS", completionIssues: [] })

    await user.click(screen.getByRole("button", { name: "จบการแข่งขัน" }))

    expect(
      (screen.getByRole("button", {
        name: "กำลังดำเนินการ",
      }) as HTMLButtonElement).disabled,
    ).toBe(true)
    resolveRequest(Response.json({ tournament: {} }))
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce())
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/complete",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ version: 4 }),
      }),
    )
  })

  it("shows conflict feedback from the server", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { message: "ข้อมูลรายการแข่งขันมีการเปลี่ยนแปลง กรุณาโหลดใหม่" },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole("button", { name: "เริ่มการแข่งขัน" }))

    expect(
      await screen.findByText("ข้อมูลรายการแข่งขันมีการเปลี่ยนแปลง กรุณาโหลดใหม่"),
    ).toBeTruthy()
  })

  it("requires a reason when an admin acts for the organizer", async () => {
    const fetchMock = vi.fn(async () => Response.json({ tournament: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    renderPanel({ requiresOverrideReason: true })

    const reason = screen.getByLabelText("เหตุผลที่ดำเนินการแทนผู้จัด")
    expect(reason.hasAttribute("required")).toBe(true)
    expect(
      (screen.getByRole("button", {
        name: "เริ่มการแข่งขัน",
      }) as HTMLButtonElement).disabled,
    ).toBe(true)

    await user.type(reason, "ตรวจสอบแทนผู้จัดแล้ว")
    await user.click(screen.getByRole("button", { name: "เริ่มการแข่งขัน" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      version: 4,
      reason: "ตรวจสอบแทนผู้จัดแล้ว",
    })
  })

  it("does not show stale readiness issues after completion", () => {
    renderPanel({
      status: "COMPLETED",
      completionIssues: ["TOURNAMENT_STATUS_INVALID"],
    })

    expect(screen.getByText("จบการแข่งขันแล้ว")).toBeTruthy()
    expect(screen.queryByText("สถานะรายการไม่พร้อมสำหรับขั้นตอนนี้")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })
})

function renderPanel(
  overrides: Partial<
    React.ComponentProps<typeof TournamentCompetitionLifecyclePanel>
  > = {},
) {
  render(
    <TournamentCompetitionLifecyclePanel
      completionIssues={["TOURNAMENT_STATUS_INVALID"]}
      requiresOverrideReason={false}
      startIssues={[]}
      status="REGISTRATION_CLOSED"
      tournamentId="tournament-1"
      version={4}
      {...overrides}
    />,
  )
}
