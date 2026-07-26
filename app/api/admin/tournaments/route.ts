import { saveTournamentHandler } from "@/features/admin/presentation/save-tournament-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

export async function POST(request: Request) {
  const actorProvider = createNextCookieCurrentActorProvider()
  return saveTournamentHandler({
    actor: await actorProvider.getCurrentActor(),
    request,
    repository: await getTournamentOperationsRepository(),
  })
}
