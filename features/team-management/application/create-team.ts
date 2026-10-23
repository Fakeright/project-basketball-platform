/**
 * COURTSIDE: คำอธิบายไฟล์
 * สร้างทีมของผู้จัดการพร้อมรายชื่อเริ่มต้น ตรวจชื่อซ้ำในบัญชีและจำนวนผู้เล่นก่อนบันทึก
 * เรียกใช้จาก: app/api/teams/route.ts, features/team-management/application/update-team.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts, features/provinces/application/assert-province-code.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type {
  TeamFormat,
  TeamPlayer,
  TeamPlayerDraft,
  TeamSummary,
} from "@/features/team-management/domain/team"
import { projectTeamPlayerBatchAuditSnapshot } from "@/features/team-management/domain/team-player-audit"
import { assertTeamPlayerBatch } from "@/features/team-management/domain/team-player-batch-policy"
import { assertProvinceCode } from "@/features/provinces/application/assert-province-code"

// นำเข้าประเภทคลังข้อมูล (Repository Interfaces) สำหรับสั่งการและบันทึกข้อมูลทีม
import type {
  TeamMutationRepository,
  TeamRepository,
} from "./ports/team-repository"


export interface CreateTeamInput {
  name: string
  provinceCode: string
  format: TeamFormat
  players?: readonly TeamPlayerDraft[]
}

export interface CreateTeamResult {
  team: TeamSummary
  players: TeamPlayer[]
}

export async function createTeam(
  input: CreateTeamInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<CreateTeamResult> {

  assertProvinceCode(input.provinceCode)
  authorize(actor, "team.create", { organizerId: actor.id })
  const initialPlayers = input.players ?? []
  assertTeamPlayerBatch(initialPlayers, { allowEmpty: true, format: input.format })
  const name = input.name.trim()

  //คำสั่งสร้างทีม: บันทึกข้อมูล ชื่อทีม, รหัสจังหวัด, รูปแบบการแข่ง และเก็บไอดีผู้สร้างไว้ในฐานะเจ้าของทีม (ownerId)
  return dependencies.teams.inTransaction(async (teams) => {
    if (await teams.hasActiveNameConflict(actor.id, name)) {
      throw new Error("TEAM_NAME_TAKEN")
    }
    const team = await teams.create({
      name,
      provinceCode: input.provinceCode,
      format: input.format,
      ownerId: actor.id,
    })
    const players = initialPlayers.length > 0
      ? await teams.addPlayers(team.id, initialPlayers)
      : []

    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.created",
      entityId: team.id,
      after: { team, initialPlayerCount: players.length },
    })
    if (players.length > 0) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.players_added",
        entityId: team.id,
        after: projectTeamPlayerBatchAuditSnapshot(players, []),
      })
    }
    await appendOverrideAudit(teams, actor, team.id)

    return { team, players }
  })
}

async function appendOverrideAudit(
  teams: TeamMutationRepository,
  actor: Actor,
  teamId: string,
) {
  if (actor.role !== "PLATFORM_ADMIN") return

  await teams.appendAuditEvent({
    actorId: actor.id,
    action: "team.admin_override",
    entityId: teamId,
  })
}
