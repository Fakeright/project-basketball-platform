import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentEditor } from "@/components/admin/tournament-editor"

const router = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe("TournamentEditor", () => {
  it("saves a valid tournament draft", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          tournament: {
            id: "tournament-4",
            version: 0,
            status: "DRAFT",
          },
        }),
        { status: 201 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TournamentEditor initialTournament={null} />)

    await fillValidTournament(user)
    await user.click(screen.getByRole("button", { name: "บันทึกฉบับร่าง" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/tournaments",
      expect.objectContaining({ method: "POST" }),
    )
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      startsAt: "2026-12-10T02:00:00.000Z",
      endsAt: "2026-12-11T11:00:00.000Z",
      registrationDeadline: "2026-12-01T16:59:00.000Z",
      capacity: 16,
    })
    expect(await screen.findByText("บันทึกฉบับร่างแล้ว")).toBeTruthy()
    expect(router.replace).toHaveBeenCalledWith(
      "/organizer/tournaments/tournament-4",
    )
  })

  it("adopts the returned id and version for sequential saves", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            tournament: {
              id: "tournament-4",
              version: 0,
              status: "DRAFT",
            },
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            tournament: {
              id: "tournament-4",
              version: 1,
              status: "DRAFT",
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            tournament: {
              id: "tournament-4",
              version: 2,
              status: "DRAFT",
            },
          }),
        ),
      )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TournamentEditor initialTournament={null} />)
    await fillValidTournament(user)

    await user.click(screen.getByRole("button", { name: "บันทึกฉบับร่าง" }))
    await screen.findByText("บันทึกฉบับร่างแล้ว")
    await user.click(screen.getByRole("button", { name: "บันทึกฉบับร่าง" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(fetchMock.mock.calls[1][0]).toBe(
      "/api/admin/tournaments/tournament-4",
    )
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "PUT" })
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      version: 0,
    })

    const saveButton = screen.getByRole("button", {
      name: "บันทึกฉบับร่าง",
    })
    await waitFor(() => expect(saveButton.hasAttribute("disabled")).toBe(false))
    await user.click(saveButton)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({
      version: 1,
    })
  })

  it("saves a valid custom even capacity", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          tournament: {
            id: "tournament-10",
            version: 0,
            status: "DRAFT",
          },
        }),
        { status: 201 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TournamentEditor initialTournament={null} />)
    await fillValidTournament(user)
    await user.selectOptions(
      screen.getByLabelText("จำนวนทีมสูงสุด"),
      "CUSTOM",
    )
    await user.type(screen.getByLabelText("ระบุจำนวนทีม"), "10")
    await user.click(screen.getByRole("button", { name: "บันทึกฉบับร่าง" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      capacity: 10,
    })
  })

  it("blocks an odd custom capacity before sending a request", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TournamentEditor initialTournament={null} />)
    await fillValidTournament(user)
    await user.selectOptions(
      screen.getByLabelText("จำนวนทีมสูงสุด"),
      "CUSTOM",
    )
    await user.type(screen.getByLabelText("ระบุจำนวนทีม"), "7")
    await user.click(screen.getByRole("button", { name: "บันทึกฉบับร่าง" }))

    expect(
      await screen.findByText(
        "จำนวนทีมต้องเป็นเลขคู่ตั้งแต่ 6 ถึง 32 ทีม",
      ),
    ).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("shows a deadline error before submitting", async () => {
    const user = userEvent.setup()

    render(
      <TournamentEditor
        initialTournament={{
          id: "tournament-1",
          title: "Chiang Rai Cup",
          description: "การแข่งขันระดับชุมชน",
          provinceCode: "57",
          venue: "สนามกีฬากลาง",
          format: "FIVE_V_FIVE",
          ageGroup: "Open",
          startsAt: "2026-12-10T09:00",
          endsAt: "2026-12-11T18:00",
          registrationDeadline: "",
          capacity: 16,
          rules: "ใช้กติกามาตรฐาน",
          version: 1,
        }}
      />,
    )

    await user.click(screen.getByRole("button", { name: "ส่งตรวจสอบ" }))

    expect(await screen.findByText("กรุณาระบุวันปิดรับสมัคร")).toBeTruthy()
  })
})

async function fillValidTournament(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(screen.getByLabelText("ชื่อรายการ"), "Chiang Rai Cup")
  await user.type(screen.getByLabelText("รายละเอียด"), "การแข่งขันระดับชุมชน")
  const province = screen.getByLabelText("จังหวัด")
  await user.click(province)
  await user.type(province, "Chiang Rai")
  await user.click(await screen.findByRole("option", { name: /เชียงราย.*Chiang Rai/i }))
  await user.type(screen.getByLabelText("สถานที่"), "สนามกีฬากลาง")
  await user.type(screen.getByLabelText("รุ่นอายุ"), "Open")
  await user.type(screen.getByLabelText("วันเริ่มแข่งขัน"), "2026-12-10T09:00")
  await user.type(screen.getByLabelText("วันสิ้นสุดการแข่งขัน"), "2026-12-11T18:00")
  await user.type(screen.getByLabelText("วันปิดรับสมัคร"), "2026-12-01T23:59")
  await user.type(screen.getByLabelText("กติกา"), "ใช้กติกามาตรฐาน")
}
