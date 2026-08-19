export const mediaAssetKinds = [
  "POSTER",
  "DOCUMENT",
  "BRACKET_DOCUMENT",
] as const

export type MediaAssetKind = (typeof mediaAssetKinds)[number]

export interface MediaFileDescriptor {
  fileName: string
  contentType: string
  byteSize: number
}

export interface TournamentMediaAsset extends MediaFileDescriptor {
  id: string
  tournamentId: string
  kind: MediaAssetKind
  bucket: string
  objectPath: string
  createdById: string
  createdAt: string
  deletedAt: string | null
}
