/**
 * COURTSIDE: คำอธิบายไฟล์
 * ประกอบ Prisma repository สำหรับทีมและรายชื่อผู้เล่น
 * เรียกใช้จาก: app/(admin)/team/[id]/page.tsx, app/(admin)/team/new/page.tsx
 * ตามการทำงานต่อ: features/team-management/infrastructure/prisma-team-repository.ts
 */

import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import type { TeamRepository } from "../application/ports/team-repository"
import { PrismaTeamRepository } from "./prisma-team-repository"

export function getTeamRepository(): TeamRepository {
  return new PrismaTeamRepository(getPrismaClient())
}
