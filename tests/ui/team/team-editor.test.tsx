import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TeamEditor } from "@/components/team/team-editor"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("TeamEditor", () => {
  it("shows an Admin Override notice to platform admins editing a team", () => {
    render(
      <TeamEditor
        adminOverride
        initialTeam={{
          id: "team-1",
          name: "Bangkok Ballers",
          provinceCode: "10",
          province: "Bangkok",
          format: "FIVE_V_FIVE",
          version: 2,
        }}
      />,
    )

    expect(
      screen.getByText("ผู้ดูแลระบบกำลังจัดการทีมนี้ในโหมด Admin Override"),
    ).toBeTruthy()
  })

  it("does not show an Admin Override notice to team managers", () => {
    render(
      <TeamEditor
        adminOverride={false}
        initialTeam={{
          id: "team-1",
          name: "Bangkok Ballers",
          provinceCode: "10",
          province: "Bangkok",
          format: "FIVE_V_FIVE",
          version: 2,
        }}
      />,
    )

    expect(
      screen.queryByText("ผู้ดูแลระบบกำลังจัดการทีมนี้ในโหมด Admin Override"),
    ).toBeNull()
  })

  it("creates a team through the team route", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ team: { id: "team-1" } }), {
        status: 201,
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TeamEditor initialTeam={null} />)

    await user.type(screen.getByLabelText("ชื่อทีม"), "Bangkok Ballers")
    const province = screen.getByLabelText("จังหวัด")
    await user.click(province)
    await user.type(province, "Bangkok")
    await user.click(await screen.findByRole("option", { name: /กรุงเทพมหานคร.*Bangkok/i }))
    await user.selectOptions(screen.getByLabelText("รูปแบบทีม"), "THREE_V_THREE")
    await user.click(screen.getByRole("button", { name: "บันทึกทีม" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Bangkok Ballers",
          provinceCode: "10",
          format: "THREE_V_THREE",
        }),
      }),
    )
    expect(await screen.findByText("บันทึกทีมแล้ว")).toBeTruthy()
  })

  it("updates a team with its current version and shows actionable conflict copy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        { message: "ข้อมูลทีมมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง" },
        { status: 409 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <TeamEditor
        initialTeam={{
          id: "team-1",
          name: "Bangkok Ballers",
          provinceCode: "10",
          province: "Bangkok",
          format: "FIVE_V_FIVE",
          version: 2,
        }}
      />,
    )

    await user.selectOptions(screen.getByLabelText("รูปแบบทีม"), "THREE_V_THREE")
    await user.click(screen.getByRole("button", { name: "บันทึกทีม" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams/team-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          name: "Bangkok Ballers",
          provinceCode: "10",
          format: "THREE_V_THREE",
          expectedVersion: 2,
        }),
      }),
    )
    expect(
      await screen.findByText(
        "ข้อมูลทีมมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง",
      ),
    ).toBeTruthy()
  })
})
