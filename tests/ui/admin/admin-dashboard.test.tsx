import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { AdminDashboard } from "@/components/admin/admin-dashboard"

describe("admin dashboard", () => {
  it("shows operational counts and review queue action", () => {
    render(<AdminDashboard metrics={{ pendingReviews: 3, publishedTournaments: 8, activeTournaments: 2, registrations: 24 }} />)

    expect(screen.getByRole("heading", { name: "ภาพรวมการจัดการแข่งขัน" })).toBeTruthy()
    expect(screen.getByText("3 รายการรอตรวจ")).toBeTruthy()
    expect(screen.getByRole("link", { name: "เปิดคิวตรวจสอบ" }).getAttribute("href")).toBe("/admin/reviews")
  })
})
