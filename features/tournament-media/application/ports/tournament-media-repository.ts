import type {
  MediaAssetKind,
  TournamentMediaAsset,
} from "@/features/tournament-media/domain/media-asset"

export interface TournamentMediaRepository {
  createAsset(
    asset: Omit<TournamentMediaAsset, "createdAt" | "deletedAt">,
  ): Promise<TournamentMediaAsset>
  findActivePoster(tournamentId: string): Promise<TournamentMediaAsset | null>
  findActiveAsset(
    tournamentId: string,
    assetId: string,
  ): Promise<TournamentMediaAsset | null>
  listActiveAssets(tournamentId: string): Promise<TournamentMediaAsset[]>
  retireAsset(assetId: string): Promise<void>
  appendAuditEvent(input: {
    actorId: string
    tournamentId: string
    action: "media.uploaded" | "media.replaced" | "media.deleted"
    entityId: string
  }): Promise<void>
  hasActiveAssetOfKind(
    tournamentId: string,
    kind: MediaAssetKind,
  ): Promise<boolean>
}
