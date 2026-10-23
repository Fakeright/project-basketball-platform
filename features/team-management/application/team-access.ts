/**
 * COURTSIDE: คำอธิบายไฟล์
 * รวมการตรวจสิทธิ์และเจ้าของทีม/รายชื่อผู้เล่น พร้อมคืนสัญญาณสำหรับ audit การทำแทนของแอดมิน
 * เรียกใช้จาก: features/registrations/application/apply-to-tournament.ts, features/registrations/application/cancel-registration.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { Permission } from "@/features/identity/domain/permission"
import type { TeamSummary } from "@/features/team-management/domain/team"

// ตรวจเจ้าของและสิทธิ์คำสั่งก่อนคืนว่าครั้งนี้เป็นการทำแทนเจ้าของโดยแอดมินหรือไม่
export function authorizeTeamAccess(
  actor: Actor,
  action: Permission,
  team: TeamSummary,
): boolean {
  if (actor.role !== "PLATFORM_ADMIN" && team.ownerId !== actor.id) {
    throw new Error("NOT_FOUND")
  }

  authorize(actor, action, { organizerId: team.ownerId })
  return actor.role === "PLATFORM_ADMIN" && team.ownerId !== actor.id
}

// ใช้ร่วมกันเมื่อเพิ่ม/แก้/นำผู้เล่นออก; คืน true เพื่อให้ผู้เรียกบันทึก audit การใช้อำนาจแอดมิน
export function authorizePlayerRosterAccess(actor: Actor, ownerId: string): boolean {
  authorize(actor, "team.roster.manage", { organizerId: ownerId })
  return actor.role === "PLATFORM_ADMIN" && actor.id !== ownerId
}
