export const TOURNAMENT_AGE_GROUPS = [
  "U12",
  "U14",
  "U16",
  "U18",
  "U23",
  "Open",
] as const

export type TournamentAgeGroup = (typeof TOURNAMENT_AGE_GROUPS)[number]

const tournamentAgeGroups = new Set<string>(TOURNAMENT_AGE_GROUPS)

export function isTournamentAgeGroup(value: string): boolean {
  return tournamentAgeGroups.has(value)
}
