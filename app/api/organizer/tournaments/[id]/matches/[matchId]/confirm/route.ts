/**
 * COURTSIDE: คำอธิบายไฟล์
 * API POST /api/organizer/tournaments/[id]/matches/[matchId]/confirm: รับคำขอ HTTP แล้วส่งต่อ handleConfirmMatchResult
 * ตามการทำงานต่อ: features/competition/application/confirm-match-result.ts, features/competition/infrastructure/get-competition-repository.ts, features/competition/presentation/competition-handler.ts
 */

import { confirmMatchResult } from "@/features/competition/application/confirm-match-result"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { handleConfirmMatchResult } from "@/features/competition/presentation/competition-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

/** ยืนยันผลผ่าน use case; ฝั่งนี้เป็นเพียงจุดรับ HTTP ไม่ตัดสินสิทธิ์เอง */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> },
) {
  return withSafeRouteBoundary("competition.match.confirm", async () => {
    const { id, matchId } = await params
    const competitions = getCompetitionRepository()
    return handleConfirmMatchResult(id, matchId, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      confirm: (input, actor) =>
        confirmMatchResult(input, actor, { competitions, now: () => new Date() }),
    })
  })
}
