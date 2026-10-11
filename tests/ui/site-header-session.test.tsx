import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SiteHeader } from "@/components/site-header"
import { createTestActor } from "@/tests/fixtures/actor"

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

describe("SiteHeader account session", () => {
  it("links to public results in desktop and mobile navigation", async () => {
    const user = userEvent.setup()
    render(<SiteHeader actor={null} />)

    expect(
      screen.getByRole("link", { name: "ผลการแข่งขัน" }).getAttribute("href"),
    ).toBe("/results")
    await user.click(screen.getByRole("button", { name: "เปิดเมนูนำทาง" }))

    const mobileNavigation = screen.getByRole("navigation", {
      name: "เมนูหลักบนมือถือ",
    })
    expect(
      within(mobileNavigation)
        .getByRole("link", { name: "ผลการแข่งขัน" })
        .getAttribute("href"),
    ).toBe("/results")
  })

  it("keeps the navigation menu available below the desktop breakpoint", () => {
    render(<SiteHeader actor={null} />)

    const menuButton = screen.getByRole("button", { name: "เปิดเมนูนำทาง" })
    expect(menuButton.className).toContain("lg:hidden")
    expect(menuButton.className).not.toContain("md:hidden")
  })

  it("shows login and registration commands for an anonymous visitor", () => {
    render(<SiteHeader actor={null} />)

    expect(screen.getAllByRole("link", { name: "เข้าสู่ระบบ" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("link", { name: "สมัครสมาชิก" }).length).toBeGreaterThan(0)
    expect(screen.queryByText(/กำลังใช้งาน:/)).toBeNull()
    expect(screen.queryByRole("link", { name: "จัดการทีม" })).toBeNull()
  })

  it("shows the current Team Manager identity, role, destination and logout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "ออกจากระบบแล้ว" })),
      ),
    )
    const user = userEvent.setup()
    const actor = createTestActor("manager-1", "TEAM_MANAGER_COACH", {
      displayName: "เมย์",
      email: "may@example.com",
    })

    render(<SiteHeader actor={actor} />)

    expect(screen.getByText("เมย์")).toBeTruthy()
    expect(screen.getByText("may@example.com")).toBeTruthy()
    expect(screen.getByText("กำลังใช้งาน: ผู้จัดการ/โค้ช")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "จัดการทีม" }).getAttribute("href"),
    ).toBe("/team")

    await user.click(screen.getByRole("button", { name: "ออกจากระบบ" }))

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    )
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/"))
    expect(router.refresh).toHaveBeenCalled()
  })
})
