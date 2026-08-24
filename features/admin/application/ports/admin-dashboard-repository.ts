export interface AdminDashboardMetrics {
  tournaments: number
  pendingReviews: number
  publishedTournaments: number
  activeTournaments: number
  teams: number
  users: number
  registrations: number
}

export interface AdminDashboardAudit {
  id: string
  action: string
  actorName: string
  entityType: string
  entityId: string
  tournamentId: string | null
  tournamentTitle: string | null
  createdAt: string
}

export interface AdminDashboardReadModel {
  metrics: AdminDashboardMetrics
  recentAudits: AdminDashboardAudit[]
}

export interface AdminDashboardRepository {
  getDashboard(recentAuditLimit: number): Promise<AdminDashboardReadModel>
}
