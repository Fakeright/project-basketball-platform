export type TournamentStatus = "OPEN" | "CLOSED" | "ONGOING" | "COMPLETED"
export type TournamentFormat = "FIVE_V_FIVE" | "THREE_V_THREE"

export interface TournamentSearchFilters {
  query?: string
  province?: string
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
  scheduledAt: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
}

export interface Tournament {
  slug: string
  title: string
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
  teams: string[]
  matches: Match[]
}
