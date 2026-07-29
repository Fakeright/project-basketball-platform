import type { Actor } from "@/features/identity/domain/actor"
import { authorize } from "@/features/identity/application/authorize"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"
import type { MediaAssetKind, TournamentMediaAsset } from "@/features/tournament-media/domain/media-asset"
import { validateMediaFile } from "@/features/tournament-media/domain/media-policy"

import type { ObjectStorage } from "./ports/object-storage"
import type { TournamentMediaRepository } from "./ports/tournament-media-repository"
import {
  reportMediaCleanupFailure,
  type MediaCleanupLogger,
} from "./media-cleanup"

export interface UploadTournamentMediaInput {
  tournamentId: string
  kind: MediaAssetKind
  file: {
    fileName: string
    contentType: string
    byteSize: number
    data: Uint8Array
  }
}

interface UploadTournamentMediaDependencies {
  storage: ObjectStorage
  media: TournamentMediaRepository
  tournaments: Pick<TournamentOperationsRepository, "findById">
  createId: () => string
  cleanupLogger?: MediaCleanupLogger
}

export async function uploadTournamentMedia(
  input: UploadTournamentMediaInput,
  actor: Actor,
  dependencies: UploadTournamentMediaDependencies,
): Promise<TournamentMediaAsset> {
  validateMediaFile({ kind: input.kind, ...input.file })
  const tournament = await dependencies.tournaments.findById(input.tournamentId)
  if (!tournament) throw new Error("NOT_FOUND")
  authorize(actor, "tournament.update", { organizerId: tournament.organizerId })

  const assetId = dependencies.createId()
  const bucket = input.kind === "POSTER" ? "tournament-posters" : "tournament-documents"
  const objectPath = buildObjectPath(input.tournamentId, input.kind, assetId, input.file.contentType)

  await dependencies.storage.upload({
    bucket,
    objectPath,
    contentType: input.file.contentType,
    data: input.file.data,
  })

  let result: Awaited<ReturnType<TournamentMediaRepository["commitUpload"]>>
  try {
    result = await dependencies.media.commitUpload({
      asset: {
        id: assetId,
        tournamentId: input.tournamentId,
        kind: input.kind,
        bucket,
        objectPath,
        fileName: input.file.fileName,
        contentType: input.file.contentType,
        byteSize: input.file.byteSize,
        createdById: actor.id,
      },
      actorId: actor.id,
      adminOverride:
        actor.role === "PLATFORM_ADMIN" &&
        actor.id !== tournament.organizerId,
    })
  } catch (error) {
    try {
      await dependencies.storage.remove(bucket, objectPath)
    } catch (cleanupError) {
      reportMediaCleanupFailure(
        "media.upload.compensate",
        assetId,
        cleanupError,
        dependencies.cleanupLogger,
      )
    }
    throw error
  }

  if (result.retiredAsset) {
    try {
      await dependencies.storage.remove(
        result.retiredAsset.bucket,
        result.retiredAsset.objectPath,
      )
    } catch (cleanupError) {
      reportMediaCleanupFailure(
        "media.upload.retired_object",
        result.retiredAsset.id,
        cleanupError,
        dependencies.cleanupLogger,
      )
    }
  }

  return result.asset
}

function buildObjectPath(
  tournamentId: string,
  kind: MediaAssetKind,
  assetId: string,
  contentType: string,
): string {
  const extensionByContentType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  }
  const directory = kind === "POSTER" ? "poster" : "documents"
  return `tournaments/${tournamentId}/${directory}/${assetId}.${extensionByContentType[contentType]}`
}
