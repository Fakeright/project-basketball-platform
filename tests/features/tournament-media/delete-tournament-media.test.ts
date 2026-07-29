import { describe, expect, it, vi } from "vitest"

import { deleteTournamentMedia } from "@/features/tournament-media/application/delete-tournament-media"
import { ObjectStorageError } from "@/features/tournament-media/application/ports/object-storage"
import type { TournamentMediaAsset } from "@/features/tournament-media/domain/media-asset"

const asset: TournamentMediaAsset = {
  id: "asset-1",
  tournamentId: "tournament-1",
  kind: "DOCUMENT",
  bucket: "tournament-documents",
  objectPath: "tournaments/tournament-1/documents/asset-1.pdf",
  fileName: "rules.pdf",
  contentType: "application/pdf",
  byteSize: 100,
  createdById: "organizer-1",
  createdAt: "2026-01-01T00:00:00Z",
  deletedAt: null,
}

function createDependencies() {
  return {
    storage: {
      move: vi.fn(),
      remove: vi.fn(),
    },
    media: {
      findActiveAsset: vi.fn(async () => asset),
      retireWithAudit: vi.fn(async () => asset),
    },
    tournaments: {
      findById: vi.fn(async () => ({ organizerId: "organizer-1" })),
    },
    cleanupLogger: { error: vi.fn() },
  }
}

describe("deleteTournamentMedia", () => {
  it("stages an object before atomically retiring metadata and audit", async () => {
    const dependencies = createDependencies()

    await deleteTournamentMedia(
      { tournamentId: "tournament-1", assetId: "asset-1" },
      { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" },
      dependencies,
    )

    expect(dependencies.storage.move).toHaveBeenNthCalledWith(
      1,
      asset.bucket,
      asset.objectPath,
      "tournaments/tournament-1/.deleting/asset-1",
    )
    expect(dependencies.media.retireWithAudit).toHaveBeenCalledWith({
      tournamentId: "tournament-1",
      assetId: "asset-1",
      actorId: "organizer-1",
      adminOverride: false,
    })
    expect(dependencies.storage.remove).toHaveBeenCalledWith(
      asset.bucket,
      "tournaments/tournament-1/.deleting/asset-1",
    )
  })

  it("moves the staged object back when the metadata transaction fails", async () => {
    const dependencies = createDependencies()
    dependencies.media.retireWithAudit.mockRejectedValueOnce(
      new Error("AUDIT_FAILED"),
    )

    await expect(
      deleteTournamentMedia(
        { tournamentId: "tournament-1", assetId: "asset-1" },
        { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" },
        dependencies,
      ),
    ).rejects.toThrow("AUDIT_FAILED")

    expect(dependencies.storage.move).toHaveBeenNthCalledWith(
      2,
      asset.bucket,
      "tournaments/tournament-1/.deleting/asset-1",
      asset.objectPath,
    )
    expect(dependencies.storage.remove).not.toHaveBeenCalled()
  })

  it("keeps the successful metadata result when final object cleanup fails", async () => {
    const dependencies = createDependencies()
    dependencies.storage.remove.mockRejectedValueOnce(
      new Error("private storage detail"),
    )

    await expect(
      deleteTournamentMedia(
        { tournamentId: "tournament-1", assetId: "asset-1" },
        { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" },
        dependencies,
      ),
    ).resolves.toBeUndefined()
    expect(dependencies.cleanupLogger.error).toHaveBeenCalledWith({
      operation: "media.delete.cleanup",
      assetId: "asset-1",
      errorType: "Error",
    })
  })

  it("retires metadata and audit when the source object is already missing", async () => {
    const dependencies = createDependencies()
    dependencies.storage.move.mockRejectedValueOnce(
      new ObjectStorageError("NOT_FOUND"),
    )

    await expect(
      deleteTournamentMedia(
        { tournamentId: "tournament-1", assetId: "asset-1" },
        { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" },
        dependencies,
      ),
    ).resolves.toBeUndefined()

    expect(dependencies.media.retireWithAudit).toHaveBeenCalledWith({
      tournamentId: "tournament-1",
      assetId: "asset-1",
      actorId: "organizer-1",
      adminOverride: false,
    })
    expect(dependencies.storage.remove).not.toHaveBeenCalled()
  })

  it("preserves active metadata when object storage is unavailable", async () => {
    const dependencies = createDependencies()
    dependencies.storage.move.mockRejectedValueOnce(
      new ObjectStorageError("UNAVAILABLE"),
    )

    await expect(
      deleteTournamentMedia(
        { tournamentId: "tournament-1", assetId: "asset-1" },
        { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" },
        dependencies,
      ),
    ).rejects.toMatchObject({
      name: "ObjectStorageError",
      code: "UNAVAILABLE",
    })

    expect(dependencies.media.retireWithAudit).not.toHaveBeenCalled()
  })
})
