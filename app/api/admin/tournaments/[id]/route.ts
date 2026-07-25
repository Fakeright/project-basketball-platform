import { saveTournamentHandler } from "@/features/admin/presentation/save-tournament-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getDevelopmentTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/development-tournament-operations-repository"

export async function PUT(
  request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]">,
) {
  const { id } = await context.params
  const actorProvider = createNextCookieCurrentActorProvider()
  return saveTournamentHandler({
    actor: await actorProvider.getCurrentActor(),
    request,
    repository: await getDevelopmentTournamentOperationsRepository(),
    id,
  })
}
