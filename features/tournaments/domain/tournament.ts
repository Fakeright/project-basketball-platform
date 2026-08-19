export type TournamentStatus = "OPEN" | "CLOSED" | "ONGOING" | "COMPLETED"
export type TournamentFormat = "FIVE_V_FIVE" | "THREE_V_THREE"

export interface TournamentSearchFilters {
  query?: string
  provinceCode?: string
  format?: TournamentFormat
  ageGroup?: string
  venue?: string
  date?: string
  status?: TournamentStatus
}

export interface Match {
  id: string
  tournamentSlug: string
  round: string
  court: string
  scheduledAt: string | null
  homeTeam: string
  homeTeamId?: string
  awayTeam: string
  awayTeamId?: string
  homeScore: number | null
  awayScore: number | null
  winnerTeamId?: string | null
  roundSequence?: number
  sequence?: number
}

export interface TournamentDocument {
  id: string
  fileName: string
  contentType: string
  byteSize: number
  url: string
}

export interface Tournament {
  id: string
  slug: string
  title: string
  provinceCode: string
  province: string
  venue: string
  format: TournamentFormat
  ageGroup: string
  status: TournamentStatus
  startsAt: string
  endsAt: string
  registrationDeadline: string
  description: string
  posterUrl?: string
  documents: TournamentDocument[]
  teams: string[]
  matches: Match[]
  bracketSource?: "SYSTEM_GENERATED" | "EXTERNAL_DOCUMENT"
  bracketEntries?: Array<{
    teamName: string
    startRoundSequence: number
  }>
}
