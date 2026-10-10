import type { MatchPurpose } from "@/features/competition/domain/competition"

export interface CompetitionSummaryTeam {
  teamId: string
  teamName: string
}

export interface CompetitionSummary {
  winner: CompetitionSummaryTeam | null
  runnerUp: CompetitionSummaryTeam | null
  thirdPlace: CompetitionSummaryTeam | null
  eliminatedByRound: Array<{
    roundSequence: number
    roundName: string
    teams: CompetitionSummaryTeam[]
  }>
}

interface CompetitionSummaryMatch {
  id: string
  purpose: MatchPurpose
  round: string
  roundSequence?: number
  sequence?: number
  homeTeamId?: string
  homeTeam: string
  awayTeamId?: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  winnerTeamId?: string | null
}

export function getCompetitionSummary(
  matches: readonly CompetitionSummaryMatch[],
): CompetitionSummary {
  const orderedMatches = [...matches].sort(
    (left, right) =>
      (left.roundSequence ?? -1) - (right.roundSequence ?? -1) ||
      (left.sequence ?? -1) - (right.sequence ?? -1),
  )
  const championshipMatch = orderedMatches.find(
    (match) => match.purpose === "CHAMPIONSHIP",
  )
  const thirdPlaceMatch = orderedMatches.find(
    (match) => match.purpose === "THIRD_PLACE",
  )
  const championshipResult = championshipMatch
    ? getConfirmedResult(championshipMatch)
    : null
  const thirdPlaceResult = thirdPlaceMatch
    ? getConfirmedResult(thirdPlaceMatch)
    : null
  const placementTeamIds = new Set(
    [
      championshipResult?.winner.teamId,
      championshipResult?.loser.teamId,
      thirdPlaceResult?.winner.teamId,
    ].filter((teamId): teamId is string => Boolean(teamId)),
  )
  const eliminationRounds = new Map<
    number,
    { roundName: string; teams: CompetitionSummaryTeam[] }
  >()

  for (const match of orderedMatches) {
    if (match.purpose !== "STANDARD") continue
    const result = getConfirmedResult(match)
    if (!result || match.roundSequence === undefined) continue
    const round = eliminationRounds.get(match.roundSequence) ?? {
      roundName: match.round,
      teams: [],
    }
    if (!round.teams.some((team) => team.teamId === result.loser.teamId)) {
      round.teams.push(result.loser)
    }
    eliminationRounds.set(match.roundSequence, round)
  }

  return {
    winner: championshipResult?.winner ?? null,
    runnerUp: championshipResult?.loser ?? null,
    thirdPlace: thirdPlaceResult?.winner ?? null,
    eliminatedByRound: [...eliminationRounds.entries()]
      .sort(([left], [right]) => left - right)
      .map(([roundSequence, round]) => ({
        roundSequence,
        ...round,
        teams: round.teams.filter(
          (team) => !placementTeamIds.has(team.teamId),
        ),
      }))
      .filter((round) => round.teams.length > 0),
  }
}

function getConfirmedResult(match: CompetitionSummaryMatch): {
  winner: CompetitionSummaryTeam
  loser: CompetitionSummaryTeam
} | null {
  if (
    match.homeScore === null ||
    match.awayScore === null ||
    !match.homeTeamId ||
    !match.awayTeamId ||
    !match.winnerTeamId ||
    match.homeScore === match.awayScore
  ) {
    return null
  }
  if (match.winnerTeamId === match.homeTeamId) {
    return {
      winner: { teamId: match.homeTeamId, teamName: match.homeTeam },
      loser: { teamId: match.awayTeamId, teamName: match.awayTeam },
    }
  }
  if (match.winnerTeamId === match.awayTeamId) {
    return {
      winner: { teamId: match.awayTeamId, teamName: match.awayTeam },
      loser: { teamId: match.homeTeamId, teamName: match.homeTeam },
    }
  }
  return null
}
