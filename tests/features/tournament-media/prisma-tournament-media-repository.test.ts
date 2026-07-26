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
  return {
    mediaAsset: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  }
}

describe("PrismaTournamentMediaRepository", () => {
  it("maps created media dates to ISO strings", async () => {
    const prisma = createPrismaMock()
    prisma.mediaAsset.create.mockResolvedValue(mediaRow)
    const repository = new PrismaTournamentMediaRepository(
      prisma as unknown as PrismaClient,
    )

    const created = await repository.createAsset({
      id: mediaRow.id,
      tournamentId: mediaRow.tournamentId,
      kind: mediaRow.kind,
      bucket: mediaRow.bucket,
      objectPath: mediaRow.objectPath,
      fileName: mediaRow.fileName,
      contentType: mediaRow.contentType,
      byteSize: mediaRow.byteSize,
      createdById: mediaRow.createdById,
    })

    expect(prisma.mediaAsset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: "asset-1", kind: "POSTER" }),
    })
    expect(created.createdAt).toBe("2026-07-26T01:00:00.000Z")
    expect(created.deletedAt).toBeNull()
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

  it("soft-deletes media metadata", async () => {
    const prisma = createPrismaMock()
    prisma.mediaAsset.update.mockResolvedValue({
      ...mediaRow,
      deletedAt: new Date(),
    })
    const repository = new PrismaTournamentMediaRepository(
      prisma as unknown as PrismaClient,
    )

    await repository.retireAsset("asset-1")

    expect(prisma.mediaAsset.update).toHaveBeenCalledWith({
      where: { id: "asset-1" },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it("records media audit events with the required entity type", async () => {
    const prisma = createPrismaMock()
    prisma.auditLog.create.mockResolvedValue({})
    const repository = new PrismaTournamentMediaRepository(
      prisma as unknown as PrismaClient,
    )

    await repository.appendAuditEvent({
      actorId: "organizer-1",
      tournamentId: "tournament-1",
      action: "media.uploaded",
      entityId: "asset-1",
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: "organizer-1",
        tournamentId: "tournament-1",
        action: "media.uploaded",
        entityType: "MediaAsset",
        entityId: "asset-1",
      },
    })
  })
})
