import { generateSingleEliminationBracket } from "@/features/competition/domain/bracket-generator"
import type { MatchSlot } from "@/features/competition/domain/competition"

export interface DemoCompetitionTeam {
  id: string
  name: string
  seed: number
  registrationId: string
  entryId: string
}

export interface DemoCompetitionMatch {
  id: string
  key: string
  roundId: string
  roundName: string
  roundSequence: number
  sequence: number
  homeTeamId: string | null
  awayTeamId: string | null
  homeScore: number | null
  awayScore: number | null
  winnerTeamId: string | null
  status: "SCHEDULED" | "COMPLETED"
  scheduledAt: string
  court: string
  nextMatchId: string | null
  nextSlot: MatchSlot | null
}

export interface DemoCompetitionFixture {
  tournamentId: "tournament-ongoing" | "tournament-completed"
  tournamentSlug: string
  bracketId: string
  generationMethod: "SEEDED" | "RANDOM"
  teams: DemoCompetitionTeam[]
  teamNames: Map<string, string>
  rounds: Array<{ id: string; sequence: number; name: string }>
  entries: Array<DemoCompetitionTeam & { startRoundSequence: number }>
  matches: DemoCompetitionMatch[]
}

interface DemoCaseDefinition {
  tournamentId: DemoCompetitionFixture["tournamentId"]
  tournamentSlug: string
  prefix: string
  generationMethod: DemoCompetitionFixture["generationMethod"]
  teamNames: string[]
  completedScores: Array<readonly [number, number]>
  startsAt: string
}

const definitions: DemoCaseDefinition[] = [
  {
    tournamentId: "tournament-ongoing",
    tournamentSlug: "ongoing-chonburi-cup",
    prefix: "demo-ongoing",
    generationMethod: "SEEDED",
    teamNames: [
      "Chonburi Sharks",
      "Rayong Waves",
      "Pattaya Flyers",
      "Eastern Giants",
      "Sriracha Hoops",
      "Coastline Crew",
    ],
    completedScores: [
      [76, 68],
      [71, 73],
    ],
    startsAt: "2026-11-15T02:00:00.000Z",
  },
  {
    tournamentId: "tournament-completed",
    tournamentSlug: "completed-hoops-classic",
    prefix: "demo-completed",
    generationMethod: "RANDOM",
    teamNames: [
      "Bangkok Arrows",
      "Chiang Mai Falcons",
      "Phuket Waves",
      "Khon Kaen Comets",
      "Nakhon Pathom Lions",
      "Songkhla Storm",
      "Korat Knights",
      "Udon Rockets",
    ],
    completedScores: [
      [88, 61],
      [70, 65],
      [74, 60],
      [79, 66],
      [82, 71],
      [68, 75],
      [86, 80],
    ],
    startsAt: "2026-11-15T02:00:00.000Z",
  },
]

export function createDemoCompetitionFixtures(): DemoCompetitionFixture[] {
  return definitions.map(createFixture)
}

function createFixture(definition: DemoCaseDefinition): DemoCompetitionFixture {
  const teams = definition.teamNames.map((name, index) => ({
    id: `${definition.prefix}-team-${index + 1}`,
    name,
    seed: index + 1,
    registrationId: `${definition.prefix}-registration-${index + 1}`,
    entryId: `${definition.prefix}-entry-${index + 1}`,
  }))
  const plan = generateSingleEliminationBracket({
    entries: teams.map((team) => ({
      entryId: team.entryId,
      teamId: team.id,
      seed: team.seed,
    })),
  })
  const bracketId = `${definition.prefix}-bracket`
  const roundIds = new Map(
    plan.rounds.map((round) => [
      round.sequence,
      `${definition.prefix}-round-${round.sequence}`,
    ]),
  )
  const matchIds = new Map(
    plan.matches.map((match) => [
      match.key,
      `${definition.prefix}-${match.key}`,
    ]),
  )
  const winners = new Map<string, string>()
  let completedIndex = 0
  const matches = plan.matches.map((match, index) => {
    const homeTeamId =
      match.homeTeamId ?? winnerForSource(match.homeSourceMatchKey, winners)
    const awayTeamId =
      match.awayTeamId ?? winnerForSource(match.awaySourceMatchKey, winners)
    const score = definition.completedScores[completedIndex]
    const canComplete = Boolean(score && homeTeamId && awayTeamId)
    const winnerTeamId = canComplete
      ? score[0] > score[1]
        ? homeTeamId
        : awayTeamId
      : null
    if (winnerTeamId) {
      winners.set(match.key, winnerTeamId)
      completedIndex += 1
    }

    return {
      id: requiredMapValue(matchIds, match.key),
      key: match.key,
      roundId: requiredMapValue(roundIds, match.roundSequence),
      roundName: requiredRoundName(plan.rounds, match.roundSequence),
      roundSequence: match.roundSequence,
      sequence: match.sequence,
      homeTeamId,
      awayTeamId,
      homeScore: canComplete ? score[0] : null,
      awayScore: canComplete ? score[1] : null,
      winnerTeamId,
      status: canComplete ? "COMPLETED" : "SCHEDULED",
      scheduledAt: addHours(definition.startsAt, index * 2),
      court: index % 2 === 0 ? "สนาม A" : "สนาม B",
      nextMatchId: match.nextMatchKey
        ? requiredMapValue(matchIds, match.nextMatchKey)
        : null,
      nextSlot: match.nextSlot,
    } satisfies DemoCompetitionMatch
  })
  const startsByEntry = new Map(
    plan.entryStarts.map((entry) => [entry.entryId, entry.roundSequence]),
  )

  return {
    tournamentId: definition.tournamentId,
    tournamentSlug: definition.tournamentSlug,
    bracketId,
    generationMethod: definition.generationMethod,
    teams,
    teamNames: new Map(teams.map((team) => [team.id, team.name])),
    rounds: plan.rounds.map((round) => ({
      ...round,
      id: requiredMapValue(roundIds, round.sequence),
    })),
    entries: teams.map((team) => ({
      ...team,
      startRoundSequence: requiredMapValue(startsByEntry, team.entryId),
    })),
    matches,
  }
}

function winnerForSource(
  sourceMatchKey: string | null,
  winners: Map<string, string>,
) {
  return sourceMatchKey ? winners.get(sourceMatchKey) ?? null : null
}

function addHours(value: string, hours: number) {
  return new Date(new Date(value).getTime() + hours * 60 * 60 * 1000).toISOString()
}

function requiredRoundName(
  rounds: Array<{ sequence: number; name: string }>,
  sequence: number,
) {
  const name = rounds.find((round) => round.sequence === sequence)?.name
  if (!name) throw new Error("DEMO_FIXTURE_INVALID")
  return name
}

function requiredMapValue<TKey, TValue>(
  values: Map<TKey, TValue>,
  key: TKey,
): TValue {
  const value = values.get(key)
  if (value === undefined) throw new Error("DEMO_FIXTURE_INVALID")
  return value
}
