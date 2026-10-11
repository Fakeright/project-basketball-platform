import type { PrismaClient } from "@/lib/generated/prisma/client"

import type {
  AdminDashboardReadModel,
  AdminDashboardRepository,
} from "../application/ports/admin-dashboard-repository"

type AdminDashboardPrismaClient = Pick<
  PrismaClient,
  "tournament" | "team" | "user" | "registration" | "auditLog"
>

const taskItemSelect = {
  id: true,
  title: true,
  status: true,
  governanceReason: true,
  updatedAt: true,
  organizer: { select: { displayName: true } },
} as const

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
      reviewQueue,
      governanceQueue,
      recentAudits,
    ] = await Promise.all([
      this.prisma.tournament.count(),
      this.prisma.tournament.count({ where: { status: "SUBMITTED" } }),
      this.prisma.tournament.count({ where: { status: "PUBLISHED" } }),
      this.prisma.tournament.count({ where: { status: "IN_PROGRESS" } }),
      this.prisma.team.count(),
      this.prisma.user.count(),
      this.prisma.registration.count(),
      this.prisma.tournament.findMany({
        where: { status: "SUBMITTED", governanceStatus: "ACTIVE" },
        orderBy: { updatedAt: "asc" },
        take: 4,
        select: taskItemSelect,
      }),
      this.prisma.tournament.findMany({
        where: { governanceStatus: "SUSPENDED" },
        orderBy: { governanceUpdatedAt: "desc" },
        take: 4,
        select: taskItemSelect,
      }),
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
      reviewQueue: reviewQueue.map((tournament) => ({
        id: tournament.id,
        title: tournament.title,
        organizerName: tournament.organizer.displayName,
        status: tournament.status,
        governanceReason: tournament.governanceReason,
        updatedAt: tournament.updatedAt.toISOString(),
      })),
      governanceQueue: governanceQueue.map((tournament) => ({
        id: tournament.id,
        title: tournament.title,
        organizerName: tournament.organizer.displayName,
        status: tournament.status,
        governanceReason: tournament.governanceReason,
        updatedAt: tournament.updatedAt.toISOString(),
      })),
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
