import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import ResultsPage from "@/app/(public)/results/page"
import type { Tournament } from "@/features/tournaments/domain/tournament"

const repository = vi.hoisted(() => ({
  list: vi.fn(),
  findCompetitionBySlug: vi.fn(),
}))

vi.mock(
  "@/features/tournaments/infrastructure/get-tournament-repository",
  () => ({ getTournamentRepository: () => repository }),
)

afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  repository.list.mockResolvedValue([])
  repository.findCompetitionBySlug.mockResolvedValue(null)
})

describe("public ResultsPage", () => {
  it("shows partial confirmed results while a tournament is ongoing", async () => {
    const ongoing = tournament("ONGOING", [
      confirmedMatch("semi", "STANDARD", "รอบรองชนะเลิศ"),
      pendingMatch("final", "CHAMPIONSHIP", "รอบชิงชนะเลิศ"),
    ])
    repository.list.mockResolvedValueOnce([ongoing])
    repository.findCompetitionBySlug.mockResolvedValueOnce(ongoing)

    render(await renderPage())

    expect(screen.getByText(/^การแข่งขันยังไม่จบ/)).toBeTruthy()
    expect(screen.getByText("ยังไม่ยืนยันผลรอบชิงชนะเลิศ")).toBeTruthy()
    expect(screen.getByText("Chiang Mai Hoops")).toBeTruthy()
  })

  it("shows completed placements including optional third place", async () => {
    const completed = tournament("COMPLETED", [
      confirmedMatch("final", "CHAMPIONSHIP", "รอบชิงชนะเลิศ"),
      {
        ...confirmedMatch("third", "THIRD_PLACE", "ชิงอันดับ 3"),
        homeTeamId: "team-3",
        homeTeam: "Phuket Waves",
        awayTeamId: "team-4",
        awayTeam: "Khon Kaen Rise",
        winnerTeamId: "team-3",
      },
    ])
    repository.list
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([completed])
    repository.findCompetitionBySlug.mockResolvedValueOnce(completed)

    render(await renderPage())

    expect(screen.getByText("ชนะเลิศ")).toBeTruthy()
    expect(screen.getByText("รองชนะเลิศ")).toBeTruthy()
    expect(screen.getByText("อันดับ 3")).toBeTruthy()
    expect(screen.getByText("Phuket Waves")).toBeTruthy()
  })

  it("shows an empty state when no tournament is available", async () => {
    render(await renderPage())

    expect(screen.getByText("ยังไม่มีผลการแข่งขัน")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "ดูรายการแข่งขันทั้งหมด" }),
    ).toHaveProperty("href", "http://localhost:3000/tournaments")
  })

  it("selects the requested tournament slug", async () => {
    const requested = {
      ...tournament("COMPLETED", [
        confirmedMatch("final", "CHAMPIONSHIP", "Final"),
      ]),
      slug: "requested-cup",
      title: "Requested Cup",
    }
    repository.findCompetitionBySlug.mockResolvedValueOnce(requested)

    render(await renderPage("requested-cup"))

    expect(repository.list).not.toHaveBeenCalled()
    expect(repository.findCompetitionBySlug).toHaveBeenCalledWith(
      "requested-cup",
    )
    expect(screen.getByText("Requested Cup")).toBeTruthy()
  })
})

function renderPage(slug?: string) {
  return ResultsPage({
    searchParams: Promise.resolve(slug ? { tournament: slug } : {}),
  })
}

function tournament(
  status: Tournament["status"],
  matches: Tournament["matches"],
): Tournament {
  return {
    id: "tournament-1",
    slug: "courtside-open",
    title: "COURTSIDE Open",
    provinceCode: "10",
    province: "กรุงเทพมหานคร",
    venue: "สนาม A",
    format: "FIVE_V_FIVE",
    ageGroup: "Open",
    status,
    startsAt: "2026-08-20T02:00:00.000Z",
    endsAt: "2026-08-22T12:00:00.000Z",
    registrationDeadline: "2026-08-10T12:00:00.000Z",
    description: "การแข่งขันทดสอบ",
    documents: [],
    teams: [],
    matches,
  }
}

function confirmedMatch(
  id: string,
  purpose: Tournament["matches"][number]["purpose"],
  round: string,
): Tournament["matches"][number] {
  return {
    id,
    purpose,
    tournamentSlug: "courtside-open",
    round,
    roundSequence: 1,
    sequence: 1,
    court: "สนาม A",
    scheduledAt: "2026-08-20T05:00:00.000Z",
    homeTeamId: "team-1",
    homeTeam: "Bangkok Five",
    awayTeamId: "team-2",
    awayTeam: "Chiang Mai Hoops",
    homeScore: 80,
    awayScore: 70,
    winnerTeamId: "team-1",
  }
}

function pendingMatch(
  id: string,
  purpose: Tournament["matches"][number]["purpose"],
  round: string,
): Tournament["matches"][number] {
  return {
    ...confirmedMatch(id, purpose, round),
    homeScore: null,
    awayScore: null,
    winnerTeamId: null,
  }
}
