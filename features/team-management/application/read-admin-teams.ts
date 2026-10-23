/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจบทบาทแอดมินก่อนอ่านทีมทั้งหมดหรือสมาชิกปัจจุบันของทีมที่เลือก
 * เรียกใช้จาก: app/(admin)/admin/teams/[id]/page.tsx, app/(admin)/admin/teams/page.tsx
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"

import type {
  AdminTeamDetail,
  AdminTeamListItem,
  AdminTeamReadRepository,
} from "./ports/admin-team-read-repository"

// ตรวจว่าเป็นแอดมินก่อนอ่านทีมทั้งหมดพร้อมชื่อผู้สร้าง
export async function listAdminTeams(
  actor: Actor,
  dependencies: { teams: AdminTeamReadRepository },
): Promise<AdminTeamListItem[]> {
  assertAdminTeamAccess(actor)
  return dependencies.teams.listAll()
}

// ตรวจสิทธิ์แอดมินแล้วอ่านทีมและผู้เล่นปัจจุบันแบบอ่านอย่างเดียว
export async function getAdminTeamDetail(
  teamId: string,
  actor: Actor,
  dependencies: { teams: AdminTeamReadRepository },
): Promise<AdminTeamDetail> {
  assertAdminTeamAccess(actor)
  const team = await dependencies.teams.findById(teamId)
  if (!team) throw new Error("NOT_FOUND")
  return team
}

function assertAdminTeamAccess(actor: Actor): void {
  if (actor.role !== "PLATFORM_ADMIN") throw new Error("NOT_FOUND")
  authorize(actor, "team.read")
}
