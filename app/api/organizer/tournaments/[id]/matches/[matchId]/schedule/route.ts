import { scheduleMatch } from "@/features/competition/application/schedule-match"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { handleScheduleMatch } from "@/features/competition/presentation/competition-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> },
) {
  return withSafeRouteBoundary("competition.match.schedule", async () => {
    const { id, matchId } = await params
    const competitions = getCompetitionRepository()
    return handleScheduleMatch(id, matchId, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      schedule: (input, actor) =>
        scheduleMatch(input, actor, { competitions, now: () => new Date() }),
    })
  })
}
