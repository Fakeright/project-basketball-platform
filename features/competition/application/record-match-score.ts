/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจคะแนนจำนวนเต็มที่ไม่ติดลบ แล้วบันทึกคะแนนร่าง โดยยังไม่เลื่อนทีมไปคู่ถัดไป
 * เรียกใช้จาก: app/api/organizer/tournaments/[id]/matches/[matchId]/score/route.ts, features/competition/presentation/competition-handler.ts
 * ตามการทำงานต่อ: features/competition/application/match-result-access.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import { assertDraftScore } from "@/features/competition/domain/match-result-policy"

import { loadMutableMatchResultContext } from "./match-result-access"
import type {
  CompetitionRepository,
  ResultCompetitionMatch,
} from "./ports/competition-repository"

export interface RecordMatchScoreInput {
  tournamentId: string
  matchId: string
  homeScore: number
  awayScore: number
  expectedVersion: number
}

/** เก็บคะแนนร่างเท่านั้น ไม่ระบุผู้ชนะหรือเลื่อนทีมไปคู่ถัดไป */
export async function recordMatchScore(
  input: RecordMatchScoreInput,
  actor: Actor,
  dependencies: { competitions: CompetitionRepository; now: () => Date },
): Promise<ResultCompetitionMatch> {
  assertDraftScore(input)
  return dependencies.competitions.inTransaction(async (competitions) => {
    await loadMutableMatchResultContext(
      input,
      actor,
      "result.record",
      competitions,
    )
    return competitions.recordScore({
      ...input,
      actorId: actor.id,
      adminOverride: actor.role === "PLATFORM_ADMIN",
      at: dependencies.now().toISOString(),
    })
  })
}
