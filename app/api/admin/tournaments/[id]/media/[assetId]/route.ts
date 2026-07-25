import { handleTournamentMediaDelete } from "@/features/admin/presentation/tournament-media-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { deleteTournamentMedia } from "@/features/tournament-media/application/delete-tournament-media"
import { DevelopmentTournamentMediaRepository } from "@/features/tournament-media/infrastructure/development-tournament-media-repository"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"
import { getDevelopmentTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/development-tournament-operations-repository"

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]/media/[assetId]">,
) {
  const { id, assetId } = await context.params
  const tournaments = await getDevelopmentTournamentOperationsRepository()
  const storage = new SupabaseObjectStorage()
  const media = new DevelopmentTournamentMediaRepository()

  return handleTournamentMediaDelete(id, assetId, {
    actorProvider: createNextCookieCurrentActorProvider(),
    remove: (input, actor) =>
      deleteTournamentMedia(input, actor, { storage, media, tournaments }),
  })
}
