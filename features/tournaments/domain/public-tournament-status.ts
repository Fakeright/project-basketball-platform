/**
 * COURTSIDE: คำอธิบายไฟล์
 * แปลงสถานะจัดการและกำหนดเวลาของรายการเป็นสถานะที่ผู้ชมควรเห็น
 * เรียกใช้จาก: features/tournaments/infrastructure/mock-tournament-repository.ts, features/tournaments/infrastructure/prisma-tournament-repository.ts
 */

import type { TournamentStatus } from "./tournament"

// แยกสถานะที่ใช้แสดงสาธารณะออกจากสถานะตรวจงานภายใน
export function resolvePublicTournamentStatus(
  status: TournamentStatus,
  registrationDeadline: string,
  now: Date,
): TournamentStatus {
  if (status !== "OPEN") return status

  const deadline = Date.parse(registrationDeadline)
  return Number.isFinite(deadline) && now.getTime() <= deadline ? "OPEN" : "CLOSED"
}
