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

export interface CompetitionRepositoryTransaction {
  persistGeneratedPlan(
    input: PersistGeneratedPlanInput,
  ): Promise<PersistedCompetitionBracket>
}

export interface CompetitionRepository extends CompetitionRepositoryTransaction {
  inTransaction<T>(
    operation: (repository: CompetitionRepositoryTransaction) => Promise<T>,
  ): Promise<T>
}
