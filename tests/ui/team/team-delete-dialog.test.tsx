import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TeamDeleteDialog } from "@/components/team/team-delete-dialog"

const router = {
  push: vi.fn(),
  refresh: vi.fn(),
}

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  router.push.mockReset()
  router.refresh.mockReset()
})

describe("TeamDeleteDialog", () => {
  it("requires the exact typed name and sends only confirmation name and version", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        outcome: "DEACTIVATED",
        message: "ปิดใช้งานทีมแล้วและเก็บประวัติการแข่งขันไว้",
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <TeamDeleteDialog
        team={{ id: "team-1", name: "Bangkok Ballers", version: 2 }}
      />,
    )

    await user.click(
      screen.getByRole("button", { name: "ลบหรือปิดใช้งานทีม" }),
    )
    expect(
      screen.getByRole("dialog", { name: "ยืนยันการลบหรือปิดใช้งานทีม" }),
    ).toBeTruthy()
    expect(
      screen.getByText(/ระบบจะเก็บประวัติการแข่งขันไว้โดยปิดใช้งานทีม/),
    ).toBeTruthy()

    const confirmation = screen.getByLabelText(
      "พิมพ์ชื่อทีม Bangkok Ballers เพื่อยืนยัน",
    )
    const confirmButton = screen.getByRole("button", {
      name: "ยืนยันลบหรือปิดใช้งานทีม",
    })
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true)

    await user.type(confirmation, "bangkok ballers")
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true)
    await user.clear(confirmation)
    await user.type(confirmation, "Bangkok Ballers")
    expect((confirmButton as HTMLButtonElement).disabled).toBe(false)
    await user.click(confirmButton)

    expect(fetchMock).toHaveBeenCalledWith("/api/teams/team-1", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirmationName: "Bangkok Ballers",
        expectedVersion: 2,
      }),
    })
    expect(
      await screen.findByText("ปิดใช้งานทีมแล้วและเก็บประวัติการแข่งขันไว้"),
    ).toBeTruthy()
    expect(router.push).toHaveBeenCalledWith("/team")
    expect(router.refresh).toHaveBeenCalledOnce()
  })

  it("keeps the dialog open and announces a typed server error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            message:
              "ไม่สามารถลบหรือปิดใช้งานทีมได้ กรุณายกเลิกหรือถอนใบสมัครที่รอดำเนินการหรืออนุมัติแล้วก่อน",
          },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()

    render(
      <TeamDeleteDialog
        team={{ id: "team-1", name: "Bangkok Ballers", version: 2 }}
      />,
    )
    await user.click(
      screen.getByRole("button", { name: "ลบหรือปิดใช้งานทีม" }),
    )
    await user.type(
      screen.getByLabelText("พิมพ์ชื่อทีม Bangkok Ballers เพื่อยืนยัน"),
      "Bangkok Ballers",
    )
    await user.click(
      screen.getByRole("button", { name: "ยืนยันลบหรือปิดใช้งานทีม" }),
    )

    expect(
      await screen.findByText(
        "ไม่สามารถลบหรือปิดใช้งานทีมได้ กรุณายกเลิกหรือถอนใบสมัครที่รอดำเนินการหรืออนุมัติแล้วก่อน",
      ),
    ).toBeTruthy()
    expect(
      screen.getByRole("dialog", { name: "ยืนยันการลบหรือปิดใช้งานทีม" }),
    ).toBeTruthy()
    expect(router.push).not.toHaveBeenCalled()
  })
})
