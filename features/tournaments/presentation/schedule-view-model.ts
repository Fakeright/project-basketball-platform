import type { Match } from "@/features/tournaments/domain/tournament"

export type ScheduledMatch = Match & { scheduledAt: string }

export function groupMatchesByDateAndCourt(
  matches: Match[],
): Record<string, Record<string, ScheduledMatch[]>> {
  return matches.reduce<Record<string, Record<string, ScheduledMatch[]>>>((groupedMatches, match) => {
    if (!match.scheduledAt) return groupedMatches

    const date = match.scheduledAt.slice(0, 10)
    const courts = (groupedMatches[date] ??= {})
    const matchesForCourt = (courts[match.court] ??= [])

    matchesForCourt.push({ ...match, scheduledAt: match.scheduledAt })

    return groupedMatches
  }, {})
}
