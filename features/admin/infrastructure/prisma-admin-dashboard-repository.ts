import type { PrismaClient } from "@/lib/generated/prisma/client"

import type {
  AdminDashboardReadModel,
  AdminDashboardRepository,
} from "../application/ports/admin-dashboard-repository"

type AdminDashboardPrismaClient = Pick<
  PrismaClient,
  "tournament" | "team" | "user" | "registration" | "auditLog"
>

export class PrismaAdminDashboardRepository
  implements AdminDashboardRepository
{
  constructor(private readonly prisma: AdminDashboardPrismaClient) {}

  async getDashboard(
    recentAuditLimit: number,
  ): Promise<AdminDashboardReadModel> {
    const [
      tournaments,
      pendingReviews,
      publishedTournaments,
      activeTournaments,
      teams,
      users,
      registrations,
      recentAudits,
    ] = await Promise.all([
      this.prisma.tournament.count(),
      this.prisma.tournament.count({ where: { status: "SUBMITTED" } }),
      this.prisma.tournament.count({ where: { status: "PUBLISHED" } }),
      this.prisma.tournament.count({ where: { status: "IN_PROGRESS" } }),
      this.prisma.team.count(),
      this.prisma.user.count(),
      this.prisma.registration.count(),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: recentAuditLimit,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          tournamentId: true,
          createdAt: true,
          actor: { select: { displayName: true } },
          tournament: { select: { title: true } },
        },
      }),
    ])

    return {
      metrics: {
        tournaments,
        pendingReviews,
        publishedTournaments,
        activeTournaments,
        teams,
        users,
        registrations,
      },
      recentAudits: recentAudits.map((audit) => ({
        id: audit.id,
        action: audit.action,
        actorName: audit.actor.displayName,
        entityType: audit.entityType,
        entityId: audit.entityId,
        tournamentId: audit.tournamentId,
        tournamentTitle: audit.tournament?.title ?? null,
        createdAt: audit.createdAt.toISOString(),
      })),
    }
  }
}
