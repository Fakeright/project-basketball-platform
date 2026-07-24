import type { Match } from "@/features/tournaments/domain/tournament"

export function groupMatchesByDateAndCourt(matches: Match[]): Record<string, Record<string, Match[]>> {
  return matches.reduce<Record<string, Record<string, Match[]>>>((groupedMatches, match) => {
    const date = match.scheduledAt.slice(0, 10)
    const courts = (groupedMatches[date] ??= {})
    const matchesForCourt = (courts[match.court] ??= [])

    matchesForCourt.push(match)

    return groupedMatches
  }, {})
}
