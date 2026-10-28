/**
 * COURTSIDE: คำอธิบายไฟล์
 * เลือกตัวเก็บไฟล์สายที่ตรงกับสภาพแวดล้อมและค่าฐานข้อมูล
 * เรียกใช้จาก: app/(admin)/organizer/tournaments/[id]/bracket/page.tsx, app/(public)/bracket/page.tsx
 * ตามการทำงานต่อ: features/competition/infrastructure/development-external-bracket-repository.ts, features/competition/infrastructure/prisma-external-bracket-repository.ts
 */

import "server-only"

import type { ExternalBracketRepository } from "@/features/competition/application/ports/external-bracket-repository"
import { getPrismaClient } from "@/lib/server/prisma"

import { DevelopmentExternalBracketRepository } from "./development-external-bracket-repository"
import { PrismaExternalBracketRepository } from "./prisma-external-bracket-repository"

export function getExternalBracketRepository(): ExternalBracketRepository {
  if (process.env.DATABASE_URL) {
    return new PrismaExternalBracketRepository(getPrismaClient())
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL_NOT_CONFIGURED")
  }
  return new DevelopmentExternalBracketRepository()
}
