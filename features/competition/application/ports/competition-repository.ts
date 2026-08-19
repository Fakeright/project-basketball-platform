import type { GeneratedBracketPlan } from "@/features/competition/domain/bracket-generator"
import type {
  BracketGenerationMethod,
  LockedBracketEntry,
} from "@/features/competition/domain/competition"

export interface PersistGeneratedPlanInput {
  tournamentId: string
  bracketId: string
  generationMethod: BracketGenerationMethod
  entries: readonly LockedBracketEntry[]
  plan: GeneratedBracketPlan
  actorId: string
  adminOverride: boolean
  at: string
}

export interface PersistedCompetitionBracket {
  id: string
  tournamentId: string
  version: number
}

export interface BracketLockContext {
  tournamentId: string
  organizerId: string
  tournamentStatus: string
  capacity: number
  version: number
  approvedEntries: Array<{
    registrationId: string
    teamId: string
    teamName: string
  }>
  hasStartedMatch: boolean
}

export interface LockedCompetitionWorkspace {
  id: string
  tournamentId: string
  version: number
  entries: Array<{
    teamId: string
    teamNameSnapshot: string
  }>
}

export interface LockEntriesInput {
  tournamentId: string
  expectedVersion: number
  actorId: string
  at: string
  adminOverride: boolean
}

export interface CompetitionRepositoryTransaction {
  findLockContext(tournamentId: string): Promise<BracketLockContext | null>
  lockEntries(input: LockEntriesInput): Promise<LockedCompetitionWorkspace>
  persistGeneratedPlan(
    input: PersistGeneratedPlanInput,
  ): Promise<PersistedCompetitionBracket>
}

export interface CompetitionRepository extends CompetitionRepositoryTransaction {
  inTransaction<T>(
    operation: (repository: CompetitionRepositoryTransaction) => Promise<T>,
  ): Promise<T>
}
