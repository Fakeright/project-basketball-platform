/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจสิทธิ์ก่อนนำสื่อออกจากรายการและจัดการไฟล์ใน storage ตามเงื่อนไข
 * เรียกใช้จาก: app/api/admin/tournaments/[id]/media/[assetId]/route.ts
 * ตามการทำงานต่อ: features/tournament-media/application/ports/object-storage.ts, features/tournament-media/application/media-cleanup.ts, features/tournament-media/application/authorize-tournament-media.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

import {
  ObjectStorageError,
  type ObjectStorage,
} from "./ports/object-storage"
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

// ตรวจสิทธิ์และความสัมพันธ์ของ asset กับรายการก่อนนำสื่อออก
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
  const retirement = {
    actorId: actor.id,
    tournamentId: input.tournamentId,
    assetId: asset.id,
    adminOverride:
      actor.role === "PLATFORM_ADMIN" &&
      actor.id !== tournament.organizerId,
  }
  try {
    await dependencies.storage.move(
      asset.bucket,
      asset.objectPath,
      stagedObjectPath,
    )
  } catch (error) {
    if (
      error instanceof ObjectStorageError &&
      error.code === "NOT_FOUND"
    ) {
      await dependencies.media.retireWithAudit(retirement)
      return
    }
    throw error
  }

  try {
    await dependencies.media.retireWithAudit(retirement)
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
    if (
      cleanupError instanceof ObjectStorageError &&
      cleanupError.code === "NOT_FOUND"
    ) {
      return
    }
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
