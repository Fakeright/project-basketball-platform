import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentEditor } from "@/components/admin/tournament-editor"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("TournamentEditor", () => {
  it("saves a valid tournament draft", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ tournament: { id: "tournament-4" } }), {
        status: 201,
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TournamentEditor initialTournament={null} />)

    await user.type(screen.getByLabelText("ชื่อรายการ"), "Chiang Rai Cup")
    await user.type(screen.getByLabelText("รายละเอียด"), "การแข่งขันระดับชุมชน")
    await user.type(screen.getByLabelText("จังหวัด"), "เชียงราย")
    await user.type(screen.getByLabelText("สถานที่"), "สนามกีฬากลาง")
    await user.type(screen.getByLabelText("รุ่นอายุ"), "Open")
    await user.type(screen.getByLabelText("วันเริ่มแข่งขัน"), "2026-12-10T09:00")
    await user.type(screen.getByLabelText("วันสิ้นสุดการแข่งขัน"), "2026-12-11T18:00")
    await user.type(screen.getByLabelText("วันปิดรับสมัคร"), "2026-12-01T23:59")
    await user.type(screen.getByLabelText("กติกา"), "ใช้กติกามาตรฐาน")
    await user.click(screen.getByRole("button", { name: "บันทึกฉบับร่าง" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/tournaments",
      expect.objectContaining({ method: "POST" }),
    )
    expect(await screen.findByText("บันทึกฉบับร่างแล้ว")).toBeTruthy()
  })

  it("shows a deadline error before submitting", async () => {
    const user = userEvent.setup()

    render(
      <TournamentEditor
        initialTournament={{
          id: "tournament-1",
          title: "Chiang Rai Cup",
          description: "การแข่งขันระดับชุมชน",
          province: "เชียงราย",
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
