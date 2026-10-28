/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจคะแนนและตัดสินทีมชนะจากคะแนน พร้อมระบุคู่และช่อง HOME/AWAY ที่ผู้ชนะจะไปต่อ
 * เรียกใช้จาก: features/competition/application/confirm-match-result.ts, features/competition/application/correct-match-result.ts
 */

import type { MatchSlot } from "./competition"

// คะแนนร่างต้องเป็นจำนวนเต็มตั้งแต่ศูนย์ขึ้นไป แต่ยังเสมอกันได้
export function assertDraftScore(input: {
  homeScore: number
  awayScore: number
}): void {
  if (
    !Number.isInteger(input.homeScore) ||
    !Number.isInteger(input.awayScore) ||
    input.homeScore < 0 ||
    input.awayScore < 0
  ) {
    throw new Error("MATCH_SCORE_INVALID")
  }
}

// คะแนนที่จะยืนยันต้องผ่านกฎคะแนนร่างและห้ามเสมอ เพราะต้องตัดสินทีมชนะ
export function assertScoreCanBeConfirmed(input: {
  homeScore: number
  awayScore: number
}): void {
  assertDraftScore(input)
  if (
    input.homeScore === input.awayScore
  ) {
    throw new Error("MATCH_SCORE_INVALID")
  }
}

// เลือกทีมที่คะแนนมากกว่า แล้วคืนปลายทางคู่ถัดไปตามที่โครงสร้างสายกำหนดไว้
export function decideMatchAdvancement(input: {
  homeTeamId: string
  awayTeamId: string
  homeScore: number
  awayScore: number
  nextMatchId: string | null
  nextSlot: MatchSlot | null
}): {
  winnerTeamId: string
  nextMatchId: string | null
  nextSlot: MatchSlot | null
} {
  assertScoreCanBeConfirmed(input)

  return {
    winnerTeamId:
      input.homeScore > input.awayScore ? input.homeTeamId : input.awayTeamId,
    nextMatchId: input.nextMatchId,
    nextSlot: input.nextSlot,
  }
}
