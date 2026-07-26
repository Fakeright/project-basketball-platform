import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react"
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

const secondPending = {
  ...pending,
  id: "registration-3",
  teamId: "team-3",
  teamName: "Phuket Waves",
  province: "Phuket",
  submittedAt: "3 ต.ค. 2569",
}

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

  it("keeps concurrent row actions and feedback independent when responses resolve out of order", async () => {
    const firstResponse = deferred<Response>()
    const secondResponse = deferred<Response>()
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockReturnValueOnce(firstResponse.promise)
        .mockReturnValueOnce(secondResponse.promise),
    )
    const user = userEvent.setup()

    render(
      <RegistrationReviewList
        registrations={[pending, secondPending]}
        tournamentId="tournament-1"
      />,
    )

    const firstRow = screen.getByText("Bangkok Ballers").closest("li")
    const secondRow = screen.getByText("Phuket Waves").closest("li")
    if (!firstRow || !secondRow) throw new Error("Expected registration rows")
    const firstApprove = within(firstRow).getByRole("button", {
      name: "อนุมัติ Bangkok Ballers",
    })
    const secondApprove = within(secondRow).getByRole("button", {
      name: "อนุมัติ Phuket Waves",
    })

    await submitApproval(user, firstApprove)
    await submitApproval(user, secondApprove)

    expect(firstApprove).toHaveProperty("disabled", true)
    expect(secondApprove).toHaveProperty("disabled", true)

    await act(async () => {
      secondResponse.resolve(
        Response.json({ message: "Phuket decision failed" }, { status: 409 }),
      )
    })

    await waitFor(() => {
      expect(firstApprove).toHaveProperty("disabled", true)
      expect(secondApprove).toHaveProperty("disabled", false)
      expect(within(secondRow).getByText("Phuket decision failed")).toBeTruthy()
    })
    expect(within(firstRow).queryByText("Phuket decision failed")).toBeNull()

    await act(async () => {
      firstResponse.resolve(
        Response.json({
          registration: { ...pending, status: "APPROVED", version: 1 },
        }),
      )
    })

    await waitFor(() => {
      expect(
        within(firstRow).getByText("อัปเดตสถานะการสมัครแล้ว"),
      ).toBeTruthy()
      expect(within(secondRow).getByText("Phuket decision failed")).toBeTruthy()
    })
    expect(firstRow.querySelector('[aria-live="polite"]')).not.toBeNull()
    expect(secondRow.querySelector('[aria-live="polite"]')).not.toBeNull()
  })
})

async function submitApproval(
  user: ReturnType<typeof userEvent.setup>,
  button: HTMLElement,
) {
  await user.click(button)
  await user.click(
    within(
      screen.getByRole("dialog", { name: "ยืนยันการอนุมัติ" }),
    ).getByRole("button", { name: "ยืนยันอนุมัติ" }),
  )
}
