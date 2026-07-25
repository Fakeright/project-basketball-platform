import type { Actor } from "@/features/identity/domain/actor"
import { authorize } from "@/features/identity/application/authorize"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

import type { ObjectStorage } from "./ports/object-storage"
import type { TournamentMediaRepository } from "./ports/tournament-media-repository"

interface DeleteTournamentMediaDependencies {
  storage: Pick<ObjectStorage, "remove">
  media: Pick<
    TournamentMediaRepository,
    "findActiveAsset" | "retireAsset" | "appendAuditEvent"
  >
  tournaments: Pick<TournamentOperationsRepository, "findById">
}

export async function deleteTournamentMedia(
  input: { tournamentId: string; assetId: string },
  actor: Actor,
  dependencies: DeleteTournamentMediaDependencies,
): Promise<void> {
  const tournament = await dependencies.tournaments.findById(input.tournamentId)
  if (!tournament) throw new Error("NOT_FOUND")
  authorize(actor, "tournament.update", { organizerId: tournament.organizerId })

  const asset = await dependencies.media.findActiveAsset(
    input.tournamentId,
    input.assetId,
  )
  if (!asset) throw new Error("MEDIA_ASSET_NOT_FOUND")

  await dependencies.storage.remove(asset.bucket, asset.objectPath)
  await dependencies.media.retireAsset(asset.id)
  await dependencies.media.appendAuditEvent({
    actorId: actor.id,
    tournamentId: input.tournamentId,
    action: "media.deleted",
    entityId: asset.id,
  })
}
