import { startTournamentCompetition } from "@/features/tournament-operations/application/transition-tournament-competition"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"
import { handleTournamentCompetitionLifecycle } from "@/features/tournament-operations/presentation/tournament-competition-lifecycle-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export async function POST(
  request: Request,
  context: RouteContext<"/api/organizer/tournaments/[id]/start">,
) {
  const { id } = await context.params
  const repository = await getTournamentOperationsRepository()
  return handleTournamentCompetitionLifecycle(request, id, "START", {
    actorProvider: createNextCookieCurrentActorProvider(),
    transition: (input, actor) =>
      startTournamentCompetition(repository, input, actor, {
        now: () => new Date(),
      }),
  })
}
