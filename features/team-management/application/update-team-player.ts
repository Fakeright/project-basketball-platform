/**
 * COURTSIDE: คำอธิบายไฟล์
 * แก้ข้อมูลผู้เล่นที่ยังอยู่ในทีม หลังตรวจเจ้าของและสถานะ แล้วเก็บ audit ก่อน/หลังแบบลดข้อมูลส่วนบุคคล
 * เรียกใช้จาก: app/api/teams/[id]/players/[playerId]/route.ts, features/team-management/presentation/team-handler.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import type { TeamPlayer, TeamPlayerDraft } from "@/features/team-management/domain/team"
import { projectTeamPlayerAuditSnapshot } from "@/features/team-management/domain/team-player-audit"

import type { TeamRepository } from "./ports/team-repository"
import { authorizePlayerRosterAccess } from "./team-access"

export interface UpdateTeamPlayerInput {
  teamId: string
  playerId: string
  player: TeamPlayerDraft
}

// ตรวจทีมและผู้เล่นปัจจุบันก่อนเขียนค่าใหม่ พร้อม audit ที่ลดข้อมูลส่วนบุคคล
export async function updateTeamPlayer(
  input: UpdateTeamPlayerInput,
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

    const updated = await teams.updatePlayer(team.id, player.id, input.player)
    const beforeAudit = projectTeamPlayerAuditSnapshot(player)
    const afterAudit = projectTeamPlayerAuditSnapshot(updated)
    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.player_updated",
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

    return updated
  })
}
