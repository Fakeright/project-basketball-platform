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
          province: "Bangkok",
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
          province: "Bangkok",
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
    await user.type(screen.getByLabelText("จังหวัด"), "Bangkok")
    await user.click(screen.getByRole("button", { name: "บันทึกทีม" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Bangkok Ballers", province: "Bangkok" }),
      }),
    )
    expect(await screen.findByText("บันทึกทีมแล้ว")).toBeTruthy()
  })
})
