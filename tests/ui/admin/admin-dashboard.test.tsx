import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { createAdminDashboardViewModel } from "@/features/admin/presentation/admin-dashboard-view-model"

afterEach(cleanup)

describe("admin dashboard", () => {
  it("prioritizes review and governance queues before operational metrics", () => {
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
      reviewQueue: [
        {
          id: "tournament-submitted",
          title: "COURTSIDE Review Cup",
          organizerName: "สมาคมบาสกรุงเทพ",
          status: "SUBMITTED",
          governanceReason: null,
          updatedAt: "2026-07-30T02:30:00.000Z",
        },
      ],
      governanceQueue: [
        {
          id: "tournament-suspended",
          title: "Suspended Summer League",
          organizerName: "ชมรมบาสเยาวชน",
          status: "PUBLISHED",
          governanceReason: null,
          updatedAt: "2026-07-31T02:30:00.000Z",
        },
      ],
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

    expect(
      screen.getByRole("heading", { name: "ภาพรวมการจัดการแข่งขัน" }),
    ).toBeTruthy()
    expect(screen.getByRole("heading", { name: "งานที่ต้องตรวจ" })).toBeTruthy()
    expect(screen.getByText("COURTSIDE Review Cup")).toBeTruthy()
    expect(
      screen
        .getByRole("link", { name: "ตรวจรายการ COURTSIDE Review Cup" })
        .getAttribute("href"),
    ).toBe("/admin/reviews/tournament-submitted")
    expect(
      screen.getByRole("heading", { name: "รายการที่ถูกระงับ" }),
    ).toBeTruthy()
    expect(
      screen
        .getByRole("link", { name: "เปิดหน้ากำกับ Suspended Summer League" })
        .getAttribute("href"),
    ).toBe("/admin/tournaments/tournament-suspended")
    expect(screen.getByText("ไม่ระบุเหตุผลล่าสุด")).toBeTruthy()
    expect(screen.getByText("3 รายการรอตรวจ")).toBeTruthy()
    expect(screen.getByText("การแข่งขันทั้งหมด")).toBeTruthy()
    expect(screen.getByText("12")).toBeTruthy()
    expect(screen.getByText("เผยแพร่รายการแข่งขัน")).toBeTruthy()
    expect(screen.getByText("Bangkok Community Cup")).toBeTruthy()
    expect(screen.getByText("ผู้ดูแลระบบ")).toBeTruthy()
    expect(
      screen
        .getByRole("link", { name: "เปิดคิวตรวจสอบ" })
        .getAttribute("href"),
    ).toBe("/admin/reviews")

    const headings = screen
      .getAllByRole("heading")
      .map((heading) => heading.textContent)
    expect(headings.indexOf("งานที่ต้องตรวจ")).toBeLessThan(
      headings.indexOf("รายการที่ถูกระงับ"),
    )
    expect(headings.indexOf("รายการที่ถูกระงับ")).toBeLessThan(
      headings.indexOf("สถิติการดำเนินงาน"),
    )
    expect(headings.indexOf("สถิติการดำเนินงาน")).toBeLessThan(
      headings.indexOf("กิจกรรมล่าสุด"),
    )
  })

  it("shows an explicit empty state while keeping the review queue link available", () => {
    const dashboard = createAdminDashboardViewModel({
      metrics: {
        tournaments: 0,
        pendingReviews: 0,
        publishedTournaments: 0,
        activeTournaments: 0,
        teams: 0,
        users: 0,
        registrations: 0,
      },
      reviewQueue: [],
      governanceQueue: [],
      recentAudits: [],
    })

    render(<AdminDashboard dashboard={dashboard} />)

    expect(screen.getByText("ไม่มีรายการรอตรวจ")).toBeTruthy()
    expect(
      screen
        .getByRole("link", { name: "เปิดคิวตรวจสอบ" })
        .getAttribute("href"),
    ).toBe("/admin/reviews")
  })
})
