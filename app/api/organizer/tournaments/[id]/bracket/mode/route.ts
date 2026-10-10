import { selectBracketMode } from "@/features/competition/application/select-bracket-mode"
import { getExternalBracketRepository } from "@/features/competition/infrastructure/get-external-bracket-repository"
import { handleSelectBracketMode } from "@/features/competition/presentation/external-bracket-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const externalBrackets = getExternalBracketRepository()
  return handleSelectBracketMode(id, request, {
    actorProvider: createNextCookieCurrentActorProvider(),
    select: (input, actor) =>
      selectBracketMode(input, actor, { externalBrackets }),
  })
}
