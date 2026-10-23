/**
 * COURTSIDE: คำอธิบายไฟล์
 * API PATCH /api/organizer/tournaments/[id]/matches/[matchId]/schedule: รับคำขอ HTTP แล้วส่งต่อ handleScheduleMatch
 * ตามการทำงานต่อ: features/competition/application/schedule-match.ts, features/competition/infrastructure/get-competition-repository.ts, features/competition/presentation/competition-handler.ts
 */

import { scheduleMatch } from "@/features/competition/application/schedule-match"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { handleScheduleMatch } from "@/features/competition/presentation/competition-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

/** รับการแก้วันเวลา/สนาม แล้วส่งให้ handler กับ use case ตรวจเงื่อนไข */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> },
) {
  return withSafeRouteBoundary("competition.match.schedule", async () => {
    const { id, matchId } = await params
    const competitions = getCompetitionRepository()
    return handleScheduleMatch(id, matchId, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      schedule: (input, actor) =>
        scheduleMatch(input, actor, { competitions, now: () => new Date() }),
    })
  })
}
