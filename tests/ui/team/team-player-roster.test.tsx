import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TeamPlayerRoster } from "@/components/team/team-player-roster"
import type { TeamPlayer } from "@/features/team-management/domain/team"

const player: TeamPlayer = {
  id: "player-1",
  teamId: "team-1",
  firstName: "สมชาย",
  lastName: "ใจดี",
  nickname: "ชาย",
  birthDate: "2010-02-03",
  jerseyNumber: 4,
  position: "PG",
  phone: "0812345678",
  isActive: true,
  deactivatedAt: null,
  createdAt: "2026-08-07T00:00:00.000Z",
  updatedAt: "2026-08-07T00:00:00.000Z",
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("TeamPlayerRoster", () => {
  it("shows the active count, Thai empty state, format minimum warning, and no account selector", () => {
    const firstRender = render(
      <TeamPlayerRoster format="FIVE_V_FIVE" initialPlayers={[]} teamId="team-1" />,
    )

    expect(screen.getByText("ผู้เล่นที่ใช้งาน 0 คน")).toBeTruthy()
    expect(screen.getByText("ยังไม่มีผู้เล่นในทีม")).toBeTruthy()
    expect(screen.getByText("ทีม 5v5 ต้องมีผู้เล่นอย่างน้อย 5 คนก่อนสมัครแข่งขัน")).toBeTruthy()
    expect(screen.queryByLabelText("สมาชิก")).toBeNull()

    firstRender.unmount()
    render(
      <TeamPlayerRoster
        format="THREE_V_THREE"
        initialPlayers={[player, { ...player, id: "player-2", jerseyNumber: 5 }]}
        teamId="team-1"
      />,
    )
    expect(screen.getByText("ทีม 3v3 ต้องมีผู้เล่นอย่างน้อย 3 คนก่อนสมัครแข่งขัน")).toBeTruthy()
  })

  it("edits a player with a PATCH and updates the visible roster", async () => {
    const updatedPlayer = { ...player, firstName: "ก้อง" }
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ player: updatedPlayer }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(
      <TeamPlayerRoster
        format="FIVE_V_FIVE"
        initialPlayers={[player]}
        teamId="team-1"
      />,
    )

    const editButton = screen.getByRole("button", { name: "แก้ไขผู้เล่น สมชาย ใจดี" })
    expect(editButton.getAttribute("title")).toBe("แก้ไขผู้เล่น")
    await user.click(editButton)

    const editForm = screen.getByRole("group", { name: "แก้ไขผู้เล่น สมชาย ใจดี" })
    const firstName = within(editForm).getByLabelText("ชื่อ")
    await user.clear(firstName)
    await user.type(firstName, "ก้อง")
    await user.click(within(editForm).getByRole("button", { name: "บันทึกการแก้ไข" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams/team-1/players/player-1",
      expect.objectContaining({
        method: "PATCH",
      }),
    )
    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect(JSON.parse(request.body as string)).toEqual({
      firstName: "ก้อง",
      lastName: "ใจดี",
      nickname: "ชาย",
      birthDate: "2010-02-03",
      jerseyNumber: 4,
      position: "PG",
      phone: "0812345678",
    })
    expect(await screen.findByText("ก้อง ใจดี")).toBeTruthy()
  })

  it("confirms DELETE, deactivates the player, and updates the active count", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    const confirmMock = vi.fn(() => true)
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("confirm", confirmMock)
    const user = userEvent.setup()
    render(
      <TeamPlayerRoster
        format="THREE_V_THREE"
        initialPlayers={[player]}
        teamId="team-1"
      />,
    )

    const removeButton = screen.getByRole("button", { name: "นำผู้เล่น สมชาย ใจดี ออกจากทีม" })
    expect(removeButton.getAttribute("title")).toBe("นำผู้เล่นออกจากทีม")
    await user.click(removeButton)

    expect(confirmMock).toHaveBeenCalledWith("ยืนยันการนำ สมชาย ใจดี ออกจากทีม")
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams/team-1/players/player-1",
      expect.objectContaining({ method: "DELETE" }),
    )
    expect(await screen.findByText("ผู้เล่นที่ใช้งาน 0 คน")).toBeTruthy()
    expect(screen.getByText("ยังไม่มีผู้เล่นในทีม")).toBeTruthy()
  })
})
