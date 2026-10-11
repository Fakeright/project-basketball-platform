import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import AdminLayout from "@/app/(admin)/layout"
import TournamentRegistrationsPage from "@/app/(admin)/organizer/tournaments/[id]/registrations/page"

const mocks = vi.hoisted(() => ({
  getCurrentActor: vi.fn(async () => ({
    id: "organizer-1",
    role: "TOURNAMENT_ORGANIZER" as const,
    email: "organizer@example.com",
    displayName: "Organizer",
  })),
  listTournamentRegistrations: vi.fn(async () => ({
    tournament: {
      id: "tournament-1",
      title: "Bangkok Open",
      organizerId: "organizer-1",
      status: "PUBLISHED" as const,
      capacity: 8,
    },
    registrations: [],
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
  "@/features/registrations/application/list-tournament-registrations",
  () => ({
    listTournamentRegistrations: mocks.listTournamentRegistrations,
  }),
)

vi.mock(
  "@/features/registrations/infrastructure/get-registration-repository",
  () => ({
    getRegistrationRepository: () => ({}),
  }),
)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("TournamentRegistrationsPage", () => {
  it("keeps a single main landmark inside the admin layout", async () => {
    const page = await TournamentRegistrationsPage({
      params: Promise.resolve({ id: "tournament-1" }),
      searchParams: Promise.resolve({}),
    })
    const layout = await AdminLayout({ children: page })

    render(layout)

    expect(screen.getAllByRole("main")).toHaveLength(1)
  })
})
