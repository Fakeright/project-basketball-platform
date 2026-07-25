import type { TournamentMediaRepository } from "@/features/tournament-media/application/ports/tournament-media-repository"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"

export interface PublicDocumentLink {
  id: string
  fileName: string
  contentType: string
  byteSize: number
  url: string
}

export interface PublicTournamentMedia {
  posterUrl?: string
  documents: PublicDocumentLink[]
}

const visibleStatuses = new Set<TournamentOperation["status"]>([
  "PUBLISHED",
  "REGISTRATION_CLOSED",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
])

export async function getPublicTournamentMedia(
  tournament: Pick<TournamentOperation, "id" | "status">,
  dependencies: {
    media: TournamentMediaRepository
    storage: ObjectStorage
  },
): Promise<PublicTournamentMedia> {
  const assets = await dependencies.media.listActiveAssets(tournament.id)
  const poster = assets.find((asset) => asset.kind === "POSTER")
  const posterUrl = poster
    ? dependencies.storage.getPublicUrl(poster.bucket, poster.objectPath)
    : undefined

  if (!visibleStatuses.has(tournament.status)) {
    return { posterUrl, documents: [] }
  }

  const documents = await Promise.all(
    assets
      .filter((asset) => asset.kind === "DOCUMENT")
      .map(async (asset) => ({
        id: asset.id,
        fileName: asset.fileName,
        contentType: asset.contentType,
        byteSize: asset.byteSize,
        url: await dependencies.storage.createSignedUrl(
          asset.bucket,
          asset.objectPath,
          60 * 10,
        ),
      })),
  )

  return { posterUrl, documents }
}
