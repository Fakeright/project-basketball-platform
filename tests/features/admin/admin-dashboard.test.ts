import { describe, expect, it, vi } from "vitest"

import { getAdminDashboard } from "@/features/admin/application/get-admin-dashboard"
import type { AdminDashboardRepository } from "@/features/admin/application/ports/admin-dashboard-repository"
import { PrismaAdminDashboardRepository } from "@/features/admin/infrastructure/prisma-admin-dashboard-repository"

describe("getAdminDashboard", () => {
  it("requests a bounded recent audit feed", async () => {
    const dashboard = {
      metrics: {
        tournaments: 12,
        pendingReviews: 3,
        publishedTournaments: 4,
        activeTournaments: 2,
        teams: 18,
        users: 72,
        registrations: 24,
      },
      recentAudits: [],
    }
    const repository: AdminDashboardRepository = {
      getDashboard: vi.fn(async () => dashboard),
    }

    await expect(getAdminDashboard(repository)).resolves.toEqual(dashboard)
    expect(repository.getDashboard).toHaveBeenCalledWith(8)
  })
})

describe("PrismaAdminDashboardRepository", () => {
  it("reads real counts and maps recent audits", async () => {
    const tournamentCount = vi
      .fn()
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2)
    const prisma = {
      tournament: { count: tournamentCount },
      team: { count: vi.fn(async () => 18) },
      user: { count: vi.fn(async () => 72) },
      registration: { count: vi.fn(async () => 24) },
      auditLog: {
        findMany: vi.fn(async () => [
          {
            id: "audit-1",
            action: "tournament.published",
            entityType: "Tournament",
            entityId: "tournament-1",
            tournamentId: "tournament-1",
            createdAt: new Date("2026-07-29T02:30:00.000Z"),
            actor: { displayName: "ผู้ดูแลระบบ" },
            tournament: { title: "Bangkok Community Cup" },
          },
        ]),
      },
    }

    const repository = new PrismaAdminDashboardRepository(
      prisma as never,
    )
    const dashboard = await repository.getDashboard(8)

    expect(tournamentCount.mock.calls).toEqual([
      [],
      [{ where: { status: "SUBMITTED" } }],
      [{ where: { status: "PUBLISHED" } }],
      [{ where: { status: "IN_PROGRESS" } }],
    ])
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    )
    expect(dashboard).toEqual({
      metrics: {
        tournaments: 12,
        pendingReviews: 3,
        publishedTournaments: 4,
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
  })
})
