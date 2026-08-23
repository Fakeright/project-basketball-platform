import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import EditTournamentPage from "@/app/(admin)/organizer/tournaments/[id]/page"
import OrganizerBracketPage from "@/app/(admin)/organizer/tournaments/[id]/bracket/page"
import TournamentRegistrationsPage from "@/app/(admin)/organizer/tournaments/[id]/registrations/page"
import OrganizerSchedulePage from "@/app/(admin)/organizer/tournaments/[id]/schedule/page"
import OrganizerResultsPage from "@/app/(admin)/organizer/tournaments/[id]/results/page"

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  getCurrentActor: vi.fn(),
  getOrganizerCompetition: vi.fn(),
  getOrganizerExternalBracketWorkspace: vi.fn(),
  listActiveAssets: vi.fn(),
  listTournamentRegistrations: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  redirect: vi.fn(),
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
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

vi.mock(
  "@/features/tournament-media/infrastructure/get-tournament-media-repository",
  () => ({
    getTournamentMediaRepository: async () => ({
      listActiveAssets: mocks.listActiveAssets,
    }),
  }),
)

vi.mock(
  "@/features/tournament-media/infrastructure/supabase-object-storage",
  () => ({
    SupabaseObjectStorage: class SupabaseObjectStorage {
      getPublicUrl() {
        return "https://storage.test/poster.webp"
      }
    },
  }),
)

vi.mock("@/features/competition/application/get-organizer-competition", () => ({
  getOrganizerCompetition: mocks.getOrganizerCompetition,
}))

vi.mock(
  "@/features/competition/application/get-organizer-external-bracket-workspace",
  () => ({
    getOrganizerExternalBracketWorkspace:
      mocks.getOrganizerExternalBracketWorkspace,
  }),
)

vi.mock(
  "@/features/competition/infrastructure/get-competition-repository",
  () => ({ getCompetitionRepository: () => ({}) }),
)

vi.mock(
  "@/features/competition/infrastructure/get-external-bracket-repository",
  () => ({ getExternalBracketRepository: () => ({}) }),
)

vi.mock(
  "@/features/registrations/application/list-tournament-registrations",
  () => ({
    listTournamentRegistrations: mocks.listTournamentRegistrations,
  }),
)

vi.mock(
  "@/features/registrations/infrastructure/get-registration-repository",
  () => ({ getRegistrationRepository: () => ({}) }),
)

const tournament = {
  id: "tournament-1",
  title: "COURTSIDE Open",
  organizerId: "organizer-1",
  organizerName: "ผู้จัดสนามกลาง",
  provinceCode: "10",
  province: "กรุงเทพมหานคร",
  venue: "สนามกลาง",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  status: "PUBLISHED" as const,
  governanceStatus: "SUSPENDED" as const,
  governanceReason: "ตรวจสอบข้อมูลผู้จัด",
  governanceUpdatedAt: "2026-08-22T00:00:00.000Z",
  version: 4,
  description: "การแข่งขันระดับประเทศ",
  rules: "กติกามาตรฐาน",
  capacity: 8,
  startsAt: "2026-11-15T02:00:00.000Z",
  endsAt: "2026-11-16T11:00:00.000Z",
  registrationDeadline: "2026-11-01T16:59:00.000Z",
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-19T00:00:00.000Z",
}

function competitionWorkspace(governanceStatus: "SUSPENDED" | "REMOVED") {
  return {
    tournament: {
      id: tournament.id,
      title: tournament.title,
      organizerId: tournament.organizerId,
      tournamentGovernanceStatus: governanceStatus,
      status: tournament.status,
      version: tournament.version,
    },
    approvedTeamCount: 0,
    bracket: null,
    lifecycle: { startIssues: [], completionIssues: [] },
  }
}

function registrationReview(governanceStatus: "SUSPENDED" | "REMOVED") {
  return {
    tournament: {
      id: tournament.id,
      title: tournament.title,
      organizerId: tournament.organizerId,
      status: tournament.status,
      governanceStatus,
      capacity: tournament.capacity,
    },
    registrations: [],
  }
}

