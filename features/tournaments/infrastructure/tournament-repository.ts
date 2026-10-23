/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนดสัญญาค้นหารายการ อ่านรายละเอียด และเลือกรายการสำหรับหน้าสาย/ตาราง/ผล
 * เรียกใช้จาก: features/tournaments/application/get-tournament-by-slug.ts, features/tournaments/application/get-tournament-competition-by-slug.ts
 */

import type { Tournament, TournamentSearchFilters, TournamentStatus } from "@/features/tournaments/domain/tournament"

export type DefaultCompetitionStatus = Extract<TournamentStatus, "OPEN" | "ONGOING" | "COMPLETED">

export interface TournamentRepository {
  list(filters: TournamentSearchFilters): Promise<Tournament[]>
  findBySlug(slug: string): Promise<Tournament | null>
  findCompetitionBySlug(slug: string): Promise<Tournament | null>
  findFirstCompetitionByStatus(status: DefaultCompetitionStatus): Promise<Tournament | null>
}
