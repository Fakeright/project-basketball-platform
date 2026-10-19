import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import BracketPage from "@/app/(public)/bracket/page"
import ResultsPage from "@/app/(public)/results/page"
import SchedulePage from "@/app/(public)/schedule/page"
import { mockTournamentData } from "@/features/tournaments/infrastructure/mock-tournament-data"

const repository = vi.hoisted(() => ({
  findFirstCompetitionByStatus: vi.fn(),
}))

vi.mock("@/features/tournaments/infrastructure/get-tournament-repository", () => ({
  getTournamentRepository: () => repository,
}))
vi.mock("@/features/competition/application/get-external-bracket-view", () => ({
  getExternalBracketView: () => Promise.resolve(null),
}))
vi.mock("@/features/tournament-media/infrastructure/supabase-object-storage", () => ({
  SupabaseObjectStorage: class {},
}))
vi.mock("next/link", () => ({
  default: ({ prefetch, ...props }: React.ComponentProps<"a"> & { prefetch?: boolean }) => (
    <a {...props} data-prefetch={prefetch === false ? "off" : "on"} />
  ),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("public competition navigation", () => {
  it("does not prefetch the schedule, results, or fallback list from the bracket", async () => {
    repository.findFirstCompetitionByStatus.mockResolvedValue(mockTournamentData[1])
    render(await BracketPage({ searchParams: Promise.resolve({}) }))

    expect(screen.getByRole("link", { name: "ดูตารางแข่งขัน" }).getAttribute("data-prefetch")).toBe("off")
    expect(screen.getByRole("link", { name: "ดูผลการแข่งขัน" }).getAttribute("data-prefetch")).toBe("off")
    expect(screen.getByRole("link", { name: "ดูทัวร์นาเมนต์ทั้งหมด" }).getAttribute("data-prefetch")).toBe("off")
  })

  it("does not prefetch bracket and results from the schedule", async () => {
    repository.findFirstCompetitionByStatus.mockResolvedValue(mockTournamentData[1])
    render(await SchedulePage({ searchParams: Promise.resolve({}) }))

    expect(screen.getByRole("link", { name: "ดูสายการแข่งขัน" }).getAttribute("data-prefetch")).toBe("off")
    expect(screen.getByRole("link", { name: "ดูผลการแข่งขัน" }).getAttribute("data-prefetch")).toBe("off")
  })

  it("does not prefetch competition links from results", async () => {
    repository.findFirstCompetitionByStatus.mockResolvedValue(mockTournamentData[1])
    render(await ResultsPage({ searchParams: Promise.resolve({}) }))

    for (const label of ["ตารางแข่งขัน", "สายการแข่งขัน", "รายละเอียดรายการ"]) {
      expect(screen.getByRole("link", { name: label }).getAttribute("data-prefetch")).toBe("off")
    }
  })
})
