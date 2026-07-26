import { handleReviewRequest } from "@/features/admin/presentation/review-tournament-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]/review">,
) {
  const { id } = await context.params
  const repository = await getTournamentOperationsRepository()
  return handleReviewRequest(request, id, {
    actorProvider: createNextCookieCurrentActorProvider(),
    repository,
  })
}
