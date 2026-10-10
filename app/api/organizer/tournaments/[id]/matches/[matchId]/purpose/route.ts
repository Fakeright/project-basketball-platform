import { updateExternalMatchPurpose } from "@/features/competition/application/update-external-match-purpose"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { handleUpdateExternalMatchPurpose } from "@/features/competition/presentation/competition-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> },
) {
  return withSafeRouteBoundary(
    "competition.external-match.purpose.update",
    async () => {
      const { id, matchId } = await params
      const competitions = getCompetitionRepository()
      return handleUpdateExternalMatchPurpose(id, matchId, request, {
        actorProvider: createNextCookieCurrentActorProvider(),
        updatePurpose: (input, actor) =>
          updateExternalMatchPurpose(input, actor, {
            competitions,
            now: () => new Date(),
          }),
      })
    },
  )
}
