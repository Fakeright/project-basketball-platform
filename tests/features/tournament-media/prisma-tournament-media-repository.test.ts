import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaTournamentMediaRepository } from "@/features/tournament-media/infrastructure/prisma-tournament-media-repository"

const mediaRow = {
  id: "asset-1",
  tournamentId: "tournament-1",
  kind: "POSTER" as const,
  bucket: "tournament-posters",
  objectPath: "tournaments/tournament-1/poster/asset-1.webp",
  fileName: "poster.webp",
  contentType: "image/webp",
  byteSize: 4_000,
  createdById: "organizer-1",
  createdAt: new Date("2026-07-26T01:00:00.000Z"),
  deletedAt: null,
}

function createPrismaMock() {
  const prisma = {
    mediaAsset: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $queryRaw: vi.fn().mockResolvedValue([
      { id: "tournament-1", governanceStatus: "ACTIVE" },
    ]),
    $transaction: vi.fn(
      async (operation: (client: typeof prisma) => Promise<unknown>) =>
        operation(prisma),
    ),
  }
  return prisma
}

describe("PrismaTournamentMediaRepository", () => {
  it.each([
    {
      operation: "commit uploaded media",
      run: (repository: PrismaTournamentMediaRepository) =>
        repository.commitUpload({
          asset: {
            id: mediaRow.id,
            tournamentId: mediaRow.tournamentId,
            kind: mediaRow.kind,
            bucket: mediaRow.bucket,
            objectPath: mediaRow.objectPath,
            fileName: mediaRow.fileName,
            contentType: mediaRow.contentType,
            byteSize: mediaRow.byteSize,
            createdById: mediaRow.createdById,
          },
          actorId: "organizer-1",
          adminOverride: false,
        }),
    },
    {
      operation: "retire media",
      run: (repository: PrismaTournamentMediaRepository) =>
        repository.retireWithAudit({
          tournamentId: "tournament-1",
          assetId: "asset-1",
          actorId: "organizer-1",
          adminOverride: false,
        }),
    },
  ])(
    "locks and rechecks tournament governance before attempting to $operation",
    async ({ run }) => {
      const prisma = createPrismaMock()
      prisma.$queryRaw.mockResolvedValueOnce([
        { id: "tournament-1", governanceStatus: "SUSPENDED" },
      ])
      const repository = new PrismaTournamentMediaRepository(
        prisma as unknown as PrismaClient,
      )

      await expect(run(repository)).rejects.toMatchObject({
        issues: ["TOURNAMENT_SUSPENDED"],
      })

      expect(prisma.$queryRaw).toHaveBeenCalledOnce()
      const [lockQuery] = prisma.$queryRaw.mock.calls[0]
      expect(lockQuery.text).toContain('FROM "Tournament"')
      expect(lockQuery.text).toMatch(/\bFOR\s+UPDATE\b/i)
      expect(prisma.mediaAsset.create).not.toHaveBeenCalled()
      expect(prisma.mediaAsset.updateMany).not.toHaveBeenCalled()
      expect(prisma.auditLog.create).not.toHaveBeenCalled()
    },
  )

  it("retires the previous poster, creates the replacement, and audits in one transaction", async () => {
    const prisma = createPrismaMock()
    const oldPoster = { ...mediaRow, id: "asset-old" }
    prisma.mediaAsset.findFirst.mockResolvedValue(oldPoster)
    prisma.mediaAsset.updateMany.mockResolvedValue({ count: 1 })
    prisma.mediaAsset.create.mockResolvedValue(mediaRow)
    prisma.auditLog.create.mockResolvedValue({})
    const repository = new PrismaTournamentMediaRepository(
      prisma as unknown as PrismaClient,
    )

    const result = await repository.commitUpload({
      asset: {
        id: mediaRow.id,
        tournamentId: mediaRow.tournamentId,
        kind: mediaRow.kind,
        bucket: mediaRow.bucket,
        objectPath: mediaRow.objectPath,
        fileName: mediaRow.fileName,
        contentType: mediaRow.contentType,
        byteSize: mediaRow.byteSize,
        createdById: mediaRow.createdById,
      },
      actorId: "organizer-1",
      adminOverride: false,
    })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.mediaAsset.updateMany).toHaveBeenCalledWith({
      where: { id: "asset-old", deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    })
    expect(prisma.mediaAsset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: "asset-1", kind: "POSTER" }),
    })
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "media.replaced",
        beforeJson: expect.anything(),
        afterJson: expect.anything(),
      }),
    })
    expect(result.retiredAsset?.id).toBe("asset-old")
  })

  it("maps the active-poster unique constraint to a recoverable conflict", async () => {
    const prisma = createPrismaMock()
    prisma.mediaAsset.findFirst.mockResolvedValue(null)
    prisma.mediaAsset.create.mockRejectedValue(
      Object.assign(new Error("unique"), { code: "P2002" }),
    )
    const repository = new PrismaTournamentMediaRepository(
      prisma as unknown as PrismaClient,
    )

    await expect(
      repository.commitUpload({
        asset: {
          id: mediaRow.id,
          tournamentId: mediaRow.tournamentId,
          kind: mediaRow.kind,
          bucket: mediaRow.bucket,
          objectPath: mediaRow.objectPath,
          fileName: mediaRow.fileName,
          contentType: mediaRow.contentType,
          byteSize: mediaRow.byteSize,
          createdById: mediaRow.createdById,
        },
        actorId: "organizer-1",
        adminOverride: false,
      }),
    ).rejects.toThrow("MEDIA_POSTER_CONFLICT")
  })

  it("rolls back poster metadata when its audit write fails", async () => {
    let activeAssetIds = ["asset-old"]
    const oldPoster = { ...mediaRow, id: "asset-old" }
    const transactionClient = {
      $queryRaw: vi.fn(async () => [
        { id: "tournament-1", governanceStatus: "ACTIVE" },
      ]),
      mediaAsset: {
        findFirst: vi.fn(async () =>
          activeAssetIds.includes("asset-old") ? oldPoster : null,
        ),
        updateMany: vi.fn(async () => {
          activeAssetIds = activeAssetIds.filter((id) => id !== "asset-old")
          return { count: 1 }
        }),
        create: vi.fn(async () => {
          activeAssetIds.push("asset-1")
          return mediaRow
        }),
      },
      auditLog: {
        create: vi.fn(async () => {
          throw new Error("AUDIT_FAILED")
        }),
      },
    }
    const prisma = {
      $transaction: vi.fn(
        async (
          operation: (client: typeof transactionClient) => Promise<unknown>,
        ) => {
          const snapshot = [...activeAssetIds]
          try {
            return await operation(transactionClient)
          } catch (error) {
            activeAssetIds = snapshot
            throw error
          }
        },
      ),
    }
    const repository = new PrismaTournamentMediaRepository(
      prisma as unknown as PrismaClient,
    )

    await expect(
      repository.commitUpload({
        asset: {
          id: mediaRow.id,
          tournamentId: mediaRow.tournamentId,
          kind: mediaRow.kind,
          bucket: mediaRow.bucket,
          objectPath: mediaRow.objectPath,
          fileName: mediaRow.fileName,
          contentType: mediaRow.contentType,
          byteSize: mediaRow.byteSize,
          createdById: mediaRow.createdById,
        },
        actorId: "organizer-1",
        adminOverride: false,
      }),
    ).rejects.toThrow("AUDIT_FAILED")
    expect(activeAssetIds).toEqual(["asset-old"])
  })

  it("retires metadata and writes its audit in one transaction", async () => {
    const prisma = createPrismaMock()
    prisma.mediaAsset.findFirst.mockResolvedValue(mediaRow)
    prisma.mediaAsset.updateMany.mockResolvedValue({ count: 1 })
    prisma.auditLog.create.mockResolvedValue({})
    const repository = new PrismaTournamentMediaRepository(
      prisma as unknown as PrismaClient,
    )

    await repository.retireWithAudit({
      tournamentId: "tournament-1",
      assetId: "asset-1",
      actorId: "organizer-1",
      adminOverride: false,
    })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "media.deleted",
        beforeJson: expect.anything(),
        afterJson: expect.anything(),
      }),
    })
  })

  it("queries only active assets and returns the latest active poster", async () => {
    const prisma = createPrismaMock()
    prisma.mediaAsset.findFirst.mockResolvedValue(mediaRow)
    prisma.mediaAsset.findMany.mockResolvedValue([mediaRow])
    const repository = new PrismaTournamentMediaRepository(
      prisma as unknown as PrismaClient,
    )

    await repository.findActivePoster("tournament-1")
    const assets = await repository.listActiveAssets("tournament-1")

    expect(prisma.mediaAsset.findFirst).toHaveBeenCalledWith({
      where: {
        tournamentId: "tournament-1",
        kind: "POSTER",
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    })
    expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith({
      where: { tournamentId: "tournament-1", deletedAt: null },
      orderBy: { createdAt: "asc" },
    })
    expect(assets).toHaveLength(1)
  })
})
