/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { afterEach, describe, expect, it, vi } from "vitest"
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentMediaAsset } from "@/features/tournament-media/domain/media-asset"

const mocks = vi.hoisted(() => ({
  getCurrentActor: vi.fn<() => Promise<Actor | null>>(async () => ({ id: "admin-1", role: "PLATFORM_ADMIN", email: "admin@example.test", displayName: "Admin" })),
  findActiveAsset: vi.fn<() => Promise<TournamentMediaAsset | null>>(async () => ({
    id: "document-1",
    tournamentId: "tournament-1",
    kind: "DOCUMENT",
    bucket: "tournament-documents",
    objectPath: "tournaments/tournament-1/document.pdf",
    fileName: "document.pdf", contentType: "application/pdf", byteSize: 100,
    createdById: "organizer-1", createdAt: "2026-01-01T00:00:00Z", deletedAt: null,
  })),
  createSignedUrl: vi.fn(async () => "https://example.test/document.pdf?token=fresh"),
}))

vi.mock("@/features/identity/infrastructure/next-cookie-current-actor-provider", () => ({
  createNextCookieCurrentActorProvider: () => ({ getCurrentActor: mocks.getCurrentActor }),
}))
vi.mock("@/features/tournament-media/infrastructure/get-tournament-media-repository", () => ({
  getTournamentMediaRepository: async () => ({ findActiveAsset: mocks.findActiveAsset }),
}))
vi.mock("@/features/tournament-media/infrastructure/supabase-object-storage", () => ({
  SupabaseObjectStorage: class {
    createSignedUrl = mocks.createSignedUrl
  },
}))

import { GET } from "@/app/api/admin/tournaments/[id]/media/[assetId]/open/route"

function openDocument() {
  return GET(
    new Request("http://localhost/api/admin/tournaments/tournament-1/media/document-1/open"),
    { params: Promise.resolve({ id: "tournament-1", assetId: "document-1" }) },
  )
}

afterEach(() => vi.clearAllMocks())

describe("GET admin review document", () => {
  it("redirects an admin to a fresh file URL without caching the redirect", async () => {
    const response = await openDocument()

    expect(response.status).toBe(302)
    expect(response.headers.get("location")).toBe("https://example.test/document.pdf?token=fresh")
    expect(response.headers.get("cache-control")).toBe("private, no-store")
    expect(mocks.createSignedUrl).toHaveBeenCalledOnce()
  })

  it("renews the destination each time the same permanent application link is opened", async () => {
    mocks.createSignedUrl
      .mockResolvedValueOnce("https://example.test/document.pdf?token=first")
      .mockResolvedValueOnce("https://example.test/document.pdf?token=second")

    const first = await openDocument()
    const second = await openDocument()

    expect(first.headers.get("location")).toContain("token=first")
    expect(second.headers.get("location")).toContain("token=second")
    expect(mocks.createSignedUrl).toHaveBeenCalledTimes(2)
  })

  it("returns 401 without creating a file URL when logged out", async () => {
    mocks.getCurrentActor.mockResolvedValueOnce(null)

    const response = await openDocument()

    expect(response.status).toBe(401)
    expect(mocks.findActiveAsset).not.toHaveBeenCalled()
    expect(mocks.createSignedUrl).not.toHaveBeenCalled()
  })

  it("returns 403 without reading files for a non-admin", async () => {
    mocks.getCurrentActor.mockResolvedValueOnce({ id: "organizer-1", role: "TOURNAMENT_ORGANIZER", email: "organizer@example.test", displayName: "Organizer" })

    const response = await openDocument()

    expect(response.status).toBe(403)
    expect(mocks.findActiveAsset).not.toHaveBeenCalled()
  })

  it("returns 404 for a missing or retired document", async () => {
    mocks.findActiveAsset.mockResolvedValueOnce(null)

    const response = await openDocument()

    expect(response.status).toBe(404)
    expect(mocks.createSignedUrl).not.toHaveBeenCalled()
  })
})
