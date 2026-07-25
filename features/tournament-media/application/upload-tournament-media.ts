import type { Actor } from "@/features/identity/domain/actor"
import { authorize } from "@/features/identity/application/authorize"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"
import type { MediaAssetKind, TournamentMediaAsset } from "@/features/tournament-media/domain/media-asset"
import { validateMediaFile } from "@/features/tournament-media/domain/media-policy"

import type { ObjectStorage } from "./ports/object-storage"
import type { TournamentMediaRepository } from "./ports/tournament-media-repository"

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
  const previousPoster =
    input.kind === "POSTER"
      ? await dependencies.media.findActivePoster(input.tournamentId)
      : null

  await dependencies.storage.upload({
    bucket,
    objectPath,
    contentType: input.file.contentType,
    data: input.file.data,
  })

  let asset: TournamentMediaAsset
  try {
    asset = await dependencies.media.createAsset({
      id: assetId,
      tournamentId: input.tournamentId,
      kind: input.kind,
      bucket,
      objectPath,
      fileName: input.file.fileName,
      contentType: input.file.contentType,
      byteSize: input.file.byteSize,
      createdById: actor.id,
    })
  } catch (error) {
    await dependencies.storage.remove(bucket, objectPath)
    throw error
  }

  if (previousPoster) {
    await dependencies.storage.remove(
      previousPoster.bucket,
      previousPoster.objectPath,
    )
    await dependencies.media.retireAsset(previousPoster.id)
    await dependencies.media.appendAuditEvent({
      actorId: actor.id,
      tournamentId: input.tournamentId,
      action: "media.replaced",
      entityId: asset.id,
    })
  } else {
    await dependencies.media.appendAuditEvent({
      actorId: actor.id,
      tournamentId: input.tournamentId,
      action: "media.uploaded",
      entityId: asset.id,
    })
  }

  return asset
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
