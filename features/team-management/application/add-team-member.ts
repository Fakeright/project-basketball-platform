import type { Actor } from "@/features/identity/domain/actor"
import type {
  TeamMemberRole,
  TeamRosterMember,
} from "@/features/team-management/domain/team"

import { authorizeTeamAccess } from "./team-access"
import type { LegacyTeamMemberRepository } from "./ports/team-repository"

export interface AddTeamMemberInput {
  teamId: string
  userId: string
  role: TeamMemberRole
}

export async function addTeamMember(
  input: AddTeamMemberInput,
  actor: Actor,
  dependencies: { teams: LegacyTeamMemberRepository },
): Promise<TeamRosterMember> {
  const team = await dependencies.teams.findById(input.teamId)
  if (!team) throw new Error("NOT_FOUND")

  const isOverride = authorizeTeamAccess(actor, "team.roster.manage", team)
  const user = await dependencies.teams.findUser(input.userId)
  if (!user) throw new Error("MEMBER_NOT_FOUND")
  if (user.role !== input.role) throw new Error("MEMBER_ROLE_MISMATCH")

  return dependencies.teams.inTransaction(async (teams) => {
    const member = await teams.addMember(input)
    await teams.appendAuditEvent({
      actorId: actor.id,
      action: "team.member_added",
      entityId: team.id,
      after: member,
    })
    if (isOverride) {
      await teams.appendAuditEvent({
        actorId: actor.id,
        action: "team.admin_override",
        entityId: team.id,
        after: member,
      })
    }

    return member
  })
}
