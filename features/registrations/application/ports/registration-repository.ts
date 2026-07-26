import type { TeamRosterMember, TeamSummary } from "@/features/team-management/domain/team"
import type { RosterFormat } from "@/features/team-management/domain/team-policy"
import type { RegistrationTournamentStatus } from "@/features/registrations/domain/registration-policy"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"

export interface RegistrationApplicationContext {
  team: TeamSummary
  roster: TeamRosterMember[]
  tournament: {
    id: string
    format: RosterFormat
    status: RegistrationTournamentStatus
    registrationDeadline: string
  }
}

export interface TournamentRegistrationWithOwnership extends TournamentRegistration {
  team: TeamSummary
}

export interface TeamRegistrationListItem extends TournamentRegistration {
  tournamentName: string
  submittedAt: string
  organizerNote: string | null
}

export interface RegistrationRepositoryTransaction {
  getApplicationContext(
    tournamentId: string,
    teamId: string,
  ): Promise<RegistrationApplicationContext | null>
  findActive(tournamentId: string, teamId: string): Promise<TournamentRegistration | null>
  createPending(input: {
    tournamentId: string
    teamId: string
    actorId: string
  }): Promise<TournamentRegistration>
  findById(id: string): Promise<TournamentRegistrationWithOwnership | null>
  cancelWithVersion(
    id: string,
    version: number,
    actorId: string,
    at: string,
  ): Promise<TournamentRegistration>
}

export interface RegistrationRepository extends RegistrationRepositoryTransaction {
  inTransaction<T>(
    operation: (repository: RegistrationRepositoryTransaction) => Promise<T>,
  ): Promise<T>
  findTeam(teamId: string): Promise<TeamSummary | null>
  listByTeam(teamId: string): Promise<TeamRegistrationListItem[]>
}
