import { retireExternalBracket } from "@/features/competition/application/retire-external-bracket"
import { getExternalBracketRepository } from "@/features/competition/infrastructure/get-external-bracket-repository"
import { handleRetireExternalBracket } from "@/features/competition/presentation/external-bracket-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; revisionId: string }> },
) {
  const { id, revisionId } = await params
  const externalBrackets = getExternalBracketRepository()
  return handleRetireExternalBracket(id, revisionId, request, {
    actorProvider: createNextCookieCurrentActorProvider(),
    retire: (input, actor) =>
      retireExternalBracket(input, actor, { externalBrackets }),
  })
}
