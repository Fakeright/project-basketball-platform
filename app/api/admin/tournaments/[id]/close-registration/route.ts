import { handleTournamentLifecycleRequest } from "@/features/admin/presentation/tournament-lifecycle-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]/close-registration">,
) {
  return withSafeRouteBoundary("tournament.close_registration", async () => {
    const { id } = await context.params
    return handleTournamentLifecycleRequest(
      request,
      id,
      "CLOSE_REGISTRATION",
      {
        actorProvider: createNextCookieCurrentActorProvider(),
        repository: await getTournamentOperationsRepository(),
        now: () => new Date(),
      },
    )
  })
}
