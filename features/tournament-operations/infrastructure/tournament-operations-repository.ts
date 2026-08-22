import type {
  TournamentAuditAction,
  TournamentOperation,
  TournamentOperationInput,
  TournamentOperationStatus,
  TournamentReviewInput,
} from "@/features/tournament-operations/domain/tournament-operation"
import type {
  TournamentGovernanceAction,
  TournamentGovernanceContext,
  TournamentGovernanceStatus,
} from "@/features/tournament-operations/domain/tournament-governance-policy"
import type { TournamentCompetitionLifecycleContext } from "@/features/competition/domain/competition"

export interface TournamentOperationsRepository {
  create(
    input: TournamentOperationInput & { organizerId: string },
    audit: TournamentMutationAudit,
  ): Promise<TournamentOperation>
  findById(id: string): Promise<TournamentOperation | null>
  findGovernanceContext(id: string): Promise<TournamentGovernanceContext | null>
  findCompetitionLifecycleContext(
    id: string,
  ): Promise<TournamentCompetitionLifecycleContext | null>
  listByOrganizer(organizerId: string): Promise<TournamentOperation[]>
  listForAdmin(filters: AdminTournamentFilters): Promise<TournamentOperation[]>
  listByStatus(status: TournamentOperationStatus): Promise<TournamentOperation[]>
  updateWithVersion(
    id: string,
    version: number,
    changes: Partial<TournamentOperation>,
    audit: TournamentMutationAudit,
  ): Promise<TournamentOperation>
  reviewWithVersion(input: TournamentReviewTransition): Promise<TournamentOperation>
  transitionWithVersion(
    input: TournamentLifecycleTransition,
  ): Promise<TournamentOperation>
  transitionCompetitionWithVersion(
    input: TournamentCompetitionTransition,
  ): Promise<TournamentOperation>
  governWithVersion(
    input: TournamentGovernanceTransition,
  ): Promise<TournamentOperation>
  permanentlyDeleteWithVersion(
    input: TournamentPermanentDelete,
  ): Promise<void>
}

export interface AdminTournamentFilters {
  query?: string
  status?: TournamentOperationStatus
}

export interface TournamentMutationAudit {
  actorId: string
  action: TournamentAuditAction
  adminOverride: boolean
}

export interface TournamentReviewTransition {
  tournamentId: string
  version: number
  sourceStatus: TournamentOperationStatus
  status: TournamentOperationStatus
  reviewerId: string
  decision: TournamentReviewInput["decision"]
  note: string
}

export interface TournamentLifecycleTransition {
  tournamentId: string
  version: number
  sourceStatus: TournamentOperationStatus
  status: TournamentOperationStatus
  actorId: string
  action:
    | "tournament.published"
    | "tournament.registration_closed"
  adminOverride: boolean
}

export interface TournamentCompetitionTransition {
  tournamentId: string
  version: number
  sourceStatus: "REGISTRATION_CLOSED" | "IN_PROGRESS"
  status: "IN_PROGRESS" | "COMPLETED"
  actorId: string
  action: "tournament.started" | "tournament.completed"
  adminOverride: boolean
  reason: string | null
  at: string
}

export interface TournamentGovernanceTransition {
  action: Exclude<TournamentGovernanceAction, "PERMANENT_DELETE">
  tournamentId: string
  expectedVersion: number
  sourceStatus: TournamentOperationStatus
  sourceGovernanceStatus: TournamentGovernanceStatus
  reason: string
  actorId: string
  at: string
}

export interface TournamentPermanentDelete {
  tournamentId: string
  expectedVersion: number
  confirmationTitle: string
  reason: string
  actorId: string
  at: string
}

export type TournamentOperationChanges = Partial<Pick<TournamentOperation, "status" | "version">>
export type TournamentStatus = TournamentOperationStatus
