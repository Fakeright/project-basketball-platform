import type {
  TeamMemberRole,
  TeamFormat,
  TeamPlayer,
  TeamPlayerDraft,
  TeamRosterMember,
  TeamSummary,
} from "@/features/team-management/domain/team"

export interface TeamMutationRepository {
  findByIdForUpdate(id: string): Promise<TeamSummary | null>
  create(input: {
    name: string
    provinceCode: string
    format: TeamFormat
    ownerId: string
  }): Promise<TeamSummary>
  update(
    id: string,
    input: {
      name: string
      provinceCode: string
      format: TeamFormat
      expectedVersion: number
    },
  ): Promise<TeamSummary>
  hasActiveRegistration(teamId: string): Promise<boolean>
  addMember(input: {
    teamId: string
    userId: string
    role: TeamMemberRole
  }): Promise<TeamRosterMember>
  deactivateMember(teamId: string, memberId: string, at: string): Promise<void>
  findExistingPlayersByIdentities(
    teamId: string,
    players: readonly TeamPlayerDraft[],
  ): Promise<TeamPlayer[]>
  addPlayers(teamId: string, players: readonly TeamPlayerDraft[]): Promise<TeamPlayer[]>
  updatePlayer(
    teamId: string,
    playerId: string,
    input: TeamPlayerDraft,
  ): Promise<TeamPlayer>
  deactivatePlayer(teamId: string, playerId: string, at: string): Promise<TeamPlayer>
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
  listActiveMembers(teamId: string): Promise<TeamRosterMember[]>
  listActivePlayers(teamId: string): Promise<TeamPlayer[]>
}

export interface LegacyTeamMemberRepository extends TeamRepository {
  findUser(id: string): Promise<{
    id: string
    displayName: string
    role: import("@/features/identity/domain/actor").Role
  } | null>
  listUsersByRoles(roles: readonly import("@/features/identity/domain/actor").Role[]): Promise<
    Array<{
      id: string
      displayName: string
      role: import("@/features/identity/domain/actor").Role
    }>
  >
}
