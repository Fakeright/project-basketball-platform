export type BracketMode = "SYSTEM_GENERATED" | "EXTERNAL_DOCUMENT"

export type BracketGenerationMethod = "SEEDED" | "RANDOM"

export type MatchSlot = "HOME" | "AWAY"

export type CompetitionTournamentStatus =
  | "REGISTRATION_CLOSED"
  | "IN_PROGRESS"
  | "COMPLETED"

export interface LockedBracketEntry {
  id: string
  bracketId: string
  registrationId: string
  teamId: string
  teamNameSnapshot: string
  seed: number
  drawPosition: number
  startRoundSequence: number
}

export interface CompetitionMatch {
  id: string
  bracketId: string
  roundSequence: number
  sequence: number
  homeTeamId: string | null
  awayTeamId: string | null
  winnerTeamId: string | null
  homeScore: number | null
  awayScore: number | null
  nextMatchId: string | null
  nextSlot: MatchSlot | null
  version: number
}
