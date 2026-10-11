import { correctMatchResult } from "@/features/competition/application/correct-match-result"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { handleCorrectMatchResult } from "@/features/competition/presentation/competition-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> },
) {
  return withSafeRouteBoundary(
    "competition.match.result-correction",
    async () => {
      const { id, matchId } = await params
      const competitions = getCompetitionRepository()
      return handleCorrectMatchResult(id, matchId, request, {
        actorProvider: createNextCookieCurrentActorProvider(),
        correct: (input, actor) =>
          correctMatchResult(input, actor, {
            competitions,
            now: () => new Date(),
          }),
      })
    },
  )
}
