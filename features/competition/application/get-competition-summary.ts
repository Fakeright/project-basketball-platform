export interface CompetitionSummaryTeam {
  teamId: string
  teamName: string
}

export interface CompetitionSummary {
  winner: CompetitionSummaryTeam | null
  runnerUp: CompetitionSummaryTeam | null
  eliminatedByRound: Array<{
    roundSequence: number
    roundName: string
    teams: CompetitionSummaryTeam[]
  }>
}

interface CompetitionSummaryMatch {
  id: string
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
  const finalMatch = orderedMatches.at(-1)
  const finalResult = finalMatch ? getConfirmedResult(finalMatch) : null
  const eliminationRounds = new Map<
    number,
    { roundName: string; teams: CompetitionSummaryTeam[] }
  >()

  for (const match of orderedMatches) {
    if (match.id === finalMatch?.id) continue
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
    winner: finalResult?.winner ?? null,
    runnerUp: finalResult?.loser ?? null,
    eliminatedByRound: [...eliminationRounds.entries()]
      .sort(([left], [right]) => left - right)
      .map(([roundSequence, round]) => ({ roundSequence, ...round })),
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
