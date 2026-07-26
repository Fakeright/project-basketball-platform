import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TeamRegistrationList } from "@/components/team/team-registration-list"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("TeamRegistrationList", () => {
  it("cancels only the pending row and announces success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <TeamRegistrationList
        registrations={[
          {
            id: "registration-1",
            tournamentName: "Bangkok Open",
            submittedAt: "1 Oct 2026",
            status: "PENDING",
            organizerNote: null,
            version: 0,
          },
          {
            id: "registration-2",
            tournamentName: "Chiang Mai Open",
            submittedAt: "2 Oct 2026",
            status: "APPROVED",
            organizerNote: "Approved",
            version: 1,
          },
        ]}
      />,
    )

    await user.click(screen.getByRole("button", { name: "ยกเลิกการสมัคร Bangkok Open" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/registrations/registration-1",
      expect.objectContaining({ method: "DELETE", body: JSON.stringify({ version: 0 }) }),
    )
    expect(await screen.findByText("ยกเลิกการสมัครแล้ว")).toBeTruthy()
    expect(screen.queryByRole("button", { name: "ยกเลิกการสมัคร Chiang Mai Open" })).toBeNull()
  })
})
