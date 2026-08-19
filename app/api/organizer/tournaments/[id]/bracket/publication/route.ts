import {
  publishBracket,
  unpublishBracket,
} from "@/features/competition/application/publish-bracket"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import {
  handlePublishBracket,
  handleUnpublishBracket,
} from "@/features/competition/presentation/competition-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withSafeRouteBoundary("competition.bracket.publication", async () => {
    const { id } = await params
    const competitions = getCompetitionRepository()
    return handlePublishBracket(id, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      publish: (input, actor) =>
        publishBracket(input, actor, { competitions, now: () => new Date() }),
    })
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withSafeRouteBoundary("competition.bracket.publication", async () => {
    const { id } = await params
    const competitions = getCompetitionRepository()
    return handleUnpublishBracket(id, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      unpublish: (input, actor) =>
        unpublishBracket(input, actor, { competitions, now: () => new Date() }),
    })
  })
}
