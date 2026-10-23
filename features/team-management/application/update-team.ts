/**
 * COURTSIDE: คำอธิบายไฟล์
 * แก้ชื่อ จังหวัด และรูปแบบทีมโดยตรวจ version ชื่อซ้ำ จำนวนผู้เล่น และข้อจำกัดเมื่อมีใบสมัคร
 * เรียกใช้จาก: app/api/teams/[id]/route.ts, features/team-management/presentation/team-handler.ts
 * ตามการทำงานต่อ: features/provinces/application/assert-province-code.ts, features/team-management/application/team-access.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import type { TeamSummary } from "@/features/team-management/domain/team"
import { getMaximumTeamPlayerCount } from "@/features/team-management/domain/team-player-batch-policy"
import { assertProvinceCode } from "@/features/provinces/application/assert-province-code"

import type { CreateTeamInput } from "./create-team"
import { authorizeTeamAccess } from "./team-access"
import type { TeamRepository } from "./ports/team-repository"

export interface UpdateTeamInput extends CreateTeamInput {
  teamId: string
  expectedVersion: number
}

// ตรวจ version ชื่อซ้ำ ใบสมัคร และจำนวนผู้เล่นก่อนเปลี่ยนข้อมูลทีม
export async function updateTeam(
  input: UpdateTeamInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<TeamSummary> {
  assertProvinceCode(input.provinceCode)
  return dependencies.teams.inTransaction(async (teams) => {
    const team = await teams.findByIdForUpdate(input.teamId)
    if (!team) throw new Error("NOT_FOUND")

    const isOverride = authorizeTeamAccess(actor, "team.update", team)
    if (team.version !== input.expectedVersion) throw new Error("CONFLICT")
    if (!team.isActive) throw new Error("TEAM_INACTIVE")

    const name = input.name.trim()
    const nameChanged = name.toLowerCase() !== team.name.trim().toLowerCase()
    if (
      (team.format !== input.format || nameChanged) &&
      (await teams.hasActiveRegistration(team.id))
    ) {
      if (nameChanged) throw new Error("TEAM_NAME_CHANGE_BLOCKED")
      throw new Error("TEAM_FORMAT_CHANGE_BLOCKED")
    }

    if (
      nameChanged &&
      (await teams.hasActiveNameConflict(team.ownerId, name, team.id))
    ) {
      throw new Error("TEAM_NAME_TAKEN")
    }

    if (team.format !== input.format) {
      const activePlayers = await teams.listActivePlayers(team.id)
      if (activePlayers.length > getMaximumTeamPlayerCount(input.format)) {
        throw new Error("PLAYER_LIMIT_EXCEEDED")
      }
    }

    const updated = await teams.update(team.id, {
      name,
      provinceCode: input.provinceCode,
      format: input.format,
      expectedVersion: input.expectedVersion,
    })

    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.updated",
      entityId: team.id,
      before: team,
      after: updated,
    })
    if (isOverride) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.admin_override",
        entityId: team.id,
        before: team,
        after: updated,
      })
    }

    return updated
  })
}
