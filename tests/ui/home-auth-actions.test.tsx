import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { HomeAuthActions } from "@/components/home-auth-actions"

afterEach(cleanup)

describe("HomeAuthActions", () => {
  it("renders Login and Register actions for an anonymous visitor", () => {
    render(<HomeAuthActions isAuthenticated={false} />)

    expect(screen.getByRole("link", { name: "เข้าสู่ระบบ" }).getAttribute("href")).toBe(
      "/login",
    )
    expect(screen.getByRole("link", { name: "สมัครสมาชิก" }).getAttribute("href")).toBe(
      "/register",
    )
  })

  it("renders no authentication actions for an authenticated visitor", () => {
    render(<HomeAuthActions isAuthenticated />)

    expect(screen.queryByRole("link", { name: "เข้าสู่ระบบ" })).toBeNull()
    expect(screen.queryByRole("link", { name: "สมัครสมาชิก" })).toBeNull()
  })
})
