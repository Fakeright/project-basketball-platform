import type {
  MediaAsset,
  PrismaClient,
} from "@/lib/generated/prisma/client"
import type { TournamentMediaRepository } from "@/features/tournament-media/application/ports/tournament-media-repository"
import type {
  MediaAssetKind,
  TournamentMediaAsset,
} from "@/features/tournament-media/domain/media-asset"

export class PrismaTournamentMediaRepository
  implements TournamentMediaRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async createAsset(
    asset: Omit<TournamentMediaAsset, "createdAt" | "deletedAt">,
  ) {
    const created = await this.prisma.mediaAsset.create({ data: asset })
    return mapMediaAsset(created)
  }

  async findActivePoster(tournamentId: string) {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { tournamentId, kind: "POSTER", deletedAt: null },
      orderBy: { createdAt: "desc" },
    })
    return asset ? mapMediaAsset(asset) : null
  }

  async findActiveAsset(tournamentId: string, assetId: string) {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { id: assetId, tournamentId, deletedAt: null },
    })
    return asset ? mapMediaAsset(asset) : null
  }

  async listActiveAssets(tournamentId: string) {
    const assets = await this.prisma.mediaAsset.findMany({
      where: { tournamentId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    })
    return assets.map(mapMediaAsset)
  }

  async retireAsset(assetId: string) {
    try {
      await this.prisma.mediaAsset.update({
        where: { id: assetId },
        data: { deletedAt: new Date() },
      })
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new Error("MEDIA_ASSET_NOT_FOUND")
      }
      throw error
    }
  }

  async appendAuditEvent(
    input: Parameters<TournamentMediaRepository["appendAuditEvent"]>[0],
  ) {
    await this.prisma.auditLog.create({
      data: {
        ...input,
        entityType: "MediaAsset",
      },
    })
  }

  async hasActiveAssetOfKind(
    tournamentId: string,
    kind: MediaAssetKind,
  ) {
    const count = await this.prisma.mediaAsset.count({
      where: { tournamentId, kind, deletedAt: null },
    })
    return count > 0
  }
}

function mapMediaAsset(asset: MediaAsset): TournamentMediaAsset {
  return {
    id: asset.id,
    tournamentId: asset.tournamentId,
    kind: asset.kind,
    bucket: asset.bucket,
    objectPath: asset.objectPath,
    fileName: asset.fileName,
    contentType: asset.contentType,
    byteSize: asset.byteSize,
    createdById: asset.createdById,
    createdAt: asset.createdAt.toISOString(),
    deletedAt: asset.deletedAt?.toISOString() ?? null,
  }
}

function isPrismaNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  )
}
