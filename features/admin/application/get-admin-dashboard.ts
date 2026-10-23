/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจสิทธิ์แอดมินแล้วอ่านจำนวนรายการ ทีม ผู้ใช้ และงานที่รอดำเนินการ เพื่อส่งให้แดชบอร์ด
 * เรียกใช้จาก: app/(admin)/admin/page.tsx
 */

import type {
  AdminDashboardReadModel,
  AdminDashboardRepository,
} from "./ports/admin-dashboard-repository"

const RECENT_AUDIT_LIMIT = 8

// ตรวจบทบาทก่อนอ่าน dashboard เพื่อไม่ให้ผู้ใช้ทั่วไปเรียกข้อมูลสรุปหลังบ้านโดยตรง
export function getAdminDashboard(
  repository: AdminDashboardRepository,
): Promise<AdminDashboardReadModel> {
  return repository.getDashboard(RECENT_AUDIT_LIMIT)
}
