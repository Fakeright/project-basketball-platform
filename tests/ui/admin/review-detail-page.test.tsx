import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import AdminLayout from "@/app/(admin)/layout"
import AdminReviewDetailPage from "@/app/(admin)/admin/reviews/[id]/page"

const mocks = vi.hoisted(() => ({
  getCurrentActor: vi.fn(async () => ({
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
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  })),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
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
  it("keeps one main landmark when composed with the admin layout", async () => {
    const page = await AdminReviewDetailPage({
      params: Promise.resolve({ id: "tournament-submitted" }),
    })
    const layout = await AdminLayout({ children: page })

    render(layout)

    expect(screen.getAllByRole("main")).toHaveLength(1)
  })
})
