/**
 * COURTSIDE: คำอธิบายไฟล์
 * API POST /api/admin/tournaments: รับคำขอ HTTP แล้วส่งต่อ saveTournamentHandler
 * ตามการทำงานต่อ: features/admin/presentation/save-tournament-handler.ts, features/identity/infrastructure/next-cookie-current-actor-provider.ts, features/shared/presentation/safe-http.ts
 */

import { saveTournamentHandler } from "@/features/admin/presentation/save-tournament-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

/** จุดรับคำขอสร้างรายการ: ส่งต่อให้ handler ตรวจ payload และ use case ตรวจสิทธิ์ */
export async function POST(request: Request) {
  return withSafeRouteBoundary("tournament.create", async () => {
    const actorProvider = createNextCookieCurrentActorProvider()
    return saveTournamentHandler({
      actor: await actorProvider.getCurrentActor(),
      request,
      repository: await getTournamentOperationsRepository(),
    })
  })
}
