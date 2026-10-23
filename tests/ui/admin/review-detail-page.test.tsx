/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ app/(admin)/layout.tsx, app/(admin)/admin/reviews/[id]/page.tsx โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { Actor } from "@/features/identity/domain/actor"

import AdminLayout from "@/app/(admin)/layout"
import AdminReviewDetailPage from "@/app/(admin)/admin/reviews/[id]/page"

const mocks = vi.hoisted(() => ({
  listActiveAssets: vi.fn(async () => [
    {
      id: "poster-1",
      kind: "POSTER" as const,
      bucket: "tournament-posters",
      objectPath: "tournaments/tournament-submitted/poster.webp",
    },
    {
      id: "document-1",
      kind: "DOCUMENT" as const,
      fileName: "competition-rules.pdf",
      byteSize: 120_000,
    },
  ]),
  getPublicUrl: vi.fn(() => "https://example.test/poster.webp"),
  createSignedUrl: vi.fn(),
  getCurrentActor: vi.fn<() => Promise<Actor | null>>(async () => ({
    id: "admin-1",
    role: "PLATFORM_ADMIN" as const,
    email: "admin@example.com",
    displayName: "Admin",
  })),
  findById: vi.fn(async () => ({
    id: "tournament-submitted",
    title: "Submitted Court Cup",
    organizerId: "organizer-1",
    organizerName: "ผู้จัดการแข่งขัน 1",
    description: "รายละเอียดการแข่งขัน",
    rules: "กติกาการแข่งขัน",
    province: "กรุงเทพมหานคร",
    venue: "สนามกลาง",
    format: "FIVE_V_FIVE" as const,
    ageGroup: "Open",
    startsAt: "2026-11-15T02:00:00.000Z",
    endsAt: "2026-11-16T11:00:00.000Z",
    registrationDeadline: "2026-11-01T16:59:00.000Z",
    capacity: 16,
    status: "SUBMITTED" as const,
    governanceStatus: "ACTIVE" as const,
    governanceReason: null,
    governanceUpdatedAt: null,
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  })),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: () => { throw new Error("NEXT_NOT_FOUND") },
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("@/features/tournament-media/infrastructure/get-tournament-media-repository", () => ({
  getTournamentMediaRepository: async () => ({
    listActiveAssets: mocks.listActiveAssets,
  }),
}))

vi.mock("@/features/tournament-media/infrastructure/supabase-object-storage", () => ({
  SupabaseObjectStorage: class {
    getPublicUrl = mocks.getPublicUrl
    createSignedUrl = mocks.createSignedUrl
  },
}))

vi.mock(
  "@/features/identity/infrastructure/next-cookie-current-actor-provider",
  () => ({
    createNextCookieCurrentActorProvider: () => ({
      getCurrentActor: mocks.getCurrentActor,
    }),
  }),
)

vi.mock(
  "@/features/tournament-operations/infrastructure/get-tournament-operations-repository",
  () => ({
    getTournamentOperationsRepository: async () => ({
      findById: mocks.findById,
    }),
  }),
)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminReviewDetailPage", () => {
  it("shows the submitted poster and stable document link without signing on page load", async () => {
    const page = await AdminReviewDetailPage({ searchParams: Promise.resolve({}),
      params: Promise.resolve({ id: "tournament-submitted" }),
    })

    render(page)

    expect(screen.getByRole("img", { name: "โปสเตอร์การแข่งขัน Submitted Court Cup" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "เปิดโปสเตอร์ขนาดเต็ม" }).getAttribute("href"))
      .toBe("https://example.test/poster.webp")
    expect(screen.getByRole("link", { name: "เปิด competition-rules.pdf" }).getAttribute("href"))
      .toBe("/api/admin/tournaments/tournament-submitted/media/document-1/open")
    expect(mocks.createSignedUrl).not.toHaveBeenCalled()
  })

  it("shows a clear empty state when the submitted tournament has no media", async () => {
    mocks.listActiveAssets.mockResolvedValueOnce([])

    render(await AdminReviewDetailPage({ searchParams: Promise.resolve({}), params: Promise.resolve({ id: "tournament-submitted" }) }))

    expect(screen.getByText("ยังไม่มีโปสเตอร์หรือเอกสารประกอบ")).toBeTruthy()
  })

  it("does not read media for someone who is not a platform admin", async () => {
    mocks.getCurrentActor.mockResolvedValueOnce(null)

    await expect(
      AdminReviewDetailPage({ searchParams: Promise.resolve({}), params: Promise.resolve({ id: "tournament-submitted" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(mocks.listActiveAssets).not.toHaveBeenCalled()
  })

  it("keeps one main landmark when composed with the admin layout", async () => {
    const page = await AdminReviewDetailPage({ searchParams: Promise.resolve({}),
      params: Promise.resolve({ id: "tournament-submitted" }),
    })
    const layout = await AdminLayout({ children: page })

    render(layout)

    expect(screen.getAllByRole("main")).toHaveLength(1)
  })
})
