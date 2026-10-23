/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจจำนวนและสถานะผู้เล่นขั้นต่ำที่ทีมต้องมีเมื่อสมัครรายการ
 * เรียกใช้จาก: features/registrations/application/ports/registration-repository.ts, features/registrations/domain/registration-policy.ts
 */

import type { TeamFormat, TeamPlayer } from "./team"

export type RosterFormat = TeamFormat

const minimumPlayersByFormat: Record<TeamFormat, number> = {
  FIVE_V_FIVE: 5,
  THREE_V_THREE: 3,
}

export function getMinimumRosterSize(format: TeamFormat): number {
  return minimumPlayersByFormat[format]
}

// ตรวจรายชื่อที่ใช้สมัครว่าผ่านจำนวนขั้นต่ำและสถานะผู้เล่นตามรูปแบบทีม
export function assertRosterEligibility(
  format: TeamFormat,
  players: readonly TeamPlayer[],
): void {
  assertMinimumActivePlayerCount(
    format,
    players.filter((player) => player.isActive).length,
  )
}

// ตรวจจำนวนผู้เล่นที่ยังใช้งานว่าพอสำหรับส่งสมัครตามรูปแบบทีม
function assertMinimumActivePlayerCount(
  format: TeamFormat,
  activePlayerCount: number,
): void {
  if (activePlayerCount < getMinimumRosterSize(format)) {
    throw new Error("ROSTER_INCOMPLETE")
  }
}
