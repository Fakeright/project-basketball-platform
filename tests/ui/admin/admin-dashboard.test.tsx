import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { createAdminDashboardViewModel } from "@/features/admin/presentation/admin-dashboard-view-model"

describe("admin dashboard", () => {
  it("shows operational counts, recent audits, and review queue action", () => {
    const dashboard = createAdminDashboardViewModel({
      metrics: {
        tournaments: 12,
        pendingReviews: 3,
        publishedTournaments: 8,
        activeTournaments: 2,
        teams: 18,
        users: 72,
        registrations: 24,
      },
      recentAudits: [
        {
          id: "audit-1",
          action: "tournament.published",
          actorName: "ผู้ดูแลระบบ",
          entityType: "Tournament",
          entityId: "tournament-1",
          tournamentId: "tournament-1",
          tournamentTitle: "Bangkok Community Cup",
          createdAt: "2026-07-29T02:30:00.000Z",
        },
      ],
    })

    render(<AdminDashboard dashboard={dashboard} />)

    expect(screen.getByRole("heading", { name: "ภาพรวมการจัดการแข่งขัน" })).toBeTruthy()
    expect(screen.getByText("3 รายการรอตรวจ")).toBeTruthy()
    expect(screen.getByText("การแข่งขันทั้งหมด")).toBeTruthy()
    expect(screen.getByText("12")).toBeTruthy()
    expect(screen.getByText("เผยแพร่รายการแข่งขัน")).toBeTruthy()
    expect(screen.getByText("Bangkok Community Cup")).toBeTruthy()
    expect(screen.getByText("ผู้ดูแลระบบ")).toBeTruthy()
    expect(screen.getByRole("link", { name: "เปิดคิวตรวจสอบ" }).getAttribute("href")).toBe("/admin/reviews")
  })
})
