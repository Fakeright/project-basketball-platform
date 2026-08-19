import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { CompetitionResultSummary } from "@/components/tournaments/competition-result-summary"
import { ScheduleTable } from "@/components/schedule-table"
import type { Match } from "@/features/tournaments/domain/tournament"

afterEach(cleanup)

describe("public schedule and results", () => {
  it("marks a confirmed match winner in the schedule", () => {
    const match: Match = {
      id: "final",
      tournamentSlug: "courtside-open",
      round: "รอบชิงชนะเลิศ",
      roundSequence: 2,
      sequence: 1,
      court: "สนาม A",
      scheduledAt: "2026-11-15T05:00:00.000Z",
      homeTeamId: "team-1",
      homeTeam: "Bangkok Five",
      awayTeamId: "team-2",
      awayTeam: "Chiang Mai Hoops",
      homeScore: 82,
      awayScore: 78,
      winnerTeamId: "team-1",
    }

    render(<ScheduleTable matches={[match]} />)

    expect(screen.getByText("ผู้ชนะ")).toBeTruthy()
    expect(screen.getByText("82 - 78")).toBeTruthy()
  })

  it("shows winner and runner-up without inventing third place", () => {
    render(
      <CompetitionResultSummary
        summary={{
          winner: { teamId: "team-1", teamName: "Bangkok Five" },
          runnerUp: { teamId: "team-2", teamName: "Chiang Mai Hoops" },
          eliminatedByRound: [
            {
              roundSequence: 1,
              roundName: "รอบรองชนะเลิศ",
              teams: [{ teamId: "team-3", teamName: "Phuket Waves" }],
            },
          ],
        }}
      />,
    )

    expect(screen.getByText("ชนะเลิศ")).toBeTruthy()
    expect(screen.getByText("รองชนะเลิศ")).toBeTruthy()
    expect(screen.queryByText(/อันดับ 3/)).toBeNull()
  })
})
