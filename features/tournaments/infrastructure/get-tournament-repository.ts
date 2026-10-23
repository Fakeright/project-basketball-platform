/**
 * COURTSIDE: คำอธิบายไฟล์
 * เลือกฐานข้อมูลจริงเมื่อมี DATABASE_URL หรือข้อมูลจำลองในโหมดพัฒนา; production ต้องมีฐานข้อมูล
 * เรียกใช้จาก: app/(public)/bracket/page.tsx, app/(public)/page.tsx
 * ตามการทำงานต่อ: features/tournament-media/infrastructure/supabase-object-storage.ts, features/tournaments/infrastructure/mock-tournament-repository.ts, features/tournaments/infrastructure/prisma-tournament-repository.ts
 */

import "server-only"

import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"
import { getPrismaClient } from "@/lib/server/prisma"

import { MockTournamentRepository } from "./mock-tournament-repository"
import { PrismaTournamentRepository } from "./prisma-tournament-repository"
import type { TournamentRepository } from "./tournament-repository"

// เลือก adapter ที่ใช้ข้อมูลจริงหรือข้อมูลจำลองตาม environment โดย production ไม่ fallback ไป mock
export function getTournamentRepository(): TournamentRepository {
  if (process.env.DATABASE_URL) {
    return new PrismaTournamentRepository(
      getPrismaClient(),
      new SupabaseObjectStorage(),
    )
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL_NOT_CONFIGURED")
  }

  return new MockTournamentRepository()
}
