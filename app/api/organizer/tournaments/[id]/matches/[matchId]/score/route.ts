/**
 * COURTSIDE: คำอธิบายไฟล์
 * API PATCH /api/organizer/tournaments/[id]/matches/[matchId]/score: รับคำขอ HTTP แล้วส่งต่อ handleRecordMatchScore
 * ตามการทำงานต่อ: features/competition/application/record-match-score.ts, features/competition/infrastructure/get-competition-repository.ts, features/competition/presentation/competition-handler.ts
 */

import { recordMatchScore } from "@/features/competition/application/record-match-score"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { handleRecordMatchScore } from "@/features/competition/presentation/competition-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

/** บันทึกคะแนนร่างโดยยังไม่ยืนยันผู้ชนะหรือเลื่อนทีม */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> },
) {
  return withSafeRouteBoundary("competition.match.score", async () => {
    const { id, matchId } = await params
    const competitions = getCompetitionRepository()
    return handleRecordMatchScore(id, matchId, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      record: (input, actor) =>
        recordMatchScore(input, actor, { competitions, now: () => new Date() }),
    })
  })
}
