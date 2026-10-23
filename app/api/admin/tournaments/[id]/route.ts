/**
 * COURTSIDE: คำอธิบายไฟล์
 * API PUT /api/admin/tournaments/[id]: รับคำขอ HTTP แล้วส่งต่อ saveTournamentHandler
 * ตามการทำงานต่อ: features/admin/presentation/save-tournament-handler.ts, features/identity/infrastructure/next-cookie-current-actor-provider.ts, features/shared/presentation/safe-http.ts
 */

import { saveTournamentHandler } from "@/features/admin/presentation/save-tournament-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

export async function PUT(
  request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]">,
) {
  return withSafeRouteBoundary("tournament.update", async () => {
    const { id } = await context.params
    const actorProvider = createNextCookieCurrentActorProvider()
    return saveTournamentHandler({
      actor: await actorProvider.getCurrentActor(),
      request,
      repository: await getTournamentOperationsRepository(),
      id,
    })
  })
}
