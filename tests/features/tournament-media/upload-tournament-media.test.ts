import { describe, expect, it, vi } from "vitest"

import { uploadTournamentMedia } from "@/features/tournament-media/application/upload-tournament-media"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"
import type { TournamentMediaRepository } from "@/features/tournament-media/application/ports/tournament-media-repository"
import type { TournamentMediaAsset } from "@/features/tournament-media/domain/media-asset"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")

const tournament: TournamentOperation = {
  id: "tournament-1",
  organizerId: organizer.id,
  title: "Chiang Rai Cup",
  description: "Community competition",
  rules: "Standard rules",
  provinceCode: "57",
  province: "เชียงราย",
  venue: "Central Stadium",
  format: "FIVE_V_FIVE",
  ageGroup: "Open",
  startsAt: "2026-12-10T09:00:00+07:00",
  endsAt: "2026-12-11T18:00:00+07:00",
  registrationDeadline: "2026-12-01T23:59:00+07:00",
  capacity: 16,
  status: "DRAFT",
  governanceStatus: "ACTIVE",
  governanceReason: null,
  governanceUpdatedAt: null,
  version: 0,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
}

const oldPoster: TournamentMediaAsset = {
  id: "asset-old",
  tournamentId: tournament.id,
  kind: "POSTER",
  bucket: "tournament-posters",
  objectPath: "tournaments/tournament-1/poster/asset-old.webp",
  fileName: "old.webp",
  contentType: "image/webp",
  byteSize: 2_000,
  createdById: organizer.id,
  createdAt: "2026-01-01T00:00:00Z",
  deletedAt: null,
}

function createDependencies(
  overrides: {
    commitUpload?: TournamentMediaRepository["commitUpload"]
    remove?: ObjectStorage["remove"]
    governanceStatus?: TournamentOperation["governanceStatus"]
  } = {},
) {
  const storage: ObjectStorage = {
    upload: vi.fn(),
    move: vi.fn(),
    remove: overrides.remove ?? vi.fn(),
    getPublicUrl: vi.fn(),
    createSignedUrl: vi.fn(),
  }
  const media: TournamentMediaRepository = {
    commitUpload:
      overrides.commitUpload ??
      vi.fn(async ({ asset }) => ({
        asset: {
          ...asset,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        },
        retiredAsset: null,
      })),
    retireWithAudit: vi.fn(),
    findActivePoster: vi.fn(async () => null),
    findActiveAsset: vi.fn(async () => null),
    listActiveAssets: vi.fn(async () => []),
    hasActiveAssetOfKind: vi.fn(async () => false),
  }
  return {
    storage,
    media,
    tournaments: {
      findById: vi.fn(async () => ({
        ...tournament,
        governanceStatus: overrides.governanceStatus ?? "ACTIVE",
      })),
    },
    createId: vi.fn(() => "asset-new"),
    cleanupLogger: { error: vi.fn() },
  }
}

const posterInput = {
  tournamentId: tournament.id,
  kind: "POSTER" as const,
  file: {
    fileName: "poster.webp",
    contentType: "image/webp",
    byteSize: 4_000,
    data: new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42,
      0x50,
    ]),
  },
}

describe("uploadTournamentMedia", () => {
  it("commits poster metadata and audit atomically before cleaning up the previous object", async () => {
    const commitUpload = vi.fn(async ({ asset }) => ({
      asset: {
        ...asset,
        createdAt: "2026-01-02T00:00:00Z",
        deletedAt: null,
      },
      retiredAsset: oldPoster,
    }))
    const dependencies = createDependencies({ commitUpload })

    await uploadTournamentMedia(posterInput, organizer, dependencies)

    expect(commitUpload).toHaveBeenCalledWith({
      asset: expect.objectContaining({
        id: "asset-new",
        kind: "POSTER",
      }),
      actorId: organizer.id,
      adminOverride: false,
    })
    expect(dependencies.storage.remove).toHaveBeenCalledWith(
      oldPoster.bucket,
      oldPoster.objectPath,
    )
    expect(commitUpload.mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(dependencies.storage.remove).mock.invocationCallOrder[0],
    )
  })

  it("removes the uploaded object when the metadata transaction fails", async () => {
    const dependencies = createDependencies({
      commitUpload: vi.fn(async () => {
        throw new Error("DATABASE_UNAVAILABLE")
      }),
    })

    await expect(
      uploadTournamentMedia(posterInput, organizer, dependencies),
    ).rejects.toThrow("DATABASE_UNAVAILABLE")
    expect(dependencies.storage.remove).toHaveBeenCalledWith(
      "tournament-posters",
      "tournaments/tournament-1/poster/asset-new.webp",
    )
  })

  it("preserves the database failure and safely reports failed compensation", async () => {
    const dependencies = createDependencies({
      commitUpload: vi.fn(async () => {
        throw new Error("DATABASE_UNAVAILABLE")
      }),
      remove: vi.fn(async () => {
        throw new Error("secret storage detail")
      }),
    })

    await expect(
      uploadTournamentMedia(posterInput, organizer, dependencies),
    ).rejects.toThrow("DATABASE_UNAVAILABLE")
    expect(dependencies.cleanupLogger.error).toHaveBeenCalledWith({
      operation: "media.upload.compensate",
      assetId: "asset-new",
      errorType: "Error",
    })
    expect(
      JSON.stringify(dependencies.cleanupLogger.error.mock.calls),
    ).not.toContain("secret storage detail")
  })

  it("rejects spoofed MIME bytes before uploading to storage", async () => {
    const dependencies = createDependencies()

    await expect(
      uploadTournamentMedia(
        {
          ...posterInput,
          file: {
            ...posterInput.file,
            data: new Uint8Array([0x47, 0x49, 0x46, 0x38]),
          },
        },
        organizer,
        dependencies,
      ),
    ).rejects.toThrow("MEDIA_FILE_CONTENT_INVALID")
    expect(dependencies.storage.upload).not.toHaveBeenCalled()
  })

  it.each([
    ["SUSPENDED", "TOURNAMENT_SUSPENDED"],
    ["REMOVED", "TOURNAMENT_REMOVED"],
  ] as const)(
    "blocks upload when governance is %s before touching storage",
    async (governanceStatus, issue) => {
      const dependencies = createDependencies({ governanceStatus })

      await expect(
        uploadTournamentMedia(posterInput, organizer, dependencies),
      ).rejects.toMatchObject({ issues: [issue] })
      expect(dependencies.storage.upload).not.toHaveBeenCalled()
      expect(dependencies.media.commitUpload).not.toHaveBeenCalled()
    },
  )
})
