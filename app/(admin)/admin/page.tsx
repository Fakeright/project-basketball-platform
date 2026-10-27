/**
 * COURTSIDE: คำอธิบายไฟล์
 * หน้า /admin: ตรวจบทบาทแอดมินก่อนอ่านและแสดง dashboard
 * ตามการทำงานต่อ: features/admin/application/get-admin-dashboard.ts, features/admin/infrastructure/get-admin-dashboard-repository.ts, features/admin/presentation/admin-dashboard-view-model.ts
 */

import { notFound } from "next/navigation"

import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getAdminDashboard } from "@/features/admin/application/get-admin-dashboard"
import { getAdminDashboardRepository } from "@/features/admin/infrastructure/get-admin-dashboard-repository"
import { createAdminDashboardViewModel } from "@/features/admin/presentation/admin-dashboard-view-model"
import { getCurrentActor } from "@/features/identity/infrastructure/get-current-actor"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const actor = await getCurrentActor()
  if (actor?.role !== "PLATFORM_ADMIN") notFound()

  const dashboard = await getAdminDashboard(getAdminDashboardRepository())

  return (
    <AdminDashboard
      dashboard={createAdminDashboardViewModel(dashboard)}
    />
  )
}
