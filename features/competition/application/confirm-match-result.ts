/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจคะแนนและบริบทคู่แข่งขัน ก่อนยืนยันผลและส่งผู้ชนะไปคู่ถัดไปภายในธุรกรรมเดียว
 * เรียกใช้จาก: app/api/organizer/tournaments/[id]/matches/[matchId]/confirm/route.ts, features/competition/presentation/competition-handler.ts
 * ตามการทำงานต่อ: features/competition/application/match-result-access.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import { decideMatchAdvancement } from "@/features/competition/domain/match-result-policy"

import { loadMutableMatchResultContext } from "./match-result-access"
import type {
  CompetitionRepository,
  ResultCompetitionMatch,
} from "./ports/competition-repository"

export interface ConfirmMatchResultInput {
  tournamentId: string
  matchId: string
  homeScore: number
  awayScore: number
  expectedVersion: number
}

/** ยืนยันคะแนนและเลื่อนผู้ชนะใน transaction เดียว; โหมดไฟล์ไม่เชื่อมคู่ถัดไป */
export async function confirmMatchResult(
  input: ConfirmMatchResultInput,
  actor: Actor,
  dependencies: { competitions: CompetitionRepository; now: () => Date },
): Promise<ResultCompetitionMatch> {
  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await loadMutableMatchResultContext(
      input,
      actor,
      "result.confirm",
      competitions,
    )
    const advancement = decideMatchAdvancement({
      homeTeamId: context.homeTeamId,
      awayTeamId: context.awayTeamId,
      homeScore: input.homeScore,
      awayScore: input.awayScore,
      nextMatchId: context.nextMatchId,
      nextSlot: context.nextSlot,
    })
    // ไฟล์ภายนอกเป็นแหล่งอ้างอิงสาย จึงไม่เดาทางเดินของผู้ชนะจากคู่ในฐานข้อมูล
    const persistedAdvancement =
      context.bracketMode === "EXTERNAL_DOCUMENT"
        ? { ...advancement, nextMatchId: null, nextSlot: null }
        : advancement
    if (
      context.nextSlotTeamId &&
      context.nextSlotTeamId !== persistedAdvancement.winnerTeamId
    ) {
      throw new Error("MATCH_ADVANCEMENT_CONFLICT")
    }

    return competitions.confirmResultAndAdvance({
      ...input,
      ...persistedAdvancement,
      actorId: actor.id,
      adminOverride: actor.role === "PLATFORM_ADMIN",
      at: dependencies.now().toISOString(),
    })
  })
}
