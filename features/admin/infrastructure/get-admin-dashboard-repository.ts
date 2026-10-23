/**
 * COURTSIDE: คำอธิบายไฟล์
 * ประกอบ repository สำหรับอ่านแดชบอร์ดจากฐานข้อมูลที่ตั้งค่าไว้
 * เรียกใช้จาก: app/(admin)/admin/page.tsx
 * ตามการทำงานต่อ: features/admin/infrastructure/prisma-admin-dashboard-repository.ts
 */

import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import type { AdminDashboardRepository } from "../application/ports/admin-dashboard-repository"
import { PrismaAdminDashboardRepository } from "./prisma-admin-dashboard-repository"

export function getAdminDashboardRepository(): AdminDashboardRepository {
  return new PrismaAdminDashboardRepository(getPrismaClient())
}
