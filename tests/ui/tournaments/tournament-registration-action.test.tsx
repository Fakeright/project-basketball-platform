import { act, cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentRegistrationAction } from "@/components/tournaments/tournament-registration-action"

const router = {
  refresh: vi.fn(),
}

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}))

const teams = [
  { id: "team-1", name: "Bangkok Ballers" },
  { id: "team-2", name: "Chiang Mai Hoops" },
]

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((fulfill) => {
    resolve = fulfill
  })
  return { promise, resolve }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  router.refresh.mockReset()
})

describe("TournamentRegistrationAction", () => {
  it("keeps selection valid when refreshed props remove the selected team", async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <TournamentRegistrationAction
        teams={teams}
        tournamentId="tournament-1"
      />,
    )

    await user.selectOptions(screen.getByLabelText("ทีมที่สมัคร"), "team-2")

    rerender(
      <TournamentRegistrationAction
        teams={[teams[0]]}
        tournamentId="tournament-1"
      />,
    )

    expect(screen.queryByRole("option", { name: "Chiang Mai Hoops" })).toBeNull()
    expect(screen.getByLabelText("ทีมที่สมัคร")).toHaveProperty(
      "value",
      "team-1",
    )
  })

  it("reconciles an optimistic submission after refreshed props remove it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          { registration: { id: "registration-1", status: "PENDING" } },
          { status: 201 },
        ),
      ),
    )
    const user = userEvent.setup()
    const { rerender } = render(
      <TournamentRegistrationAction
        teams={teams}
        tournamentId="tournament-1"
      />,
    )

    await user.selectOptions(screen.getByLabelText("ทีมที่สมัคร"), "team-2")
    await user.click(screen.getByRole("button", { name: "สมัครแข่งขัน" }))
    expect(
      await screen.findByText("ส่งใบสมัครเรียบร้อยแล้ว รอผู้จัดการแข่งขันพิจารณา"),
    ).toBeTruthy()

    rerender(
      <TournamentRegistrationAction
        teams={[teams[0]]}
        tournamentId="tournament-1"
      />,
    )
    rerender(
      <TournamentRegistrationAction
        teams={teams}
        tournamentId="tournament-1"
      />,
    )

    expect(
      screen.getByRole("option", { name: "Chiang Mai Hoops" }),
    ).toBeTruthy()
  })

  it("resets optimistic state when switching tournaments with identical team IDs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          { registration: { id: "registration-1", status: "PENDING" } },
          { status: 201 },
        ),
      ),
    )
    const user = userEvent.setup()
    const { rerender } = render(
      <TournamentRegistrationAction
        teams={teams}
        tournamentId="tournament-1"
      />,
    )

    await user.selectOptions(screen.getByLabelText("ทีมที่สมัคร"), "team-2")
    await user.click(screen.getByRole("button", { name: "สมัครแข่งขัน" }))
    expect(
      await screen.findByText("ส่งใบสมัครเรียบร้อยแล้ว รอผู้จัดการแข่งขันพิจารณา"),
    ).toBeTruthy()

    rerender(
      <TournamentRegistrationAction
        teams={teams}
        tournamentId="tournament-2"
      />,
    )

    expect(
      screen.getByRole("option", { name: "Chiang Mai Hoops" }),
    ).toBeTruthy()
    expect(screen.getByLabelText("ทีมที่สมัคร")).toHaveProperty(
      "value",
      "team-1",
    )
    expect(screen.getByRole("status").textContent).toBe("")
  })

  it("states that final eligibility is validated by the server on submit", () => {
    render(
      <TournamentRegistrationAction
        teams={teams}
        tournamentId="tournament-1"
      />,
    )

    expect(
      screen.getByText(
        "ระบบจะตรวจสอบกำหนดปิดรับสมัคร จำนวนทีม และรายชื่อสมาชิกอีกครั้งเมื่อส่งใบสมัคร",
      ),
    ).toBeTruthy()
  })

  it.each([
    ["NO_TEAMS", "ยังไม่มีทีมสำหรับสมัครแข่งขัน"],
    ["ALREADY_APPLIED", "ทีมของคุณสมัครรายการนี้แล้ว"],
    ["CLOSED", "รายการนี้ปิดรับสมัครแล้ว"],
    ["ERROR", "ไม่สามารถโหลดข้อมูลการสมัครได้"],
  ] as const)("shows the Thai %s registration state", (availability, message) => {
    render(
      <TournamentRegistrationAction
        availability={availability}
        teams={[]}
        tournamentId="tournament-1"
      />,
    )

    expect(screen.getByText(message)).toBeTruthy()
  })

  it("submits the selected owned team for the current tournament", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        { registration: { id: "registration-1", status: "PENDING" } },
        { status: 201 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <TournamentRegistrationAction
        teams={teams}
        tournamentId="tournament-1"
      />,
    )

    await user.selectOptions(screen.getByLabelText("ทีมที่สมัคร"), "team-2")
    await user.click(
      screen.getByRole("button", { name: "สมัครแข่งขัน" }),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tournaments/tournament-1/registrations",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId: "team-2" }),
      }),
    )
    expect(
      await screen.findByText("ส่งใบสมัครเรียบร้อยแล้ว รอผู้จัดการแข่งขันพิจารณา"),
    ).toBeTruthy()
    expect(
      screen.queryByRole("option", { name: "Chiang Mai Hoops" }),
    ).toBeNull()
    expect(router.refresh).toHaveBeenCalledOnce()
  })

  it("prevents a duplicate submit when the submitted team was the only option", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          { registration: { id: "registration-1", status: "PENDING" } },
          { status: 201 },
        ),
      ),
    )
    const user = userEvent.setup()

    render(
      <TournamentRegistrationAction
        teams={[teams[0]]}
        tournamentId="tournament-1"
      />,
    )

    await user.click(
      screen.getByRole("button", { name: "สมัครแข่งขัน" }),
    )

    expect(await screen.findByText("ส่งใบสมัครแล้ว")).toBeTruthy()
    expect(
      screen.queryByRole("button", { name: "สมัครแข่งขัน" }),
    ).toBeNull()
  })

  it("disables the selector and submit button only while the request is pending", async () => {
    const response = deferred<Response>()
    vi.stubGlobal("fetch", vi.fn(() => response.promise))
    const user = userEvent.setup()

    render(
      <TournamentRegistrationAction
        teams={teams}
        tournamentId="tournament-1"
      />,
    )

    const selector = screen.getByLabelText("ทีมที่สมัคร")
    const submit = screen.getByRole("button", { name: "สมัครแข่งขัน" })
    await user.click(submit)

    expect(selector).toHaveProperty("disabled", true)
    expect(submit).toHaveProperty("disabled", true)

    await act(async () => {
      response.resolve(
        Response.json(
          { registration: { id: "registration-1", status: "PENDING" } },
          { status: 201 },
        ),
      )
    })

    expect((await screen.findByRole("status")).textContent).toContain(
      "ส่งใบสมัครเรียบร้อยแล้ว",
    )
    expect(selector).toHaveProperty("disabled", false)
    expect(submit).toHaveProperty("disabled", false)
  })

  it.each([409, 422])(
    "announces the server-authoritative Thai message for %s responses",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          Response.json(
            { message: "รายชื่อผู้เล่นในทีมยังไม่ครบ" },
            { status },
          ),
        ),
      )
      const user = userEvent.setup()

      render(
        <TournamentRegistrationAction
          teams={teams}
          tournamentId="tournament-1"
        />,
      )

      await user.click(
        screen.getByRole("button", { name: "สมัครแข่งขัน" }),
      )

      expect(
        await screen.findByText("รายชื่อผู้เล่นในทีมยังไม่ครบ"),
      ).toBeTruthy()
      expect(screen.getByRole("status").getAttribute("aria-live")).toBe("polite")
    },
  )
})
