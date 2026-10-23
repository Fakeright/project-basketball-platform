/**
 * COURTSIDE: คำอธิบายไฟล์
 * API POST /api/admin/tournaments/[id]/submit: รับคำขอ HTTP แล้วส่งต่อ submitTournamentHandler
 * ตามการทำงานต่อ: features/admin/presentation/submit-tournament-handler.ts, features/identity/infrastructure/next-cookie-current-actor-provider.ts, features/shared/presentation/safe-http.ts
 */

import { submitTournamentHandler } from "@/features/admin/presentation/submit-tournament-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

export async function POST(
  _request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]/submit">,
) {
  return withSafeRouteBoundary("tournament.submit", async () => {
    const { id } = await context.params
    const actorProvider = createNextCookieCurrentActorProvider()
    return submitTournamentHandler({
      actor: await actorProvider.getCurrentActor(),
      id,
      repository: await getTournamentOperationsRepository(),
    })
  })
}