beforeEach(() => {
  mocks.getCurrentActor.mockResolvedValue({
    id: "organizer-1",
    role: "TOURNAMENT_ORGANIZER",
    email: "organizer@example.com",
    displayName: "Organizer",
  })
  mocks.findById.mockResolvedValue(tournament)
  mocks.getOrganizerCompetition.mockResolvedValue(
    competitionWorkspace("SUSPENDED"),
  )
  mocks.listTournamentRegistrations.mockResolvedValue(
    registrationReview("SUSPENDED"),
  )
  mocks.listActiveAssets.mockResolvedValue([])
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("organizer tournament governance states", () => {
  it("shows suspended tournament identity without editor, lifecycle, or media controls", async () => {
    render(
      await EditTournamentPage({
        params: Promise.resolve({ id: tournament.id }),
      }),
    )

    expect(screen.getByText("รายการนี้ถูกระงับชั่วคราว")).toBeTruthy()
    expect(screen.getByRole("heading", { name: tournament.title })).toBeTruthy()
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.queryByText("สื่อและเอกสาร")).toBeNull()
    expect(mocks.listActiveAssets).not.toHaveBeenCalled()
  })

  it.each([
    ["สายการแข่งขัน", OrganizerBracketPage],
    ["ตารางแข่งขัน", OrganizerSchedulePage],
    ["ผลการแข่งขัน", OrganizerResultsPage],
  ])(
    "makes the suspended %s workspace read-only",
    async (_name, Page) => {
      render(
        await Page({
          params: Promise.resolve({ id: tournament.id }),
        }),
      )

      expect(screen.getByText("รายการนี้ถูกระงับชั่วคราว")).toBeTruthy()
      expect(screen.getByRole("heading", { name: tournament.title })).toBeTruthy()
      expect(screen.queryByRole("button")).toBeNull()
    },
  )

  it("omits registration decisions for a suspended tournament", async () => {
    render(
      await TournamentRegistrationsPage({
        params: Promise.resolve({ id: tournament.id }),
      }),
    )

    expect(screen.getByText("รายการนี้ถูกระงับชั่วคราว")).toBeTruthy()
    expect(screen.getByRole("heading", { name: tournament.title })).toBeTruthy()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it.each([
    [
      "editor",
      async () => {
        mocks.findById.mockResolvedValueOnce({
          ...tournament,
          governanceStatus: "REMOVED",
        })
        return EditTournamentPage({
          params: Promise.resolve({ id: tournament.id }),
        })
      },
    ],
    [
      "bracket",
      async () => {
        mocks.getOrganizerCompetition.mockResolvedValueOnce(
          competitionWorkspace("REMOVED"),
        )
        return OrganizerBracketPage({
          params: Promise.resolve({ id: tournament.id }),
        })
      },
    ],
    [
      "registrations",
      async () => {
        mocks.listTournamentRegistrations.mockResolvedValueOnce(
          registrationReview("REMOVED"),
        )
        return TournamentRegistrationsPage({
          params: Promise.resolve({ id: tournament.id }),
        })
      },
    ],
    [
      "schedule",
      async () => {
        mocks.getOrganizerCompetition.mockResolvedValueOnce(
          competitionWorkspace("REMOVED"),
        )
        return OrganizerSchedulePage({
          params: Promise.resolve({ id: tournament.id }),
        })
      },
    ],
    [
      "results",
      async () => {
        mocks.getOrganizerCompetition.mockResolvedValueOnce(
          competitionWorkspace("REMOVED"),
        )
        return OrganizerResultsPage({
          params: Promise.resolve({ id: tournament.id }),
        })
      },
    ],
  ])("returns not found for removed tournament %s", async (_name, loadPage) => {
    await expect(loadPage()).rejects.toThrow("NEXT_NOT_FOUND")
  })
})
