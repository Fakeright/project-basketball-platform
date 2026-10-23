/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ features/tournament-media/application/get-admin-review-media.ts โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { describe, expect, it, vi } from "vitest"

import {
  getAdminReviewDocumentUrl,
  getAdminReviewMedia,
} from "@/features/tournament-media/application/get-admin-review-media"
import { createTestActor } from "@/tests/fixtures/actor"
import type { TournamentMediaRepository } from "@/features/tournament-media/application/ports/tournament-media-repository"

const admin = createTestActor("admin-1", "PLATFORM_ADMIN")
const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const poster = {
  id: "poster-1",
  tournamentId: "tournament-1",
  kind: "POSTER" as const,
  bucket: "tournament-posters",
  objectPath: "tournaments/tournament-1/poster.webp",
  fileName: "poster.webp",
  contentType: "image/webp",
  byteSize: 2_000,
  createdById: "organizer-1",
  createdAt: "2026-01-01T00:00:00Z",
  deletedAt: null,
}
const document = {
  ...poster,
  id: "document-1",
  kind: "DOCUMENT" as const,
  bucket: "tournament-documents",
  objectPath: "tournaments/tournament-1/document.pdf",
  fileName: "rules.pdf",
  contentType: "application/pdf",
  byteSize: 120_000,
}

function dependencies() {
  return {
    media: {
      listActiveAssets: vi.fn(async () => [poster, document]),
      findActiveAsset: vi.fn<TournamentMediaRepository["findActiveAsset"]>(async () => document),
    },
    storage: {
      getPublicUrl: vi.fn(() => "https://example.test/poster.webp"),
      createSignedUrl: vi.fn(async () => "https://example.test/document.pdf?token=fresh"),
    },
  }
}

describe("admin review media", () => {
  it("lists poster and document metadata for a submitted tournament without signing documents", async () => {
    const services = dependencies()

    const media = await getAdminReviewMedia(
      { id: "tournament-1", status: "SUBMITTED" },
      admin,
      services,
    )

    expect(media).toEqual({
      posterUrl: "https://example.test/poster.webp",
      documents: [{ id: "document-1", fileName: "rules.pdf", byteSize: 120_000 }],
    })
    expect(services.storage.createSignedUrl).not.toHaveBeenCalled()
  })

  it("refuses non-admin and non-submitted reads before querying files", async () => {
    const services = dependencies()

    await expect(getAdminReviewMedia({ id: "tournament-1", status: "SUBMITTED" }, organizer, services))
      .rejects.toThrow("FORBIDDEN")
    await expect(getAdminReviewMedia({ id: "tournament-1", status: "DRAFT" }, admin, services))
      .rejects.toThrow("NOT_FOUND")
    expect(services.media.listActiveAssets).not.toHaveBeenCalled()
  })

  it("creates a fresh destination whenever an admin opens an active document", async () => {
    const services = dependencies()

    const url = await getAdminReviewDocumentUrl("tournament-1", "document-1", admin, services)

    expect(url).toBe("https://example.test/document.pdf?token=fresh")
    expect(services.media.findActiveAsset).toHaveBeenCalledWith("tournament-1", "document-1")
    expect(services.storage.createSignedUrl).toHaveBeenCalledWith(
      "tournament-documents",
      "tournaments/tournament-1/document.pdf",
      expect.any(Number),
    )
  })

  it("does not sign retired, unrelated, or non-document assets", async () => {
    const services = dependencies()
    services.media.findActiveAsset.mockResolvedValueOnce(null)
    await expect(getAdminReviewDocumentUrl("tournament-1", "missing", admin, services))
      .rejects.toThrow("NOT_FOUND")
    services.media.findActiveAsset.mockResolvedValueOnce(poster)
    await expect(getAdminReviewDocumentUrl("tournament-1", "poster-1", admin, services))
      .rejects.toThrow("NOT_FOUND")
    services.media.findActiveAsset.mockResolvedValueOnce({
      ...document,
      tournamentId: "tournament-2",
    })
    await expect(getAdminReviewDocumentUrl("tournament-1", "document-1", admin, services))
      .rejects.toThrow("NOT_FOUND")
    expect(services.storage.createSignedUrl).not.toHaveBeenCalled()
  })

  it("rejects a non-admin before looking up the document", async () => {
    const services = dependencies()

    await expect(getAdminReviewDocumentUrl("tournament-1", "document-1", organizer, services))
      .rejects.toThrow("FORBIDDEN")
    expect(services.media.findActiveAsset).not.toHaveBeenCalled()
  })
})
