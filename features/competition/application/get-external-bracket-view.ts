import type { ExternalBracketRepository } from "./ports/external-bracket-repository"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"

export interface PublicExternalBracketView {
  tournamentId: string
  tournamentTitle: string
  tournamentSlug: string
  previewUrl: string
  fileName: string
  contentType: string
  byteSize: number
  revision: number
  publishedAt: string
}

export async function getExternalBracketView(
  slug: string,
  dependencies: {
    externalBrackets: ExternalBracketRepository
    storage: Pick<ObjectStorage, "createSignedUrl">
  },
): Promise<PublicExternalBracketView | null> {
  const source =
    await dependencies.externalBrackets.findPublicByTournamentSlug(slug)
  if (!source || !source.revision.publishedAt) return null

  const asset = source.revision.mediaAsset
  const previewUrl = await dependencies.storage.createSignedUrl(
    asset.bucket,
    asset.objectPath,
    600,
  )
  return {
    tournamentId: source.tournamentId,
    tournamentTitle: source.tournamentTitle,
    tournamentSlug: source.tournamentSlug,
    previewUrl,
    fileName: asset.fileName,
    contentType: asset.contentType,
    byteSize: asset.byteSize,
    revision: source.revision.revision,
    publishedAt: source.revision.publishedAt,
  }
}
