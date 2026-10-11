import { lockBracketEntries } from "@/features/competition/application/lock-bracket-entries"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { handleLockBracketEntries } from "@/features/competition/presentation/competition-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withSafeRouteBoundary("competition.entries.lock", async () => {
    const { id } = await params
    const competitions = getCompetitionRepository()

    return handleLockBracketEntries(id, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      lockEntries: (input, actor) =>
        lockBracketEntries(input, actor, {
          competitions,
          now: () => new Date(),
        }),
    })
  })
}
