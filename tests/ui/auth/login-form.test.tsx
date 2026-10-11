import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { LoginForm } from "@/components/auth/login-form"

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

describe("LoginForm", () => {
  it("allows existing accounts with passwords shorter than the registration policy", async () => {
    const user = userEvent.setup()

    render(<LoginForm />)
    const passwordInput = screen.getByLabelText("รหัสผ่าน")
    await user.type(passwordInput, "six123")

    expect(passwordInput.getAttribute("minlength")).toBeNull()
    expect((passwordInput as HTMLInputElement).checkValidity()).toBe(true)
  })

  it("submits credentials and the requested safe next path", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "เข้าสู่ระบบสำเร็จ",
          redirectTo: "/team",
        }),
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<LoginForm nextPath="/team" />)

    await user.type(screen.getByLabelText("อีเมล"), "manager@example.com")
    await user.type(screen.getByLabelText("รหัสผ่าน"), "password123")
    await user.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" }),
    )
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      email: "manager@example.com",
      password: "password123",
      next: "/team",
    })
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/team"))
    expect(router.refresh).toHaveBeenCalled()
  })

  it("shows a generic fallback without exposing malformed provider details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("upstream secret details", {
          status: 503,
          headers: { "content-type": "text/plain" },
        }),
      ),
    )
    const user = userEvent.setup()

    render(<LoginForm />)
    await user.type(screen.getByLabelText("อีเมล"), "may@example.com")
    await user.type(screen.getByLabelText("รหัสผ่าน"), "password123")
    await user.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }))

    expect(
      await screen.findByText("ไม่สามารถเข้าสู่ระบบได้ในขณะนี้"),
    ).toBeTruthy()
    expect(screen.queryByText("upstream secret details")).toBeNull()
  })
})
