import type {
  TeamFormat,
  TeamPlayer,
  TeamPlayerDraft,
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
  listActivePlayers(teamId: string): Promise<TeamPlayer[]>
}
