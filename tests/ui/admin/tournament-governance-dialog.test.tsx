import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentGovernanceDialog } from "@/components/admin/tournament-governance-dialog"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }))

const tournament = {
  id: "tournament-1",
  title: "COURTSIDE Open",
  version: 4,
}

const suspendAction = {
  action: "SUSPEND" as const,
  label: "ระงับรายการ",
  dialogTitle: "ระงับรายการแข่งขัน",
  description: "รายการจะหายจากพื้นที่สาธารณะจนกว่าจะยกเลิกการระงับ",
  confirmLabel: "ยืนยันการระงับ",
  destructive: true,
  requiresConfirmationTitle: false,
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("TournamentGovernanceDialog", () => {
  it("submits a reason and refreshes the governance page", async () => {
    const fetchMock = vi.fn(async () => Response.json({ tournament: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(
      <TournamentGovernanceDialog
        action={suspendAction}
        tournament={tournament}
      />,
    )

    await user.click(screen.getByRole("button", { name: "ระงับรายการ" }))
    await user.type(screen.getByLabelText("เหตุผล"), "ตรวจสอบข้อมูลผู้จัด")
    await user.click(screen.getByRole("button", { name: "ยืนยันการระงับ" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/tournaments/tournament-1/governance",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          action: "SUSPEND",
          version: 4,
          reason: "ตรวจสอบข้อมูลผู้จัด",
        }),
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it("disables dialog controls while a command is pending", async () => {
    let resolveRequest: ((response: Response) => void) | undefined
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveRequest = resolve
          }),
      ),
    )
    const user = userEvent.setup()
    render(
      <TournamentGovernanceDialog
        action={suspendAction}
        tournament={tournament}
      />,
    )

    await user.click(screen.getByRole("button", { name: "ระงับรายการ" }))
    await user.type(screen.getByLabelText("เหตุผล"), "ตรวจสอบข้อมูลผู้จัด")
    await user.click(screen.getByRole("button", { name: "ยืนยันการระงับ" }))

    expect((screen.getByLabelText("เหตุผล") as HTMLTextAreaElement).disabled).toBe(
      true,
    )
    expect(
      (screen.getByRole("button", {
        name: "กำลังดำเนินการ",
      }) as HTMLButtonElement).disabled,
    ).toBe(true)

    resolveRequest?.(Response.json({ tournament: {} }))
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it("keeps the dialog open and announces a Thai API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { message: "ข้อมูลถูกแก้ไขจากอีกหน้าต่าง กรุณาโหลดใหม่" },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()
    render(
      <TournamentGovernanceDialog
        action={suspendAction}
        tournament={tournament}
      />,
    )

    await user.click(screen.getByRole("button", { name: "ระงับรายการ" }))
    await user.type(screen.getByLabelText("เหตุผล"), "ตรวจสอบข้อมูลผู้จัด")
    await user.click(screen.getByRole("button", { name: "ยืนยันการระงับ" }))

    const error = await screen.findByText(
      "ข้อมูลถูกแก้ไขจากอีกหน้าต่าง กรุณาโหลดใหม่",
    )
    expect(error.getAttribute("aria-live")).toBe("assertive")
    expect(screen.getByRole("dialog", { name: "ระงับรายการแข่งขัน" })).toBeTruthy()
    expect(refresh).not.toHaveBeenCalled()
  })

  it("requires the exact tournament title before permanent deletion", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(
      <TournamentGovernanceDialog
        action={{
          action: "PERMANENT_DELETE",
          label: "ลบถาวร",
          dialogTitle: "ลบรายการแข่งขันถาวร",
          description: "ลบได้เฉพาะฉบับร่างที่ไม่มีข้อมูลสัมพันธ์",
          confirmLabel: "ยืนยันการลบถาวร",
          destructive: true,
          requiresConfirmationTitle: true,
        }}
        tournament={tournament}
      />,
    )

    await user.click(screen.getByRole("button", { name: "ลบถาวร" }))
    await user.type(screen.getByLabelText("เหตุผล"), "สร้างรายการผิด")
    await user.type(screen.getByLabelText("พิมพ์ชื่อรายการเพื่อยืนยัน"), "COURTSIDE")
    expect(
      (screen.getByRole("button", {
        name: "ยืนยันการลบถาวร",
      }) as HTMLButtonElement).disabled,
    ).toBe(true)

    await user.clear(screen.getByLabelText("พิมพ์ชื่อรายการเพื่อยืนยัน"))
    await user.type(
      screen.getByLabelText("พิมพ์ชื่อรายการเพื่อยืนยัน"),
      tournament.title,
    )
    await user.click(screen.getByRole("button", { name: "ยืนยันการลบถาวร" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/tournaments/tournament-1/governance",
      expect.objectContaining({
        body: JSON.stringify({
          action: "PERMANENT_DELETE",
          version: 4,
          reason: "สร้างรายการผิด",
          confirmationTitle: tournament.title,
        }),
      }),
    )
  })

  it("disables unavailable actions and explains their prerequisites", () => {
    render(
      <TournamentGovernanceDialog
        action={suspendAction}
        tournament={tournament}
        unavailableReasons={["ต้องยกเลิกการเก็บถาวรก่อนดำเนินการ"]}
      />,
    )

    expect(
      (screen.getByRole("button", {
        name: "ระงับรายการ",
      }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect(screen.getByText("ต้องยกเลิกการเก็บถาวรก่อนดำเนินการ")).toBeTruthy()
  })
})
