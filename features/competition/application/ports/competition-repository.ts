import type { GeneratedBracketPlan } from "@/features/competition/domain/bracket-generator"
import type {
  BracketGenerationMethod,
  LockedBracketEntry,
} from "@/features/competition/domain/competition"

export interface PersistGeneratedPlanInput {
  tournamentId: string
  bracketId: string
  expectedVersion: number
  generationMethod: BracketGenerationMethod
  drawToken: string | null
  entries: readonly LockedBracketEntry[]
  plan: GeneratedBracketPlan
  actorId: string
  adminOverride: boolean
  at: string
}

export interface BracketGenerationContext {
  tournamentId: string
  organizerId: string
  bracketId: string
  bracketVersion: number
  generationMethod: BracketGenerationMethod | null
  drawToken: string | null
  hasStartedMatch: boolean
  entries: LockedBracketEntry[]
}

export interface OrganizerCompetitionWorkspace {
  tournament: {
    id: string
    title: string
    organizerId: string
    status: string
    version: number
  }
  approvedTeamCount: number
  bracket: null | {
    id: string
    version: number
    status: string
    generationMethod: BracketGenerationMethod | null
    entriesLockedAt: string | null
    hasStartedMatch: boolean
    entries: LockedBracketEntry[]
    rounds: Array<{
      id: string
      name: string
      sequence: number
      matches: Array<{
        id: string
        sequence: number
        homeTeamId: string | null
        awayTeamId: string | null
        status: string
        scheduledAt: string | null
        court: string | null
        version: number
        homeScore: number | null
        awayScore: number | null
        winnerTeamId: string | null
      }>
    }>
  }
}

export interface BracketPublicationContext {
  tournamentId: string
  organizerId: string
  bracketId: string
  bracketVersion: number
  bracketStatus: string
  entryCount: number
  roundCount: number
  matchCount: number
  hasStartedMatch: boolean
}

export interface SetBracketPublicationInput {
  tournamentId: string
  bracketId: string
  expectedVersion: number
  published: boolean
  reason: string | null
  actorId: string
  adminOverride: boolean
  at: string
}

export interface MatchScheduleContext {
  tournamentId: string
  organizerId: string
  tournamentStartsAt: string
  tournamentEndsAt: string
  bracketStatus: string
  matchId: string
  matchStatus: string
  matchVersion: number
  hasCourtConflict: boolean
}

export interface ScheduleMatchMutation {
  tournamentId: string
  matchId: string
  scheduledAt: string
  court: string
  expectedVersion: number
  overrideReason: string | null
  actorId: string
  adminOverride: boolean
  at: string
}

export interface ScheduledCompetitionMatch {
  id: string
  scheduledAt: string
  court: string
  version: number
}

export interface MatchResultContext {
  tournamentId: string
  organizerId: string
  bracketStatus: string
  matchId: string
  matchStatus: string
  matchVersion: number
  homeTeamId: string | null
  awayTeamId: string | null
  nextMatchId: string | null
  nextSlot: "HOME" | "AWAY" | null
  nextSlotTeamId: string | null
  resultConfirmed: boolean
}

export interface RecordMatchScoreMutation {
  tournamentId: string
  matchId: string
  homeScore: number
  awayScore: number
  expectedVersion: number
  actorId: string
  adminOverride: boolean
  at: string
}

export interface ConfirmMatchResultMutation extends RecordMatchScoreMutation {
  winnerTeamId: string
  nextMatchId: string | null
  nextSlot: "HOME" | "AWAY" | null
}

export interface ResultCompetitionMatch {
  id: string
  status: string
  homeScore: number
  awayScore: number
  winnerTeamId: string | null
  version: number
}

export interface MatchResultCorrectionContext {
  tournamentId: string
  organizerId: string
  matchId: string
  matchVersion: number
  matchStatus: string
  homeTeamId: string
  awayTeamId: string
  currentWinnerTeamId: string
  nextMatchId: string | null
  nextSlot: "HOME" | "AWAY" | null
  nextMatchStatus: string | null
  nextSlotTeamId: string | null
  nextResultConfirmed: boolean
  nextHasScore: boolean
}

export interface CorrectMatchResultMutation {
  tournamentId: string
  matchId: string
  homeScore: number
  awayScore: number
  expectedVersion: number
  previousWinnerTeamId: string
  winnerTeamId: string
  nextMatchId: string | null
  nextSlot: "HOME" | "AWAY" | null
  replaceDownstreamSlot: boolean
  reason: string
  actorId: string
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
  findGenerationContext(
    tournamentId: string,
  ): Promise<BracketGenerationContext | null>
  findPublicationContext(
    tournamentId: string,
  ): Promise<BracketPublicationContext | null>
  setPublication(
    input: SetBracketPublicationInput,
  ): Promise<PersistedCompetitionBracket>
  findMatchScheduleContext(input: {
    tournamentId: string
    matchId: string
    scheduledAt: string
    court: string
  }): Promise<MatchScheduleContext | null>
  scheduleMatch(
    input: ScheduleMatchMutation,
  ): Promise<ScheduledCompetitionMatch>
  findResultContext(input: {
    tournamentId: string
    matchId: string
  }): Promise<MatchResultContext | null>
  recordScore(
    input: RecordMatchScoreMutation,
  ): Promise<ResultCompetitionMatch>
  confirmResultAndAdvance(
    input: ConfirmMatchResultMutation,
  ): Promise<ResultCompetitionMatch>
  findResultCorrectionContext(input: {
    tournamentId: string
    matchId: string
  }): Promise<MatchResultCorrectionContext | null>
  correctResult(
    input: CorrectMatchResultMutation,
  ): Promise<ResultCompetitionMatch>
  persistGeneratedPlan(
    input: PersistGeneratedPlanInput,
  ): Promise<PersistedCompetitionBracket>
}

export interface CompetitionRepository extends CompetitionRepositoryTransaction {
  inTransaction<T>(
    operation: (repository: CompetitionRepositoryTransaction) => Promise<T>,
  ): Promise<T>
  findOrganizerWorkspace(
    tournamentId: string,
  ): Promise<OrganizerCompetitionWorkspace | null>
}
