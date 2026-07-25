import { describe, expect, it, vi } from "vitest"

import { uploadTournamentMedia } from "@/features/tournament-media/application/upload-tournament-media"
import type { TournamentMediaRepository } from "@/features/tournament-media/application/ports/tournament-media-repository"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"

const organizer = { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" } as const

const tournament: TournamentOperation = {
  id: "tournament-1",
  organizerId: organizer.id,
  title: "Chiang Rai Cup",
  description: "Community competition",
  rules: "Standard rules",
  province: "Chiang Rai",
  venue: "Central Stadium",
  format: "FIVE_V_FIVE",
  ageGroup: "Open",
  startsAt: "2026-12-10T09:00:00+07:00",
  endsAt: "2026-12-11T18:00:00+07:00",
  registrationDeadline: "2026-12-01T23:59:00+07:00",
  capacity: 16,
  status: "DRAFT",
  version: 0,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
}

function createDependencies(overrides: Partial<TournamentMediaRepository> = {}) {
  const storage: ObjectStorage = {
    upload: vi.fn(),
    remove: vi.fn(),
    getPublicUrl: vi.fn(),
    createSignedUrl: vi.fn(),
  }
  const media: TournamentMediaRepository = {
    createAsset: vi.fn(async (asset) => ({ ...asset, createdAt: "2026-01-01T00:00:00Z", deletedAt: null })),
    findActivePoster: vi.fn(async () => null),
    findActiveAsset: vi.fn(async () => null),
    listActiveAssets: vi.fn(async () => []),
    retireAsset: vi.fn(),
    appendAuditEvent: vi.fn(),
    hasActiveAssetOfKind: vi.fn(async () => false),
    ...overrides,
  }
  return {
    storage,
    media,
    tournaments: { findById: vi.fn(async () => tournament) },
    createId: vi.fn(() => "asset-new"),
  }
}

const posterInput = {
  tournamentId: tournament.id,
  kind: "POSTER" as const,
  file: {
    fileName: "poster.webp",
    contentType: "image/webp",
    byteSize: 4_000,
    data: new Uint8Array([1, 2, 3]),
  },
}

describe("uploadTournamentMedia", () => {
  it("replaces an owned poster and removes its previous object", async () => {
    const dependencies = createDependencies({
      findActivePoster: vi.fn(async () => ({
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
      })),
    })

    await uploadTournamentMedia(posterInput, organizer, dependencies)

    expect(dependencies.storage.remove).toHaveBeenCalledWith(
      "tournament-posters",
      "tournaments/tournament-1/poster/asset-old.webp",
    )
    expect(dependencies.media.retireAsset).toHaveBeenCalledWith("asset-old")
  })

  it("removes the uploaded object when metadata persistence fails", async () => {
    const dependencies = createDependencies({
      createAsset: vi.fn(async () => {
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
})
