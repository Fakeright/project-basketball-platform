import { submitTournamentHandler } from "@/features/admin/presentation/submit-tournament-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getDevelopmentTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/development-tournament-operations-repository"

export async function POST(
  _request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]/submit">,
) {
  const { id } = await context.params
  const actorProvider = createNextCookieCurrentActorProvider()
  return submitTournamentHandler({
    actor: await actorProvider.getCurrentActor(),
    id,
    repository: await getDevelopmentTournamentOperationsRepository(),
  })
}
