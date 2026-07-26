import { act, cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentRegistrationAction } from "@/components/tournaments/tournament-registration-action"

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
})

describe("TournamentRegistrationAction", () => {
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
