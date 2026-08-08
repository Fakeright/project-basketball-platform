import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TeamPlayerBatchForm } from "@/components/team/team-player-batch-form"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("TeamPlayerBatchForm", () => {
  it("starts with five labelled player rows and supports adding and removing rows", async () => {
    const user = userEvent.setup()
    render(<TeamPlayerBatchForm onPlayersAdded={vi.fn()} teamId="team-1" />)

    const rows = screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })
    expect(rows).toHaveLength(5)
    for (const label of [
      "ชื่อ",
      "นามสกุล",
      "วันเกิด",
      "ชื่อเล่น",
      "เบอร์เสื้อ",
      "ตำแหน่ง",
      "เบอร์โทรศัพท์",
    ]) {
      expect(within(rows[0]).getByLabelText(label)).toBeTruthy()
    }

    const desktopHeader = document.querySelector("[data-player-column-header]")
    expect(desktopHeader?.getAttribute("aria-hidden")).toBe("true")
    expect(desktopHeader?.className).toContain("xl:grid")
    for (const heading of [
      "ชื่อ",
      "นามสกุล",
      "วันเกิด",
      "ชื่อเล่น",
      "เบอร์เสื้อ",
      "ตำแหน่ง",
      "เบอร์โทรศัพท์",
      "คำสั่ง",
    ]) {
      expect(within(desktopHeader as HTMLElement).getByText(heading)).toBeTruthy()
    }

    await user.click(screen.getByRole("button", { name: "เพิ่มแถว" }))
    expect(screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })).toHaveLength(6)

    await user.click(screen.getByRole("button", { name: "ลบผู้เล่นคนที่ 6" }))
    expect(screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })).toHaveLength(5)
  })

  it("omits blank rows and sends all completed rows in one atomic POST", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ players: [] }, { status: 201 }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<TeamPlayerBatchForm onPlayersAdded={vi.fn()} teamId="team-1" />)

    const rows = screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })
    fillRequiredFields(rows[0], "สมชาย", "ใจดี", "2010-02-03")
    fireEvent.change(within(rows[0]).getByLabelText("ชื่อเล่น"), { target: { value: "ชาย" } })
    fireEvent.change(within(rows[0]).getByLabelText("เบอร์เสื้อ"), { target: { value: "4" } })
    await user.selectOptions(within(rows[0]).getByLabelText("ตำแหน่ง"), "PG")
    fireEvent.change(within(rows[0]).getByLabelText("เบอร์โทรศัพท์"), { target: { value: "0812345678" } })
    fillRequiredFields(rows[2], "สุดา", "แข็งแรง", "2011-04-05")

    await user.click(screen.getByRole("button", { name: "บันทึกผู้เล่นทั้งหมด" }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams/team-1/players/batch",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          players: [
            {
              firstName: "สมชาย",
              lastName: "ใจดี",
              birthDate: "2010-02-03",
              nickname: "ชาย",
              jerseyNumber: 4,
              position: "PG",
              phone: "0812345678",
            },
            {
              firstName: "สุดา",
              lastName: "แข็งแรง",
              birthDate: "2011-04-05",
              nickname: null,
              jerseyNumber: null,
              position: null,
              phone: null,
            },
          ],
        }),
      }),
    )
  })

  it("rejects a partial row before fetch and focuses the error summary", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<TeamPlayerBatchForm onPlayersAdded={vi.fn()} teamId="team-1" />)

    const firstRow = screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })[0]
    await user.type(within(firstRow).getByLabelText("ชื่อ"), "สมชาย")
    await user.click(screen.getByRole("button", { name: "บันทึกผู้เล่นทั้งหมด" }))

    const summary = screen.getByRole("alert")
    expect(document.activeElement).toBe(summary)
    expect(within(firstRow).getByText("กรุณาระบุนามสกุลผู้เล่น")).toBeTruthy()
    expect(within(firstRow).getByText("กรุณาระบุวันเกิดผู้เล่น")).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("retains values and maps indexed 422 issues back to nonblank source rows", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        {
          message: "ข้อมูลผู้เล่นไม่ถูกต้อง",
          issues: [{ row: 1, field: "jerseyNumber", message: "เบอร์เสื้อนี้ถูกใช้แล้ว" }],
        },
        { status: 422 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<TeamPlayerBatchForm onPlayersAdded={vi.fn()} teamId="team-1" />)

    const rows = screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })
    fillRequiredFields(rows[0], "สมชาย", "ใจดี", "2010-02-03")
    fillRequiredFields(rows[2], "สุดา", "แข็งแรง", "2011-04-05")
    await user.type(within(rows[2]).getByLabelText("เบอร์เสื้อ"), "4")
    await user.click(screen.getByRole("button", { name: "บันทึกผู้เล่นทั้งหมด" }))

    const summary = await screen.findByRole("alert")
    expect(document.activeElement).toBe(summary)
    expect(within(rows[2]).getByText("เบอร์เสื้อนี้ถูกใช้แล้ว")).toBeTruthy()
    expect((within(rows[2]).getByLabelText("ชื่อ") as HTMLInputElement).value).toBe("สุดา")
    expect(within(rows[0]).queryByText("เบอร์เสื้อนี้ถูกใช้แล้ว")).toBeNull()
  })

  it("keeps row structure stable and blocks duplicate submits while pending", async () => {
    let resolveRequest!: (response: Response) => void
    const fetchMock = vi.fn().mockImplementation(
      () => new Promise<Response>((resolve) => {
        resolveRequest = resolve
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<TeamPlayerBatchForm onPlayersAdded={vi.fn()} teamId="team-1" />)

    const firstRow = screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })[0]
    fillRequiredFields(firstRow, "สมชาย", "ใจดี", "2010-02-03")
    await user.click(screen.getByRole("button", { name: "บันทึกผู้เล่นทั้งหมด" }))

    const pendingButton = screen.getByRole("button", { name: "กำลังบันทึกผู้เล่น" })
    expect((pendingButton as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })).toHaveLength(5)
    expect((screen.getByRole("button", { name: "เพิ่มแถว" }) as HTMLButtonElement).disabled).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveRequest(Response.json({ players: [] }, { status: 201 }))
    await waitFor(() => expect((pendingButton as HTMLButtonElement).disabled).toBe(false))
  })
})

function fillRequiredFields(
  row: HTMLElement,
  firstName: string,
  lastName: string,
  birthDate: string,
) {
  fireEvent.change(within(row).getByLabelText("ชื่อ"), { target: { value: firstName } })
  fireEvent.change(within(row).getByLabelText("นามสกุล"), { target: { value: lastName } })
  fireEvent.change(within(row).getByLabelText("วันเกิด"), { target: { value: birthDate } })
}
