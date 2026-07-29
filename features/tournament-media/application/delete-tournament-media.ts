import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

import type { ObjectStorage } from "./ports/object-storage"
import type { TournamentMediaRepository } from "./ports/tournament-media-repository"
import {
  reportMediaCleanupFailure,
  type MediaCleanupLogger,
} from "./media-cleanup"
import { authorizeTournamentMediaMutation } from "./authorize-tournament-media"

interface DeleteTournamentMediaDependencies {
  storage: Pick<ObjectStorage, "move" | "remove">
  media: Pick<TournamentMediaRepository, "findActiveAsset" | "retireWithAudit">
  tournaments: Pick<TournamentOperationsRepository, "findById">
  cleanupLogger?: MediaCleanupLogger
}

export async function deleteTournamentMedia(
  input: { tournamentId: string; assetId: string },
  actor: Actor,
  dependencies: DeleteTournamentMediaDependencies,
): Promise<void> {
  const tournament = await authorizeTournamentMediaMutation(
    input.tournamentId,
    actor,
    dependencies,
  )

  const asset = await dependencies.media.findActiveAsset(
    input.tournamentId,
    input.assetId,
  )
  if (!asset) throw new Error("MEDIA_ASSET_NOT_FOUND")

  const stagedObjectPath = buildStagedObjectPath(
    input.tournamentId,
    asset.id,
  )
  await dependencies.storage.move(
    asset.bucket,
    asset.objectPath,
    stagedObjectPath,
  )

  try {
    await dependencies.media.retireWithAudit({
      actorId: actor.id,
      tournamentId: input.tournamentId,
      assetId: asset.id,
      adminOverride:
        actor.role === "PLATFORM_ADMIN" &&
        actor.id !== tournament.organizerId,
    })
  } catch (error) {
    try {
      await dependencies.storage.move(
        asset.bucket,
        stagedObjectPath,
        asset.objectPath,
      )
    } catch (restoreError) {
      reportMediaCleanupFailure(
        "media.delete.restore",
        asset.id,
        restoreError,
        dependencies.cleanupLogger,
      )
    }
    throw error
  }

  try {
    await dependencies.storage.remove(asset.bucket, stagedObjectPath)
  } catch (cleanupError) {
    reportMediaCleanupFailure(
      "media.delete.cleanup",
      asset.id,
      cleanupError,
      dependencies.cleanupLogger,
    )
  }
}

function buildStagedObjectPath(tournamentId: string, assetId: string) {
  return `tournaments/${tournamentId}/.deleting/${assetId}`
}
