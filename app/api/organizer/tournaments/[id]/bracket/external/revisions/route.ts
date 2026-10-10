import { randomUUID } from "node:crypto"

import { uploadExternalBracket } from "@/features/competition/application/upload-external-bracket"
import { getExternalBracketRepository } from "@/features/competition/infrastructure/get-external-bracket-repository"
import { probeBracketFile } from "@/features/competition/infrastructure/bracket-file-probe"
import { handleUploadExternalBracket } from "@/features/competition/presentation/external-bracket-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const externalBrackets = getExternalBracketRepository()
  const storage = new SupabaseObjectStorage()
  return handleUploadExternalBracket(id, request, {
    actorProvider: createNextCookieCurrentActorProvider(),
    upload: (input, actor) =>
      uploadExternalBracket(input, actor, {
        externalBrackets,
        storage,
        probe: probeBracketFile,
        createId: randomUUID,
      }),
  })
}
