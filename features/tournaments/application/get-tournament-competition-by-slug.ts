/**
 * COURTSIDE: คำอธิบายไฟล์
 * อ่านข้อมูลการแข่งขันของรายการที่เลือกผ่าน slug เพื่อใช้ร่วมกันในสาย ตาราง และผล
 * เรียกใช้จาก: app/(public)/bracket/page.tsx, app/(public)/results/page.tsx
 */

import type { TournamentRepository } from "@/features/tournaments/infrastructure/tournament-repository"

// ส่ง slug ให้ repository อ่านสาย/คู่/ผลของรายการที่ผู้ชมเลือก
export function getTournamentCompetitionBySlug(
  repository: TournamentRepository,
  slug: string,
) {
  return repository.findCompetitionBySlug(slug)
}
