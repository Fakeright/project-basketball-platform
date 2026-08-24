import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import AdminTournamentListPage from "@/app/(admin)/admin/tournaments/page"

const mocks = vi.hoisted(() => ({
  listForAdmin: vi.fn(async () => [
    {
      id: "tournament-1",
      title: "COURTSIDE Open",
      organizerId: "organizer-1",
      organizerName: "Organizer One",
      provinceCode: "10",
      province: "กรุงเทพมหานคร",
      venue: "Arena A",
      format: "FIVE_V_FIVE" as const,
      ageGroup: "Open",
      status: "IN_PROGRESS" as const,
      governanceStatus: "ACTIVE" as const,
      governanceReason: null,
      governanceUpdatedAt: null,
      version: 4,
      description: "Description",
      rules: "Rules",
      capacity: 8,
      startsAt: "2026-11-15T02:00:00.000Z",
      endsAt: "2026-11-16T11:00:00.000Z",
      registrationDeadline: "2026-11-01T16:59:00.000Z",
      createdAt: "2026-08-01T00:00:00.000Z",
      updatedAt: "2026-08-19T00:00:00.000Z",
    },
  ]),
}))

vi.mock("next/navigation", () => ({ notFound: vi.fn() }))
vi.mock(
  "@/features/identity/infrastructure/next-cookie-current-actor-provider",
  () => ({
    createNextCookieCurrentActorProvider: () => ({
      getCurrentActor: async () => ({
        id: "admin-1",
        role: "PLATFORM_ADMIN" as const,
        email: "admin@example.com",
        displayName: "Admin",
      }),
    }),
  }),
)
vi.mock(
  "@/features/tournament-operations/infrastructure/get-tournament-operations-repository",
  () => ({
    getTournamentOperationsRepository: async () => ({
      listForAdmin: mocks.listForAdmin,
    }),
  }),
)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminTournamentListPage", () => {
  it("forwards URL filters and links to tournament operations", async () => {
    render(
      await AdminTournamentListPage({
        searchParams: Promise.resolve({ q: "court", status: "IN_PROGRESS" }),
      }),
    )

    expect(mocks.listForAdmin).toHaveBeenCalledWith({
      query: "court",
      status: "IN_PROGRESS",
    })
    expect(screen.getByRole("link", { name: "เปิดข้อมูลรายการ" }).getAttribute("href"))
      .toBe("/admin/tournaments/tournament-1")
    expect(screen.getByRole("link", { name: "กำกับผล" }).getAttribute("href"))
      .toBe("/admin/tournaments/tournament-1/results")
  })
})
