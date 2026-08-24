import { publishExternalBracket } from "@/features/competition/application/publish-external-bracket"
import { getExternalBracketRepository } from "@/features/competition/infrastructure/get-external-bracket-repository"
import { handlePublishExternalBracket } from "@/features/competition/presentation/external-bracket-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const externalBrackets = getExternalBracketRepository()
  return handlePublishExternalBracket(id, request, {
    actorProvider: createNextCookieCurrentActorProvider(),
    publish: (input, actor) =>
      publishExternalBracket(input, actor, { externalBrackets }),
  })
}
