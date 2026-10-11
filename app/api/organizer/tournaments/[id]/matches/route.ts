import { createExternalMatch } from "@/features/competition/application/create-external-match"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { handleCreateExternalMatch } from "@/features/competition/presentation/competition-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withSafeRouteBoundary("competition.external-match.create", async () => {
    const { id } = await params
    const competitions = getCompetitionRepository()
    return handleCreateExternalMatch(id, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      create: (input, actor) =>
        createExternalMatch(input, actor, {
          competitions,
          now: () => new Date(),
        }),
    })
  })
}
