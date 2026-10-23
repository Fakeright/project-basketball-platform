/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนดข้อมูลสรุปและสัญญาการอ่านแดชบอร์ด ให้ use case ไม่ต้องผูกกับ Prisma
 * เรียกใช้จาก: features/admin/application/get-admin-dashboard.ts, features/admin/infrastructure/get-admin-dashboard-repository.ts
 */

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

export interface AdminDashboardTaskItem {
  id: string
  title: string
  organizerName: string
  status: string
  governanceReason: string | null
  updatedAt: string
}

export interface AdminDashboardReadModel {
  metrics: AdminDashboardMetrics
  reviewQueue: AdminDashboardTaskItem[]
  governanceQueue: AdminDashboardTaskItem[]
  recentAudits: AdminDashboardAudit[]
}

export interface AdminDashboardRepository {
  getDashboard(recentAuditLimit: number): Promise<AdminDashboardReadModel>
}
