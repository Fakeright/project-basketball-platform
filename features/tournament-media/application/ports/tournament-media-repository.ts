import type {
  MediaAssetKind,
  TournamentMediaAsset,
} from "@/features/tournament-media/domain/media-asset"

export interface TournamentMediaRepository {
  commitUpload(input: {
    asset: Omit<TournamentMediaAsset, "createdAt" | "deletedAt">
    actorId: string
    adminOverride: boolean
  }): Promise<{
    asset: TournamentMediaAsset
    retiredAsset: TournamentMediaAsset | null
  }>
  retireWithAudit(input: {
    tournamentId: string
    assetId: string
    actorId: string
    adminOverride: boolean
  }): Promise<TournamentMediaAsset>
  findActivePoster(tournamentId: string): Promise<TournamentMediaAsset | null>
  findActiveAsset(
    tournamentId: string,
    assetId: string,
  ): Promise<TournamentMediaAsset | null>
  listActiveAssets(tournamentId: string): Promise<TournamentMediaAsset[]>
  hasActiveAssetOfKind(
    tournamentId: string,
    kind: MediaAssetKind,
  ): Promise<boolean>
}
