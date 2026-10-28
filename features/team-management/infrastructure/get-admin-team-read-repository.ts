/**
 * COURTSIDE: คำอธิบายไฟล์
 * ประกอบ Prisma adapter สำหรับให้แอดมินอ่านรายชื่อทีมและสมาชิก
 * เรียกใช้จาก: app/(admin)/admin/teams/[id]/page.tsx, app/(admin)/admin/teams/page.tsx
 * ตามการทำงานต่อ: features/team-management/infrastructure/prisma-admin-team-read-repository.ts
 */

import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import type { AdminTeamReadRepository } from "../application/ports/admin-team-read-repository"
import { PrismaAdminTeamReadRepository } from "./prisma-admin-team-read-repository"

export function getAdminTeamReadRepository(): AdminTeamReadRepository {
  return new PrismaAdminTeamReadRepository(getPrismaClient())
}
