/**
 * COURTSIDE: คำอธิบายไฟล์
 * สร้างแผนรอบและคู่แข่งขันในหน่วยความจำ; เส้นทางปัจจุบันจับคู่ตำแหน่ง 1–2, 3–4 และเชื่อมผู้ชนะไปคู่ถัดไป
 * เรียกใช้จาก: features/competition/application/generate-bracket.ts, features/competition/application/ports/competition-repository.ts
 * ตามการทำงานต่อ: features/competition/domain/bracket-policy.ts
 */

import {
  assertSystemBracketEntryCount,
  validateOrderedPositions,
  validateSeeds,
} from "./bracket-policy"
import type { MatchPurpose, MatchSlot } from "./competition"

export interface BracketGenerationEntry {
  entryId: string
  teamId: string
  seed: number
}

export interface OrderedBracketEntry {
  entryId: string
  teamId: string
  position: number
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

// สร้างลำดับ seed แบบเดิมสำหรับชุดข้อมูลสาธิต/การทดสอบที่ยังใช้เส้นทางนี้
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

/** วิธี seed แบบเดิม คงไว้สำหรับข้อมูล/การเรียกใช้เก่าที่ต้องอ่านได้ */
export function generateSingleEliminationBracket(input: {
  entries: readonly BracketGenerationEntry[]
}): GeneratedBracketPlan {
  validateSeeds(input.entries)

  const bracketSize = nextPowerOfTwo(input.entries.length)
  const entriesBySeed = new Map(
    input.entries.map((entry) => [entry.seed, entry]),
  )
  const sources: BracketSource[] = mirroredSeedOrder(bracketSize).map((seed) => {
    const entry = entriesBySeed.get(seed)
    return entry
      ? { kind: "ENTRY" as const, entryId: entry.entryId, teamId: entry.teamId }
      : null
  })

  return buildBracketPlan(input.entries, bracketSize, sources)
}

/** สายปัจจุบันจับคู่ตำแหน่งติดกัน: 1-2, 3-4, ...  */
export function generateOrderedSingleEliminationBracket(input: {
  entries: readonly OrderedBracketEntry[]
}): GeneratedBracketPlan {
  assertSystemBracketEntryCount(input.entries.length)
  validateOrderedPositions(input.entries)

  const byPosition = new Map(input.entries.map((entry) => [entry.position, entry]))
  const sources: BracketSource[] = Array.from(
    { length: input.entries.length },
    (_, index) => {
      const entry = byPosition.get(index + 1)
      if (!entry) throw new Error("BRACKET_ORDER_INVALID")
      return { kind: "ENTRY", entryId: entry.entryId, teamId: entry.teamId }
    },
  )

  return buildBracketPlan(input.entries, input.entries.length, sources)
}
/** สร้างคู่ทีละรอบและเชื่อมผลชนะไปช่อง HOME/AWAY ของคู่ในรอบถัดไป */
function buildBracketPlan(
  entries: readonly { entryId: string }[],
  bracketSize: number,
  initialSources: BracketSource[],
): GeneratedBracketPlan {
  const entryStarts = new Map<string, number>()
  const matches: GeneratedMatchPlan[] = []
  const matchesByKey = new Map<string, GeneratedMatchPlan>()
  let currentSources = initialSources

  const roundCount = Math.log2(bracketSize)
  const rounds = Array.from({ length: roundCount }, (_, index) => ({
    sequence: index + 1,
    name: getRoundName(bracketSize / 2 ** index),
  }))

  for (let roundSequence = 1; roundSequence <= roundCount; roundSequence += 1) {
    const nextSources: BracketSource[] = []
    // ลูปวนทีละ 2 ทีม (index += 2) เพื่อเอามาจับคู่กัน
    for (let index = 0; index < currentSources.length; index += 2) {
      const homeSource = currentSources[index] ?? null    //ทีมเจ้าบ้าน (หรือทีมฝั่งบน)
      const awaySource = currentSources[index + 1] ?? null // ทีมเยือน (หรือทีมฝั่งล่าง)

      // ช่องว่างรองรับเส้นทาง seed เดิม; เส้นทาง ORDERED ปัจจุบันรับจำนวนทีมเต็มสายเท่านั้น
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
    entryStarts: entries.map((entry) => ({
      entryId: entry.entryId,
      roundSequence: entryStarts.get(entry.entryId) ?? 0,
    })),
  }

  assertPlanIntegrity(plan, entries.length)
  return plan
}

// หาขนาดสายกำลังสองที่ครอบจำนวนทีมสำหรับวิธี seed เดิมซึ่งรองรับบาย
function nextPowerOfTwo(value: number): number {
  return 2 ** Math.ceil(Math.log2(value))
}

// ตั้งชื่อรอบจากจำนวนทีมที่เหลือ เช่น 2 ทีมคือ Final
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

// จำว่าทีมเริ่มเล่นรอบใด เพื่อรองรับแผนที่มีทีมบายจากวิธีเดิม
function setEntryStart(
  entryStarts: Map<string, number>,
  source: Exclude<BracketSource, null>,
  roundSequence: number,
): void {
  if (source.kind === "ENTRY") {
    entryStarts.set(source.entryId, roundSequence)
  }
}

// เชื่อมคู่ก่อนหน้าให้รู้ว่าผู้ชนะจะไปคู่ไหนและอยู่ช่อง HOME หรือ AWAY
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

// ตรวจจำนวนคู่ n−1 คู่ชิงเพียงหนึ่งคู่ และปลายทางผู้ชนะที่อ้างถึงคู่ซึ่งมีอยู่จริง
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
