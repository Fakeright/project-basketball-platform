import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { RegistrationReviewList } from "@/components/organizer/registration-review-list"

const pending = {
  id: "registration-1",
  tournamentId: "tournament-1",
  teamId: "team-1",
  teamName: "Bangkok Ballers",
  province: "Bangkok",
  playerCount: 5,
  coachCount: 1,
  submittedAt: "1 ต.ค. 2569",
  status: "PENDING" as const,
  decisionNote: null,
  version: 0,
}

const approved = {
  ...pending,
  id: "registration-2",
  teamId: "team-2",
  teamName: "Chiang Mai Hoops",
  province: "Chiang Mai",
  submittedAt: "2 ต.ค. 2569",
  status: "APPROVED" as const,
  version: 1,
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("RegistrationReviewList", () => {
  it("shows status counts and structured roster details", () => {
    render(
      <RegistrationReviewList
        registrations={[pending, approved]}
        tournamentId="tournament-1"
      />,
    )

    expect(screen.getByText("รอพิจารณา 1")).toBeTruthy()
    expect(screen.getByText("อนุมัติ 1")).toBeTruthy()
    expect(screen.getByText("Bangkok")).toBeTruthy()
    expect(screen.getAllByText("ผู้เล่น 5 / โค้ช 1")).toHaveLength(2)
  })

  it("requires explicit confirmation before approving", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        registration: { ...pending, status: "APPROVED", version: 1 },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <RegistrationReviewList
        registrations={[pending]}
        tournamentId="tournament-1"
      />,
    )

    await user.click(
      screen.getByRole("button", { name: "อนุมัติ Bangkok Ballers" }),
    )
    expect(fetchMock).not.toHaveBeenCalled()

    const dialog = screen.getByRole("dialog", { name: "ยืนยันการอนุมัติ" })
    await user.click(
      within(dialog).getByRole("button", { name: "ยืนยันอนุมัติ" }),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/registrations/registration-1/decision",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ decision: "APPROVE", note: "", version: 0 }),
      }),
    )
  })

  it("requires a labelled reason and confirmation before rejecting", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        registration: {
          ...pending,
          status: "REJECTED",
          decisionNote: "ข้อมูลไม่ครบ",
          version: 1,
        },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <RegistrationReviewList
        registrations={[pending]}
        tournamentId="tournament-1"
      />,
    )

    await user.type(
      screen.getByLabelText("เหตุผลการปฏิเสธ Bangkok Ballers"),
      "ข้อมูลไม่ครบ",
    )
    await user.click(
      screen.getByRole("button", { name: "ปฏิเสธ Bangkok Ballers" }),
    )
    expect(fetchMock).not.toHaveBeenCalled()

    await user.click(
      within(
        screen.getByRole("dialog", { name: "ยืนยันการปฏิเสธ" }),
      ).getByRole("button", { name: "ยืนยันปฏิเสธ" }),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/registrations/registration-1/decision",
      expect.objectContaining({
        body: JSON.stringify({
          decision: "REJECT",
          note: "ข้อมูลไม่ครบ",
          version: 0,
        }),
      }),
    )
  })

  it("requires a labelled reason and confirmation before withdrawal", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        registration: {
          ...approved,
          status: "WITHDRAWN",
          decisionNote: "ผิดเงื่อนไข",
          version: 2,
        },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <RegistrationReviewList
        registrations={[approved]}
        tournamentId="tournament-1"
      />,
    )

    await user.type(
      screen.getByLabelText("เหตุผลการถอนทีม Chiang Mai Hoops"),
      "ผิดเงื่อนไข",
    )
    await user.click(
      screen.getByRole("button", { name: "ถอนทีม Chiang Mai Hoops" }),
    )
    expect(fetchMock).not.toHaveBeenCalled()

    await user.click(
      within(
        screen.getByRole("dialog", { name: "ยืนยันการถอนทีม" }),
      ).getByRole("button", { name: "ยืนยันถอนทีม" }),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/registrations/registration-2/withdraw",
      expect.objectContaining({
        body: JSON.stringify({ reason: "ผิดเงื่อนไข", version: 1 }),
      }),
    )
  })
})
