import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { RegisterForm } from "@/components/auth/register-form"

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe("RegisterForm", () => {
  it("submits a self-service role without offering Platform Admin", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "หากสมัครได้สำเร็จ กรุณาเข้าสู่ระบบ",
          redirectTo: "/login",
        }),
        { status: 201 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<RegisterForm />)

    expect(
      screen.queryByRole("option", { name: "ผู้ดูแลแพลตฟอร์ม" }),
    ).toBeNull()
    await user.type(screen.getByLabelText("ชื่อที่ใช้แสดง"), "เมย์")
    await user.type(screen.getByLabelText("อีเมล"), "may@example.com")
    await user.type(screen.getByLabelText("รหัสผ่าน"), "password123")
    await user.type(
      screen.getByLabelText("ยืนยันรหัสผ่าน"),
      "password123",
    )
    await user.selectOptions(screen.getByLabelText("บทบาท"), "TEAM_MANAGER")
    await user.click(screen.getByRole("button", { name: "สมัครสมาชิก" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({ method: "POST" }),
    )
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      displayName: "เมย์",
      email: "may@example.com",
      role: "TEAM_MANAGER",
    })
    expect(
      await screen.findByText("หากสมัครได้สำเร็จ กรุณาเข้าสู่ระบบ"),
    ).toBeTruthy()
  })

  it("validates password confirmation before sending credentials", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<RegisterForm />)
    await user.type(screen.getByLabelText("ชื่อที่ใช้แสดง"), "May")
    await user.type(screen.getByLabelText("อีเมล"), "may@example.com")
    await user.type(screen.getByLabelText("รหัสผ่าน"), "password123")
    await user.type(screen.getByLabelText("ยืนยันรหัสผ่าน"), "password456")
    await user.click(screen.getByRole("button", { name: "สมัครสมาชิก" }))

    expect(await screen.findByText("รหัสผ่านทั้งสองช่องไม่ตรงกัน")).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("shows that email confirmation is required before login", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message:
            "สมัครสมาชิกแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ",
          redirectTo: "/login",
        }),
        { status: 201 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<RegisterForm />)
    await user.type(screen.getByLabelText("ชื่อที่ใช้แสดง"), "May")
    await user.type(screen.getByLabelText("อีเมล"), "may@example.com")
    await user.type(screen.getByLabelText("รหัสผ่าน"), "password123")
    await user.type(
      screen.getByLabelText("ยืนยันรหัสผ่าน"),
      "password123",
    )
    await user.click(
      screen.getByRole("button", { name: "สมัครสมาชิก" }),
    )

    expect(
      await screen.findByText(
        "สมัครสมาชิกแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ",
      ),
    ).toBeTruthy()
  })
})
