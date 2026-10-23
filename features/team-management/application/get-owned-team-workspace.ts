/**
 * COURTSIDE: คำอธิบายไฟล์
 * ประกอบข้อมูลทีม ผู้เล่น และข้อมูลสมาชิกเก่า หลังตรวจสิทธิ์เข้าถึงทีม
 * เรียกใช้จาก: app/(admin)/team/[id]/page.tsx, app/(admin)/team/page.tsx
 * ตามการทำงานต่อ: features/team-management/application/team-access.ts, features/team-management/application/legacy-team-reconciliation.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import type {
  TeamPlayer,
  TeamSummary,
} from "@/features/team-management/domain/team"

import { authorizeTeamAccess } from "./team-access"
import {
  listLegacyTeamReconciliations,
  type LegacyTeamReconciliationSummary,
} from "./legacy-team-reconciliation"
import type { TeamRepository } from "./ports/team-repository"

export interface OwnedTeamWorkspace {
  team: TeamSummary
  players: TeamPlayer[]
  legacyReconciliation: LegacyTeamReconciliationSummary | null
}

// ตรวจสิทธิ์แล้วประกอบทีม รายชื่อปัจจุบัน และข้อมูลเปรียบเทียบสมาชิกเดิมให้หน้า workspace
export async function getOwnedTeamWorkspace(
  teamId: string,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<OwnedTeamWorkspace> {
  const team = await dependencies.teams.findById(teamId)
  if (!team) throw new Error("NOT_FOUND")

  authorizeTeamAccess(actor, "team.update", team)
  const [players, legacyReconciliations] = await Promise.all([
    dependencies.teams.listActivePlayers(team.id),
    listLegacyTeamReconciliations(dependencies, team.id),
  ])

  return {
    team,
    players,
    legacyReconciliation: legacyReconciliations[0] ?? null,
  }
}
