import type {
  TeamFormat,
  TeamPlayer,
  TeamPlayerDraft,
  TeamSummary,
} from "@/features/team-management/domain/team"
import type { RegistrationStatus } from "@/features/registrations/domain/registration"

export interface TeamRemovalContext {
  team: TeamSummary
  registrationStatuses: RegistrationStatus[]
}

export interface LegacyTeamReconciliationContext {
  teamId: string
  format: TeamFormat
  activeLegacyPlayerCount: number
  activeLegacyCoachCount: number
  activeTeamPlayerCount: number
  registrationHistoryCount: number
  registrationStatusCounts: Record<RegistrationStatus, number>
}

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
  getRemovalContextForUpdate(teamId: string): Promise<TeamRemovalContext | null>
  deleteTeam(teamId: string): Promise<void>
  deactivateTeam(
    teamId: string,
    expectedVersion: number,
    at: string,
  ): Promise<TeamSummary>
  listActivePlayers(teamId: string): Promise<TeamPlayer[]>
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
  listLegacyReconciliationContexts(
    teamId?: string,
  ): Promise<LegacyTeamReconciliationContext[]>
}
