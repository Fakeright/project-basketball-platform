import { randomUUID } from "node:crypto"

import { generateBracketDraft } from "@/features/competition/application/generate-bracket"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { tokenizedBracketShuffle } from "@/features/competition/infrastructure/tokenized-bracket-shuffle"
import { handleGenerateBracket } from "@/features/competition/presentation/competition-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withSafeRouteBoundary("competition.bracket.generate", async () => {
    const { id } = await params
    const competitions = getCompetitionRepository()

    return handleGenerateBracket(id, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      generate: (input, actor) =>
        generateBracketDraft(input, actor, {
          competitions,
          now: () => new Date(),
          createDrawToken: randomUUID,
          shuffle: tokenizedBracketShuffle,
        }),
    })
  })
}
