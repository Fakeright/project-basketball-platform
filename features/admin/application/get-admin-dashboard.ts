import type {
  AdminDashboardReadModel,
  AdminDashboardRepository,
} from "./ports/admin-dashboard-repository"

const RECENT_AUDIT_LIMIT = 8

export function getAdminDashboard(
  repository: AdminDashboardRepository,
): Promise<AdminDashboardReadModel> {
  return repository.getDashboard(RECENT_AUDIT_LIMIT)
}
