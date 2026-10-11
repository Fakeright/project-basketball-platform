import { cleanup, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import OrganizerPage from "@/app/(admin)/organizer/page"

const mocks = vi.hoisted(() => ({
  getCurrentActor: vi.fn(async () => ({
    id: "organizer-1",
    role: "TOURNAMENT_ORGANIZER" as const,
    email: "organizer@example.com",
    displayName: "Organizer",
  })),
  getTournamentOperationsRepository: vi.fn(),
  listOwnedTournamentWorkflows: vi.fn(),
  createOrganizerWorkflowGuidance: vi.fn(),
}))

vi.mock("next/navigation", () => ({ redirect: vi.fn() }))

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
    getTournamentOperationsRepository: mocks.getTournamentOperationsRepository,
  }),
)

vi.mock(
  "@/features/tournament-operations/application/list-owned-tournament-workflows",
  () => ({ listOwnedTournamentWorkflows: mocks.listOwnedTournamentWorkflows }),
)

vi.mock(
  "@/features/tournament-operations/presentation/organizer-workflow-guidance",
  () => ({
    createOrganizerWorkflowGuidance: mocks.createOrganizerWorkflowGuidance,
  }),
)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("OrganizerPage", () => {
  it("renders tournament details and mapper-derived action states", async () => {
    const repository = {
      listByOrganizer: vi.fn(() => {
        throw new Error("OrganizerPage must use listOwnedTournamentWorkflows")
      }),
    }
    mocks.getTournamentOperationsRepository.mockResolvedValueOnce(repository)
    mocks.listOwnedTournamentWorkflows.mockResolvedValueOnce([
      {
        tournament: {
          id: "t-1",
          title: "Bangkok Open",
          province: "กรุงเทพมหานคร",
        },
        competitionIssues: [],
      },
      {
        tournament: {
          id: "t-2",
          title: "Chiang Mai Cup",
          province: "เชียงใหม่",
        },
        competitionIssues: [],
      },
    ])
    mocks.createOrganizerWorkflowGuidance.mockImplementation(({ id }) =>
      id === "t-1"
        ? {
            stageLabel: "เปิดรับสมัคร",
            description: "ติดตามและพิจารณาทีมที่สมัคร",
            blockers: [],
            primaryAction: {
              label: "ตรวจทีมที่สมัคร",
              href: "/organizer/tournaments/t-1/registrations",
            },
          }
        : {
            stageLabel: "รอตรวจสอบ",
            description: "Admin กำลังตรวจข้อมูลรายการ",
            blockers: [],
            primaryAction: null,
          },
    )

    render(await OrganizerPage())

    expect(screen.getByText("Bangkok Open")).toBeTruthy()
    expect(screen.getByText("กรุงเทพมหานคร")).toBeTruthy()
    expect(screen.getByRole("link", { name: "ตรวจทีมที่สมัคร" }).getAttribute("href"))
      .toBe("/organizer/tournaments/t-1/registrations")
    expect(screen.getByText("Chiang Mai Cup")).toBeTruthy()
    expect(screen.getByText("เชียงใหม่")).toBeTruthy()

    const readOnlyRow = screen.getByText("Chiang Mai Cup").closest("article")
    expect(readOnlyRow).toBeTruthy()
    expect(within(readOnlyRow as HTMLElement).queryByRole("link")).toBeNull()
    expect(screen.queryByText("เปิดรายการ")).toBeNull()
    expect(mocks.listOwnedTournamentWorkflows).toHaveBeenCalledWith(
      expect.anything(),
      { tournaments: repository },
    )
    expect(mocks.createOrganizerWorkflowGuidance).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t-1", competitionIssues: [] }),
    )
  })

  it("links the empty state to tournament creation", async () => {
    const repository = { listByOrganizer: vi.fn() }
    mocks.getTournamentOperationsRepository.mockResolvedValueOnce(repository)
    mocks.listOwnedTournamentWorkflows.mockResolvedValueOnce([])

    render(await OrganizerPage())

    const emptyState = screen.getByText("ยังไม่มีรายการแข่งขัน").parentElement
    expect(emptyState).toBeTruthy()
    expect(within(emptyState as HTMLElement).getByRole("link", {
      name: "สร้างรายการแข่งขัน",
    }).getAttribute("href")).toBe("/organizer/tournaments/new")
  })
})
