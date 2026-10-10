import { validateSeeds } from "./bracket-policy"
import type { MatchPurpose, MatchSlot } from "./competition"

export interface BracketGenerationEntry {
  entryId: string
  teamId: string
  seed: number
}

export interface GeneratedMatchPlan {
  key: string
  roundSequence: number
  sequence: number
  purpose: MatchPurpose
  homeTeamId: string | null
  awayTeamId: string | null
  homeSourceMatchKey: string | null
  awaySourceMatchKey: string | null
  nextMatchKey: string | null
  nextSlot: MatchSlot | null
}

export interface GeneratedBracketPlan {
  bracketSize: number
  rounds: Array<{ sequence: number; name: string }>
  matches: GeneratedMatchPlan[]
  entryStarts: Array<{ entryId: string; roundSequence: number }>
}

type BracketSource =
  | { kind: "ENTRY"; entryId: string; teamId: string }
  | { kind: "MATCH"; matchKey: string }
  | null

export function mirroredSeedOrder(size: number): number[] {
  if (!Number.isInteger(Math.log2(size)) || size < 2 || size > 32) {
    throw new Error("BRACKET_SIZE_INVALID")
  }
  if (size === 2) return [1, 2]

  return mirroredSeedOrder(size / 2).flatMap((seed) => [
    seed,
    size + 1 - seed,
  ])
}

export function generateSingleEliminationBracket(input: {
  entries: readonly BracketGenerationEntry[]
}): GeneratedBracketPlan {
  validateSeeds(input.entries)

  const bracketSize = nextPowerOfTwo(input.entries.length)
  const entriesBySeed = new Map(
    input.entries.map((entry) => [entry.seed, entry]),
  )
  const entryStarts = new Map<string, number>()
  const matches: GeneratedMatchPlan[] = []
  const matchesByKey = new Map<string, GeneratedMatchPlan>()
  let currentSources: BracketSource[] = mirroredSeedOrder(bracketSize).map((seed) => {
    const entry = entriesBySeed.get(seed)
    return entry
      ? { kind: "ENTRY" as const, entryId: entry.entryId, teamId: entry.teamId }
      : null
  })

  const roundCount = Math.log2(bracketSize)
  const rounds = Array.from({ length: roundCount }, (_, index) => ({
    sequence: index + 1,
    name: getRoundName(bracketSize / 2 ** index),
  }))

  for (let roundSequence = 1; roundSequence <= roundCount; roundSequence += 1) {
    const nextSources: BracketSource[] = []

    for (let index = 0; index < currentSources.length; index += 2) {
      const homeSource = currentSources[index] ?? null
      const awaySource = currentSources[index + 1] ?? null

      if (!homeSource && !awaySource) {
        nextSources.push(null)
        continue
      }

      if (!homeSource || !awaySource) {
        nextSources.push(homeSource ?? awaySource)
        continue
      }

      const sequence = index / 2 + 1
      const key = `round-${roundSequence}-match-${sequence}`
      const match: GeneratedMatchPlan = {
        key,
        roundSequence,
        sequence,
        purpose: "STANDARD",
        homeTeamId: sourceTeamId(homeSource),
        awayTeamId: sourceTeamId(awaySource),
        homeSourceMatchKey: sourceMatchKey(homeSource),
        awaySourceMatchKey: sourceMatchKey(awaySource),
        nextMatchKey: null,
        nextSlot: null,
      }

      setEntryStart(entryStarts, homeSource, roundSequence)
      setEntryStart(entryStarts, awaySource, roundSequence)
      connectSourceToMatch(matchesByKey, homeSource, key, "HOME")
      connectSourceToMatch(matchesByKey, awaySource, key, "AWAY")
      matches.push(match)
      matchesByKey.set(key, match)
      nextSources.push({ kind: "MATCH", matchKey: key })
    }

    currentSources = nextSources
  }

  for (const match of matches) {
    if (match.nextMatchKey === null) match.purpose = "CHAMPIONSHIP"
  }

  const plan: GeneratedBracketPlan = {
    bracketSize,
    rounds,
    matches,
    entryStarts: input.entries.map((entry) => ({
      entryId: entry.entryId,
      roundSequence: entryStarts.get(entry.entryId) ?? 0,
    })),
  }

  assertPlanIntegrity(plan, input.entries.length)
  return plan
}

function nextPowerOfTwo(value: number): number {
  return 2 ** Math.ceil(Math.log2(value))
}

function getRoundName(teamCount: number): string {
  if (teamCount === 2) return "Final"
  if (teamCount === 4) return "Semi Final"
  if (teamCount === 8) return "Quarter Final"
  return `Round of ${teamCount}`
}

function sourceTeamId(source: Exclude<BracketSource, null>): string | null {
  return source.kind === "ENTRY" ? source.teamId : null
}

function sourceMatchKey(source: Exclude<BracketSource, null>): string | null {
  return source.kind === "MATCH" ? source.matchKey : null
}

function setEntryStart(
  entryStarts: Map<string, number>,
  source: Exclude<BracketSource, null>,
  roundSequence: number,
): void {
  if (source.kind === "ENTRY") {
    entryStarts.set(source.entryId, roundSequence)
  }
}

function connectSourceToMatch(
  matchesByKey: Map<string, GeneratedMatchPlan>,
  source: Exclude<BracketSource, null>,
  nextMatchKey: string,
  nextSlot: MatchSlot,
): void {
  if (source.kind !== "MATCH") return

  const sourceMatch = matchesByKey.get(source.matchKey)
  if (!sourceMatch) throw new Error("BRACKET_PLAN_INVALID")

  sourceMatch.nextMatchKey = nextMatchKey
  sourceMatch.nextSlot = nextSlot
}

function assertPlanIntegrity(
  plan: GeneratedBracketPlan,
  entryCount: number,
): void {
  const matchKeys = plan.matches.map((match) => match.key)
  const matchKeySet = new Set(matchKeys)
  const finals = plan.matches.filter((match) => match.nextMatchKey === null)
  const hasInvalidDestination = plan.matches.some(
    (match) =>
      (match.nextMatchKey === null) !== (match.nextSlot === null) ||
      (match.nextMatchKey !== null && !matchKeySet.has(match.nextMatchKey)),
  )
  const hasMissingEntryStart = plan.entryStarts.some(
    (entryStart) => entryStart.roundSequence < 1,
  )

  if (
    plan.matches.length !== entryCount - 1 ||
    matchKeySet.size !== plan.matches.length ||
    finals.length !== 1 ||
    hasInvalidDestination ||
    hasMissingEntryStart
  ) {
    throw new Error("BRACKET_PLAN_INVALID")
  }
}
