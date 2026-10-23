/**
 * COURTSIDE: คำอธิบายไฟล์
 * อ่านประวัติผู้เล่นในทีมของบัญชีเดียวกัน แล้วรวมรายชื่อซ้ำให้เลือกนำกลับมาใช้ได้
 * เรียกใช้จาก: app/(admin)/team/new/page.tsx
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TeamRepository } from "@/features/team-management/application/ports/team-repository"
import {
  projectReusableTeamPlayers,
  type ReusableTeamPlayer,
} from "@/features/team-management/domain/team-player-history"

// อ่านประวัติจากทีมของบัญชีเดียวกันแล้วรวมผู้เล่นซ้ำก่อนส่งให้ช่องเลือกผู้เล่นเดิม
export async function listReusableTeamPlayers(
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<ReusableTeamPlayer[]> {
  authorize(actor, "team.create", { organizerId: actor.id })
  const sources = await dependencies.teams.listPlayerHistoryByOwner(actor.id)
  return projectReusableTeamPlayers(sources)
}
