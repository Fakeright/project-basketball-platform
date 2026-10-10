import { notFound } from "next/navigation"

import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getAdminDashboard } from "@/features/admin/application/get-admin-dashboard"
import { getAdminDashboardRepository } from "@/features/admin/infrastructure/get-admin-dashboard-repository"
import { createAdminDashboardViewModel } from "@/features/admin/presentation/admin-dashboard-view-model"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (actor?.role !== "PLATFORM_ADMIN") notFound()

  const dashboard = await getAdminDashboard(getAdminDashboardRepository())

  return (
    <AdminDashboard
      dashboard={createAdminDashboardViewModel(dashboard)}
    />
  )
}
