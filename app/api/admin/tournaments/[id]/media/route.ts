import { randomUUID } from "node:crypto"

import { handleTournamentMediaUpload } from "@/features/admin/presentation/tournament-media-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { uploadTournamentMedia } from "@/features/tournament-media/application/upload-tournament-media"
import { DevelopmentTournamentMediaRepository } from "@/features/tournament-media/infrastructure/development-tournament-media-repository"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"
import { getDevelopmentTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/development-tournament-operations-repository"

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]/media">,
) {
  const { id } = await context.params
  const tournaments = await getDevelopmentTournamentOperationsRepository()
  const storage = new SupabaseObjectStorage()
  const media = new DevelopmentTournamentMediaRepository()

  return handleTournamentMediaUpload(request, id, {
    actorProvider: createNextCookieCurrentActorProvider(),
    upload: (input, actor) =>
      uploadTournamentMedia(input, actor, {
        storage,
        media,
        tournaments,
        createId: randomUUID,
      }),
  })
}
