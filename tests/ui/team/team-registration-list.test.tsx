import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TeamRegistrationList } from "@/components/team/team-registration-list"

const router = {
  refresh: vi.fn(),
}

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  router.refresh.mockReset()
})

describe("TeamRegistrationList", () => {
  it("preserves a cancelled row as history and removes its cancel action", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    const { rerender } = render(
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

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog", { name: "ยืนยันการยกเลิกการสมัคร" })).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "ยืนยันยกเลิกการสมัคร" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/registrations/registration-1",
      expect.objectContaining({ method: "DELETE", body: JSON.stringify({ version: 0 }) }),
    )
    expect(await screen.findByText("ยกเลิกการสมัครแล้ว")).toBeTruthy()
    const cancelledRow = screen.getByText("Bangkok Open").closest("li")
    expect(cancelledRow?.textContent).toContain("ยกเลิก")
    expect(
      screen.queryByRole("button", { name: "ยกเลิกการสมัคร Bangkok Open" }),
    ).toBeNull()
    expect(router.refresh).toHaveBeenCalledOnce()
    expect(screen.queryByRole("button", { name: "ยกเลิกการสมัคร Chiang Mai Open" })).toBeNull()

    rerender(
      <TeamRegistrationList
        registrations={[
          {
            id: "registration-1",
            tournamentName: "Bangkok Open",
            submittedAt: "1 Oct 2026",
            status: "CANCELLED",
            organizerNote: null,
            version: 1,
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

    expect(screen.getByText("Bangkok Open").closest("li")?.textContent).toContain(
      "ยกเลิก",
    )
  })
})
