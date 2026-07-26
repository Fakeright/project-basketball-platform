import type { Role } from "@/features/identity/domain/actor"
import type {
  TeamMemberRole,
  TeamRosterMember,
  TeamSummary,
} from "@/features/team-management/domain/team"

export interface TeamMutationRepository {
  create(input: {
    name: string
    province: string
    ownerId: string
  }): Promise<TeamSummary>
  update(id: string, input: { name: string; province: string }): Promise<TeamSummary>
  addMember(input: {
    teamId: string
    userId: string
    role: TeamMemberRole
  }): Promise<TeamRosterMember>
  deactivateMember(teamId: string, memberId: string, at: string): Promise<void>
  appendAuditEvent(input: {
    actorId: string
    action: string
    entityId: string
    before?: unknown
    after?: unknown
  }): Promise<void>
}

export interface TeamRepository extends TeamMutationRepository {
  inTransaction<T>(
    operation: (repository: TeamMutationRepository) => Promise<T>,
  ): Promise<T>
  findById(id: string): Promise<TeamSummary | null>
  listByOwner(ownerId: string): Promise<TeamSummary[]>
  findUser(id: string): Promise<{
    id: string
    displayName: string
    role: Role
  } | null>
  listUsersByRoles(roles: readonly Role[]): Promise<
    Array<{
      id: string
      displayName: string
      role: Role
    }>
  >
  listActiveMembers(teamId: string): Promise<TeamRosterMember[]>
}
