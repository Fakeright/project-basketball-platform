import type {
  MediaAsset,
  Prisma,
  PrismaClient,
} from "@/lib/generated/prisma/client"
import type { TournamentMediaRepository } from "@/features/tournament-media/application/ports/tournament-media-repository"
import type {
  MediaAssetKind,
  TournamentMediaAsset,
} from "@/features/tournament-media/domain/media-asset"
import { lockActiveTournamentForMutation } from "@/features/tournament-operations/infrastructure/prisma-tournament-governance-lock"

export class PrismaTournamentMediaRepository
  implements TournamentMediaRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async commitUpload(input: {
    asset: Omit<TournamentMediaAsset, "createdAt" | "deletedAt">
    actorId: string
    adminOverride: boolean
  }) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        await lockActiveTournamentForMutation(
          transaction,
          input.asset.tournamentId,
        )
        const previousPoster =
          input.asset.kind === "POSTER"
            ? await transaction.mediaAsset.findFirst({
                where: {
                  tournamentId: input.asset.tournamentId,
                  kind: "POSTER",
                  deletedAt: null,
                },
                orderBy: { createdAt: "desc" },
              })
            : null

        if (previousPoster) {
          const retired = await transaction.mediaAsset.updateMany({
            where: { id: previousPoster.id, deletedAt: null },
            data: { deletedAt: new Date() },
          })
          if (retired.count !== 1) throw new Error("MEDIA_POSTER_CONFLICT")
        }

        const created = await transaction.mediaAsset.create({
          data: input.asset,
        })
        const after = mapMediaAsset(created)
        await appendMediaAudit(transaction, {
          actorId: input.actorId,
          tournamentId: input.asset.tournamentId,
          action: previousPoster ? "media.replaced" : "media.uploaded",
          entityId: created.id,
          before: previousPoster ? mapMediaAsset(previousPoster) : null,
          after,
          adminOverride: input.adminOverride,
        })
        return {
          asset: after,
          retiredAsset: previousPoster
            ? mapMediaAsset(previousPoster)
            : null,
        }
      })
    } catch (error) {
      if (isPrismaUniqueError(error) && input.asset.kind === "POSTER") {
        throw new Error("MEDIA_POSTER_CONFLICT")
      }
      throw error
    }
  }

  async retireWithAudit(input: {
    tournamentId: string
    assetId: string
    actorId: string
    adminOverride: boolean
  }) {
    return this.prisma.$transaction(async (transaction) => {
      await lockActiveTournamentForMutation(transaction, input.tournamentId)
      const current = await transaction.mediaAsset.findFirst({
        where: {
          id: input.assetId,
          tournamentId: input.tournamentId,
          deletedAt: null,
        },
      })
      if (!current) throw new Error("MEDIA_ASSET_NOT_FOUND")

      const deletedAt = new Date()
      const retired = await transaction.mediaAsset.updateMany({
        where: { id: current.id, deletedAt: null },
        data: { deletedAt },
      })
      if (retired.count !== 1) throw new Error("MEDIA_ASSET_NOT_FOUND")

      const before = mapMediaAsset(current)
      const after = { ...before, deletedAt: deletedAt.toISOString() }
      await appendMediaAudit(transaction, {
        actorId: input.actorId,
        tournamentId: input.tournamentId,
        action: "media.deleted",
        entityId: current.id,
        before,
        after,
        adminOverride: input.adminOverride,
      })
      return after
    })
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

async function appendMediaAudit(
  client: Pick<Prisma.TransactionClient, "auditLog">,
  input: {
    actorId: string
    tournamentId: string
    action: "media.uploaded" | "media.replaced" | "media.deleted"
    entityId: string
    before: TournamentMediaAsset | null
    after: TournamentMediaAsset
    adminOverride: boolean
  },
) {
  const data = {
    actorId: input.actorId,
    tournamentId: input.tournamentId,
    entityType: "MediaAsset",
    entityId: input.entityId,
    beforeJson: input.before ? toJsonValue(input.before) : undefined,
    afterJson: toJsonValue(input.after),
  }
  await client.auditLog.create({
    data: { ...data, action: input.action },
  })
  if (input.adminOverride) {
    await client.auditLog.create({
      data: { ...data, action: "media.admin_override" },
    })
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

function isPrismaUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}
