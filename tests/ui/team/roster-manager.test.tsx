import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { RosterManager } from "@/components/team/roster-manager"

const candidates = [
  { id: "player-1", displayName: "Player One", role: "PLAYER" as const },
]

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("RosterManager", () => {
  it("shows an empty state and labelled member controls", () => {
    render(<RosterManager teamId="team-1" members={[]} candidates={candidates} />)

    expect(screen.getByText("ยังไม่มีผู้เล่นในทีม")).toBeTruthy()
    expect(screen.getByLabelText("สมาชิก")).toBeTruthy()
    expect(screen.getByLabelText("หน้าที่ในทีม")).toBeTruthy()
    expect(screen.queryByRole("option", { name: "โค้ช" })).toBeNull()
  })

  it("adds the selected member with the selected team role", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ member: { id: "member-1" } }), {
        status: 201,
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<RosterManager teamId="team-1" members={[]} candidates={candidates} />)

    await user.selectOptions(screen.getByLabelText("สมาชิก"), "player-1")
    await user.selectOptions(screen.getByLabelText("หน้าที่ในทีม"), "PLAYER")
    await user.click(screen.getByRole("button", { name: "เพิ่มสมาชิก" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams/team-1/members",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ userId: "player-1", role: "PLAYER" }),
      }),
    )
    expect(await screen.findByText("เพิ่มสมาชิกแล้ว")).toBeTruthy()
  })
})
