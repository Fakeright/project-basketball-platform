/**
 * COURTSIDE: คำอธิบายไฟล์
 * นำผู้เล่นออกจากรายชื่อปัจจุบันโดยปิดสถานะ พร้อมเก็บประวัติการเปลี่ยนแปลง
 * เรียกใช้จาก: app/api/teams/[id]/players/[playerId]/route.ts, features/team-management/presentation/team-handler.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import type { TeamPlayer } from "@/features/team-management/domain/team"
import { projectTeamPlayerAuditSnapshot } from "@/features/team-management/domain/team-player-audit"

import type { TeamRepository } from "./ports/team-repository"
import { authorizePlayerRosterAccess } from "./team-access"

export interface DeactivateTeamPlayerInput {
  teamId: string
  playerId: string
  at: string
}

// ค้นผู้เล่นที่ยังใช้งานภายในทีมก่อนปิดสถานะ เพื่อเก็บประวัติโดยไม่ลบข้อมูลอ้างอิง
export async function deactivateTeamPlayer(
  input: DeactivateTeamPlayerInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamPlayer> {
  return dependencies.teams.inTransaction(async (teams) => {
    const team = await teams.findByIdForUpdate(input.teamId)
    if (!team) throw new Error("NOT_FOUND")

    const isOverride = authorizePlayerRosterAccess(actor, team.ownerId)
    if (!team.isActive) throw new Error("TEAM_INACTIVE")

    const player = (await teams.listActivePlayers(team.id)).find(
      (candidate) => candidate.id === input.playerId,
    )
    if (!player) throw new Error("PLAYER_NOT_FOUND")

    const deactivated = await teams.deactivatePlayer(team.id, player.id, input.at)
    const beforeAudit = projectTeamPlayerAuditSnapshot(player)
    const afterAudit = projectTeamPlayerAuditSnapshot(deactivated)
    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.player_deactivated",
      entityId: team.id,
      before: beforeAudit,
      after: afterAudit,
    })
    if (isOverride) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.admin_override",
        entityId: team.id,
        before: beforeAudit,
        after: afterAudit,
      })
    }

    return deactivated
  })
}
