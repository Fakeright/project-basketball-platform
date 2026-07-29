import { saveTournamentHandler } from "@/features/admin/presentation/save-tournament-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

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
