import type { TeamPlayer, TeamSummary } from "@/features/team-management/domain/team"
import type { RosterFormat } from "@/features/team-management/domain/team-policy"
import type { RegistrationTournamentStatus } from "@/features/registrations/domain/registration-policy"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"

export interface RegistrationApplicationContext {
  team: TeamSummary
  roster: TeamPlayer[]
  tournament: {
    id: string
    format: RosterFormat
    ageGroup: string
    startsAt: string
    status: RegistrationTournamentStatus
    registrationDeadline: string
    capacity: number
    approvedCount: number
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

export interface RegistrationReviewTournament {
  id: string
  title: string
  organizerId: string
  status: RegistrationTournamentStatus
  capacity: number
}

export interface RegistrationReviewContext {
  registration: TournamentRegistration
  tournament: RegistrationReviewTournament
}

export interface TournamentRegistrationReviewItem
  extends TournamentRegistration {
  teamName: string
  province: string
  playerCount: number
  managerCoachCount: number
  submittedAt: string
}

interface RegistrationReviewMutationInput {
  before: TournamentRegistration
  version: number
  actorId: string
  at: string
  adminOverride: boolean
}

export interface ApproveRegistrationInput
  extends RegistrationReviewMutationInput {
  note: string
}

export interface RejectRegistrationInput
  extends RegistrationReviewMutationInput {
  note: string
}

export interface WithdrawRegistrationMutationInput
  extends RegistrationReviewMutationInput {
  reason: string
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
    adminOverride: boolean
  }): Promise<TournamentRegistration>
  findById(id: string): Promise<TournamentRegistrationWithOwnership | null>
  cancelWithVersion(
    id: string,
    version: number,
    actorId: string,
    at: string,
    adminOverride: boolean,
  ): Promise<TournamentRegistration>
  findReviewContext(id: string): Promise<RegistrationReviewContext | null>
  approveWithCapacity(
    input: ApproveRegistrationInput,
  ): Promise<TournamentRegistration>
  rejectWithVersion(
    input: RejectRegistrationInput,
  ): Promise<TournamentRegistration>
  withdrawWithVersion(
    input: WithdrawRegistrationMutationInput,
  ): Promise<TournamentRegistration>
}

export interface RegistrationRepository extends RegistrationRepositoryTransaction {
  inTransaction<T>(
    operation: (repository: RegistrationRepositoryTransaction) => Promise<T>,
  ): Promise<T>
  findTeam(teamId: string): Promise<TeamSummary | null>
  listByTeam(teamId: string): Promise<TeamRegistrationListItem[]>
  findTournamentForReview(
    tournamentId: string,
  ): Promise<RegistrationReviewTournament | null>
  listByTournament(
    tournamentId: string,
  ): Promise<TournamentRegistrationReviewItem[]>
}
