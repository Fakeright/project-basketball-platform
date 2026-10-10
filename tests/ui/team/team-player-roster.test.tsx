import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
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
  it("shows phone details in editable and read-only rows without overflowing the roster grid", () => {
    const editableRender = render(
      <TeamPlayerRoster
        format="FIVE_V_FIVE"
        initialPlayers={[player]}
        teamId="team-1"
      />,
    )

    const editablePhone = screen.getByText("0812345678")
    const editableSummary = editablePhone.closest("div.grid")
    expect(screen.getByText("โทร.")).toBeTruthy()
    expect(editableSummary?.className).toContain("min-w-0")
    expect(editableSummary?.className).toContain("md:grid-cols-2")
    expect(editableSummary?.className).toContain("lg:grid-cols-")
    expect(editablePhone.className).toContain("break-all")

    editableRender.unmount()
    render(
      <TeamPlayerRoster
        format="FIVE_V_FIVE"
        initialPlayers={[player]}
        readOnly
        teamId="team-1"
      />,
    )

    const readOnlyPhone = screen.getByText("0812345678")
    const readOnlySummary = readOnlyPhone.closest("div.grid")
    expect(screen.getByText("โทร.")).toBeTruthy()
    expect(readOnlySummary?.className).toContain("md:grid-cols-2")
    expect(readOnlySummary?.className).toContain("lg:grid-cols-")
    expect(readOnlyPhone.className).toContain("break-all")
    expect(screen.queryByRole("button", { name: /แก้ไขผู้เล่น/ })).toBeNull()
  })

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

  it("validates edit length limits and future birth dates before PATCH while retaining values", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(
      <TeamPlayerRoster
        format="FIVE_V_FIVE"
        initialPlayers={[player]}
        teamId="team-1"
      />,
    )

    await user.click(screen.getByRole("button", { name: "แก้ไขผู้เล่น สมชาย ใจดี" }))
    const editForm = screen.getByRole("group", { name: "แก้ไขผู้เล่น สมชาย ใจดี" })
    const firstName = within(editForm).getByLabelText("ชื่อ")
    const lastName = within(editForm).getByLabelText("นามสกุล")
    const birthDate = within(editForm).getByLabelText("วันเกิด")
    const nickname = within(editForm).getByLabelText("ชื่อเล่น")
    const phone = within(editForm).getByLabelText("เบอร์โทรศัพท์")
    fireEvent.change(firstName, { target: { value: "ช".repeat(81) } })
    fireEvent.change(lastName, { target: { value: "น".repeat(81) } })
    fireEvent.change(birthDate, { target: { value: "2999-01-01" } })
    fireEvent.change(nickname, { target: { value: "ล".repeat(41) } })
    fireEvent.change(phone, { target: { value: "0".repeat(31) } })
    await user.click(within(editForm).getByRole("button", { name: "บันทึกการแก้ไข" }))

    expect(within(editForm).getByText("ชื่อต้องไม่เกิน 80 ตัวอักษร")).toBeTruthy()
    expect(within(editForm).getByText("นามสกุลต้องไม่เกิน 80 ตัวอักษร")).toBeTruthy()
    expect(within(editForm).getByText("วันเกิดต้องไม่เป็นวันที่ในอนาคต")).toBeTruthy()
    expect(within(editForm).getByText("ชื่อเล่นต้องไม่เกิน 40 ตัวอักษร")).toBeTruthy()
    expect(within(editForm).getByText("เบอร์โทรศัพท์ต้องไม่เกิน 30 ตัวอักษร")).toBeTruthy()
    expect((firstName as HTMLInputElement).value).toBe("ช".repeat(81))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("maps PATCH 422 field issues to edit fields while retaining values", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        {
          message: "ข้อมูลผู้เล่นไม่ถูกต้อง",
          issues: [{ field: "birthDate", message: "วันเกิดต้องไม่เป็นวันที่ในอนาคต" }],
        },
        { status: 422 },
      ),
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

    await user.click(screen.getByRole("button", { name: "แก้ไขผู้เล่น สมชาย ใจดี" }))
    const editForm = screen.getByRole("group", { name: "แก้ไขผู้เล่น สมชาย ใจดี" })
    const firstName = within(editForm).getByLabelText("ชื่อ")
    await user.clear(firstName)
    await user.type(firstName, "ก้อง")
    await user.click(within(editForm).getByRole("button", { name: "บันทึกการแก้ไข" }))

    expect(await within(editForm).findByText("วันเกิดต้องไม่เป็นวันที่ในอนาคต")).toBeTruthy()
    expect((firstName as HTMLInputElement).value).toBe("ก้อง")
    expect(within(editForm).getByLabelText("วันเกิด").getAttribute("aria-invalid")).toBe("true")
  })

  it("warns in confirmation when removal at the 5v5 threshold would fall below minimum", async () => {
    const confirmMock = vi.fn(() => false)
    vi.stubGlobal("confirm", confirmMock)
    const user = userEvent.setup()
    render(
      <TeamPlayerRoster
        format="FIVE_V_FIVE"
        initialPlayers={createPlayers(5)}
        teamId="team-1"
      />,
    )

    await user.click(screen.getByRole("button", { name: "นำผู้เล่น ผู้เล่น1 ทดสอบ ออกจากทีม" }))

    expect(confirmMock).toHaveBeenCalledWith(
      "ยืนยันการนำ ผู้เล่น1 ทดสอบ ออกจากทีม\nคำเตือน: หลังนำออก ทีม 5v5 จะเหลือผู้เล่น 4 คน ซึ่งต่ำกว่าขั้นต่ำ 5 คนสำหรับสมัครแข่งขัน",
    )
  })

  it("uses the normal confirmation above the format minimum", async () => {
    const confirmMock = vi.fn(() => false)
    vi.stubGlobal("confirm", confirmMock)
    const user = userEvent.setup()
    render(
      <TeamPlayerRoster
        format="FIVE_V_FIVE"
        initialPlayers={createPlayers(6)}
        teamId="team-1"
      />,
    )

    await user.click(screen.getByRole("button", { name: "นำผู้เล่น ผู้เล่น1 ทดสอบ ออกจากทีม" }))

    expect(confirmMock).toHaveBeenCalledWith("ยืนยันการนำ ผู้เล่น1 ทดสอบ ออกจากทีม")
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

    expect(confirmMock).toHaveBeenCalledWith(
      "ยืนยันการนำ สมชาย ใจดี ออกจากทีม\nคำเตือน: หลังนำออก ทีม 3v3 จะเหลือผู้เล่น 0 คน ซึ่งต่ำกว่าขั้นต่ำ 3 คนสำหรับสมัครแข่งขัน",
    )
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams/team-1/players/player-1",
      expect.objectContaining({ method: "DELETE" }),
    )
    expect(await screen.findByText("ผู้เล่นที่ใช้งาน 0 คน")).toBeTruthy()
    expect(screen.getByText("ยังไม่มีผู้เล่นในทีม")).toBeTruthy()
  })
})

function createPlayers(count: number): TeamPlayer[] {
  return Array.from({ length: count }, (_, index) => ({
    ...player,
    id: `player-${index + 1}`,
    firstName: `ผู้เล่น${index + 1}`,
    lastName: "ทดสอบ",
    jerseyNumber: index + 1,
  }))
}
