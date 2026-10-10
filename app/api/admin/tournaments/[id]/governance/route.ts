import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"
import { handleTournamentGovernance } from "@/features/tournament-operations/presentation/tournament-governance-handler"

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]/governance">,
) {
  return withSafeRouteBoundary("tournament.governance", async () => {
    const { id } = await context.params
    return handleTournamentGovernance(request, id, {
      actorProvider: createNextCookieCurrentActorProvider(),
      repository: await getTournamentOperationsRepository(),
      now: () => new Date(),
    })
  })
}
