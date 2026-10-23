/**
 * COURTSIDE: คำอธิบายไฟล์
 * ส่งเงื่อนไขค้นหารายการไป repository และคืนผลให้หน้าแรก/หน้ารายการ
 * เรียกใช้จาก: app/(public)/page.tsx, app/(public)/tournaments/page.tsx
 */

import type { TournamentSearchFilters } from "@/features/tournaments/domain/tournament"
import type { TournamentRepository } from "@/features/tournaments/infrastructure/tournament-repository"

// ส่งตัวกรองที่ผ่านการจัดรูปแบบไป repository โดยไม่ผูกกับ Prisma ใน use case
export function searchTournaments(repository: TournamentRepository, filters: TournamentSearchFilters) {
  return repository.list(filters)
}
