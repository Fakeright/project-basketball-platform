import { describe, expect, it, vi } from "vitest"

import { getPublicTournamentMedia } from "@/features/tournament-media/application/get-public-tournament-media"
import type { TournamentMediaRepository } from "@/features/tournament-media/application/ports/tournament-media-repository"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"

const poster = {
  id: "poster-1",
  tournamentId: "tournament-1",
  kind: "POSTER" as const,
  bucket: "tournament-posters",
  objectPath: "tournaments/tournament-1/poster/poster-1.webp",
  fileName: "poster.webp",
  contentType: "image/webp",
  byteSize: 4_000,
  createdById: "organizer-1",
  createdAt: "2026-01-01T00:00:00Z",
  deletedAt: null,
}

const document = {
  ...poster,
  id: "document-1",
  kind: "DOCUMENT" as const,
  bucket: "tournament-documents",
  objectPath: "tournaments/tournament-1/documents/document-1.pdf",
  fileName: "competition-rules.pdf",
  contentType: "application/pdf",
}

function tournament(
  status: TournamentOperation["status"],
  governanceStatus: TournamentOperation["governanceStatus"] = "ACTIVE",
): TournamentOperation {
  return {
    id: "tournament-1",
    organizerId: "organizer-1",
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
    status,
    governanceStatus,
    governanceReason: null,
    governanceUpdatedAt: null,
    version: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  }
}

function dependencies() {
  const media: TournamentMediaRepository = {
    commitUpload: vi.fn(),
    retireWithAudit: vi.fn(),
    findActivePoster: vi.fn(),
    findActiveAsset: vi.fn(),
    listActiveAssets: vi.fn(async () => [poster, document]),
    hasActiveAssetOfKind: vi.fn(),
  }
  const storage: ObjectStorage = {
    upload: vi.fn(),
    move: vi.fn(),
    remove: vi.fn(),
    getPublicUrl: vi.fn(() => "https://example.test/poster.webp"),
    createSignedUrl: vi.fn(async () => "https://example.test/document.pdf?token=signed"),
  }
  return { media, storage }
}

describe("getPublicTournamentMedia", () => {
  it("creates document links only for a published tournament", async () => {
    const services = dependencies()

    const media = await getPublicTournamentMedia(tournament("PUBLISHED"), services)

    expect(media.posterUrl).toBe("https://example.test/poster.webp")
    expect(media.documents).toEqual([
      expect.objectContaining({ fileName: "competition-rules.pdf", url: expect.stringContaining("token=") }),
    ])
  })

  it("does not expose document links for a submitted tournament", async () => {
    const services = dependencies()

    const media = await getPublicTournamentMedia(tournament("SUBMITTED"), services)

    expect(media.documents).toEqual([])
    expect(services.storage.createSignedUrl).not.toHaveBeenCalled()
  })

  it.each(["SUSPENDED", "REMOVED"] as const)(
    "does not expose any media links when governance is %s",
    async (governanceStatus) => {
      const services = dependencies()

      const media = await getPublicTournamentMedia(
        tournament("PUBLISHED", governanceStatus),
        services,
      )

      expect(media).toEqual({ posterUrl: undefined, documents: [] })
      expect(services.media.listActiveAssets).not.toHaveBeenCalled()
      expect(services.storage.getPublicUrl).not.toHaveBeenCalled()
      expect(services.storage.createSignedUrl).not.toHaveBeenCalled()
    },
  )
})
