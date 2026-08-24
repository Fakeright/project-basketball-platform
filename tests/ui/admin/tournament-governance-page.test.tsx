import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import AdminTournamentGovernancePage from "@/app/(admin)/admin/tournaments/[id]/page"

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  findGovernanceContext: vi.fn(),
  getCurrentActor: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
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

vi.mock(
  "@/features/tournament-operations/infrastructure/get-tournament-operations-repository",
  () => ({
    getTournamentOperationsRepository: async () => ({
      findById: mocks.findById,
      findGovernanceContext: mocks.findGovernanceContext,
    }),
  }),
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
  status: "COMPLETED" as const,
  governanceStatus: "ACTIVE" as const,
  governanceReason: null,
  governanceUpdatedAt: null,
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

const governanceContext = {
  tournamentId: tournament.id,
  title: tournament.title,
  organizerId: tournament.organizerId,
  status: tournament.status,
  governanceStatus: tournament.governanceStatus,
  version: tournament.version,
  startsAt: tournament.startsAt,
  reviewCount: 1,
  registrationCount: 4,
  bracketCount: 1,
  matchCount: 3,
  mediaAssetCount: 2,
  activeBracket: {
    status: "PUBLISHED",
    entriesLockedAt: "2026-08-20T00:00:00.000Z",
    matchCount: 3,
  },
}

beforeEach(() => {
  mocks.getCurrentActor.mockResolvedValue({
    id: "admin-1",
    role: "PLATFORM_ADMIN",
    email: "admin@example.com",
    displayName: "Admin",
  })
  mocks.findById.mockResolvedValue(tournament)
  mocks.findGovernanceContext.mockResolvedValue(governanceContext)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminTournamentGovernancePage", () => {
  it("loads governance context and presents status, dependencies, and actions", async () => {
    render(
      await AdminTournamentGovernancePage({
        params: Promise.resolve({ id: tournament.id }),
      }),
    )

    expect(mocks.findGovernanceContext).toHaveBeenCalledWith(tournament.id)
    expect(screen.getByRole("heading", { name: tournament.title })).toBeTruthy()
    expect(screen.getByText("กำกับปกติ")).toBeTruthy()
    expect(screen.getByText("จบการแข่งขัน")).toBeTruthy()
    expect(screen.getByText("4 ใบสมัคร")).toBeTruthy()
    expect(
      (screen.getByRole("button", { name: "ระงับรายการ" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false)
    expect(
      (screen.getByRole("button", { name: "เก็บถาวร" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false)
    expect(
      (screen.getByRole("button", {
        name: "ยกเลิกการระงับ",
      }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect(
      screen.getByRole("link", { name: "เปิดข้อมูลรายการ" }).getAttribute("href"),
    ).toBe("/organizer/tournaments/tournament-1")
  })

  it("rejects actors who are not platform admins before loading the tournament", async () => {
    mocks.getCurrentActor.mockResolvedValueOnce({
      id: "organizer-1",
      role: "TOURNAMENT_ORGANIZER",
      email: "organizer@example.com",
      displayName: "Organizer",
    })

    await expect(
      AdminTournamentGovernancePage({
        params: Promise.resolve({ id: tournament.id }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(mocks.findGovernanceContext).not.toHaveBeenCalled()
  })
})
