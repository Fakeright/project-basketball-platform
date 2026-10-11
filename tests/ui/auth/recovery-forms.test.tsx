import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

const router = vi.hoisted(() => ({
  push: vi.fn(),
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

describe("account recovery forms", () => {
  it("always presents the generic forgot-password success message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message:
              "หากมีบัญชีอยู่ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ทางอีเมล",
          }),
        ),
      ),
    )
    const user = userEvent.setup()

    render(<ForgotPasswordForm />)
    await user.type(screen.getByLabelText("อีเมล"), "person@example.com")
    await user.click(screen.getByRole("button", { name: "ส่งลิงก์ตั้งรหัสผ่าน" }))

    expect(
      await screen.findByText(
        "หากมีบัญชีอยู่ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ทางอีเมล",
      ),
    ).toBeTruthy()
  })

  it("validates reset confirmation and redirects after success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "ตั้งรหัสผ่านใหม่สำเร็จ",
          redirectTo: "/login",
        }),
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<ResetPasswordForm />)
    await user.type(screen.getByLabelText("รหัสผ่านใหม่"), "new-password123")
    await user.type(
      screen.getByLabelText("ยืนยันรหัสผ่านใหม่"),
      "new-password123",
    )
    await user.click(screen.getByRole("button", { name: "ตั้งรหัสผ่านใหม่" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/reset-password",
      expect.objectContaining({ method: "POST" }),
    )
    expect(await screen.findByText("ตั้งรหัสผ่านใหม่สำเร็จ")).toBeTruthy()
    expect(router.push).toHaveBeenCalledWith("/login")
  })
})
