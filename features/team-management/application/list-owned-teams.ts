/**
 * COURTSIDE: คำอธิบายไฟล์
 * คืนเฉพาะรายการทีมของผู้จัดการที่มีสิทธิ์ใช้พื้นที่ทีม
 * เรียกใช้จาก: app/(admin)/team/page.tsx, features/tournaments/application/get-tournament-registration-options.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TeamSummary } from "@/features/team-management/domain/team"

import type { TeamRepository } from "./ports/team-repository"

// ตรวจสิทธิ์พื้นที่ทีมก่อนค้นด้วย owner ID ของผู้ใช้ปัจจุบัน
export async function listOwnedTeams(
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamSummary[]> {
  authorize(actor, "team.update", { organizerId: actor.id })
  return dependencies.teams.listByOwner(actor.id)
}
