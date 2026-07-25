import { describe, expect, it, vi } from "vitest"

import { deleteTournamentMedia } from "@/features/tournament-media/application/delete-tournament-media"

describe("deleteTournamentMedia", () => {
  it("removes an owned document and retires its metadata", async () => {
    const storage = { remove: vi.fn() }
    const media = {
      findActiveAsset: vi.fn(async () => ({
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
      })),
      retireAsset: vi.fn(),
      appendAuditEvent: vi.fn(),
    }

    await deleteTournamentMedia(
      { tournamentId: "tournament-1", assetId: "asset-1" },
      { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" },
      {
        storage,
        media,
        tournaments: {
          findById: vi.fn(async () => ({ organizerId: "organizer-1" })),
        },
      },
    )

    expect(storage.remove).toHaveBeenCalledWith(
      "tournament-documents",
      "tournaments/tournament-1/documents/asset-1.pdf",
    )
    expect(media.retireAsset).toHaveBeenCalledWith("asset-1")
  })
})
