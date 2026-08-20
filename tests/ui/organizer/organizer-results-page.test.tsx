import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import OrganizerResultsPage from "@/app/(admin)/organizer/tournaments/[id]/results/page"

const mocks = vi.hoisted(() => ({
  getCurrentActor: vi.fn(async () => ({
    id: "organizer-1",
    role: "TOURNAMENT_ORGANIZER" as const,
    email: "organizer@example.com",
    displayName: "Organizer",
  })),
  getOrganizerCompetition: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock(
  "@/features/identity/infrastructure/next-cookie-current-actor-provider",
  () => ({
    createNextCookieCurrentActorProvider: () => ({
      getCurrentActor: mocks.getCurrentActor,
    }),
  }),
)

vi.mock("@/features/competition/application/get-organizer-competition", () => ({
  getOrganizerCompetition: mocks.getOrganizerCompetition,
}))

vi.mock(
  "@/features/competition/infrastructure/get-competition-repository",
  () => ({ getCompetitionRepository: () => ({}) }),
)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("OrganizerResultsPage", () => {
  it("places lifecycle readiness above match result operations", async () => {
    mocks.getOrganizerCompetition.mockResolvedValueOnce({
      tournament: {
        id: "tournament-1",
        title: "Bangkok Open",
        organizerId: "organizer-1",
        status: "REGISTRATION_CLOSED",
        version: 4,
      },
      approvedTeamCount: 2,
      bracket: null,
      lifecycle: {
        startIssues: ["BRACKET_MISSING", "CHAMPIONSHIP_MISSING"],
        completionIssues: ["TOURNAMENT_STATUS_INVALID", "BRACKET_MISSING"],
      },
    })

    const page = await OrganizerResultsPage({
      params: Promise.resolve({ id: "tournament-1" }),
      searchParams: Promise.resolve({}),
    })
    render(page)

    const readiness = screen.getByText("ความพร้อมของการแข่งขัน")
    const resultOperations = screen.getByText("ยังไม่มีคู่แข่งขันสำหรับบันทึกผล")
    expect(readiness.compareDocumentPosition(resultOperations)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(screen.getByText("ยังไม่มีสายการแข่งขัน")).toBeTruthy()
  })
})
