/**
 * COURTSIDE: คำอธิบายไฟล์
 * ประกอบ Prisma repository สำหรับ use case สาย ตาราง และผลการแข่งขัน
 * เรียกใช้จาก: app/(admin)/admin/tournaments/[id]/results/page.tsx, app/(admin)/organizer/tournaments/[id]/bracket/page.tsx
 * ตามการทำงานต่อ: features/competition/infrastructure/prisma-competition-repository.ts
 */

import "server-only"

import type { CompetitionRepository } from "@/features/competition/application/ports/competition-repository"
import { getPrismaClient } from "@/lib/server/prisma"

import { PrismaCompetitionRepository } from "./prisma-competition-repository"

export function getCompetitionRepository(): CompetitionRepository {
  return new PrismaCompetitionRepository(getPrismaClient())
}
