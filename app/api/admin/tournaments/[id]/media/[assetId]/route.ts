import { handleTournamentMediaDelete } from "@/features/admin/presentation/tournament-media-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"
import { deleteTournamentMedia } from "@/features/tournament-media/application/delete-tournament-media"
import { getTournamentMediaRepository } from "@/features/tournament-media/infrastructure/get-tournament-media-repository"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]/media/[assetId]">,
) {
  return withSafeRouteBoundary("tournament.media.delete", async () => {
    const { id, assetId } = await context.params
    const tournaments = await getTournamentOperationsRepository()
    const storage = new SupabaseObjectStorage()
    const media = await getTournamentMediaRepository()

    return handleTournamentMediaDelete(id, assetId, {
      actorProvider: createNextCookieCurrentActorProvider(),
      remove: (input, actor) =>
        deleteTournamentMedia(input, actor, { storage, media, tournaments }),
    })
  })
}
