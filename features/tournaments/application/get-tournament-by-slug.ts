/**
 * COURTSIDE: คำอธิบายไฟล์
 * อ่านรายละเอียดรายการสาธารณะจาก slug ผ่าน repository ที่ส่งเข้ามา
 * เรียกใช้จาก: app/(public)/tournaments/[slug]/page.tsx
 */

import type { TournamentRepository } from "@/features/tournaments/infrastructure/tournament-repository"

// ส่ง slug ให้ repository อ่านรายการสาธารณะตามสัญญาเดียวกันทั้งข้อมูลจริงและ mock
export function getTournamentBySlug(repository: TournamentRepository, slug: string) {
  return repository.findBySlug(slug)
}
