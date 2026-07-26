import type { Actor } from "@/features/identity/domain/actor"

import { authorizeTeamAccess } from "./team-access"
import type { TeamRepository } from "./ports/team-repository"

export interface DeactivateTeamMemberInput {
  teamId: string
  memberId: string
  at: string
}

export async function deactivateTeamMember(
  input: DeactivateTeamMemberInput,
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<void> {
  const team = await dependencies.teams.findById(input.teamId)
  if (!team) throw new Error("NOT_FOUND")

  const isOverride = authorizeTeamAccess(actor, "team.roster.manage", team)
  const member = (await dependencies.teams.listActiveMembers(team.id)).find(
    (candidate) => candidate.id === input.memberId,
  )
  if (!member) throw new Error("MEMBER_NOT_FOUND")

  const deactivatedMember = {
    ...member,
    isActive: false,
    deactivatedAt: input.at,
  }
  await dependencies.teams.inTransaction(async (teams) => {
    await teams.deactivateMember(team.id, member.id, input.at)
    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.member_deactivated",
      entityId: team.id,
      before: member,
      after: deactivatedMember,
    })
    if (isOverride) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.admin_override",
        entityId: team.id,
        before: member,
        after: deactivatedMember,
      })
    }
  })
}
