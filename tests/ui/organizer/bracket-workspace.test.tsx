import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BracketWorkspace } from "@/components/organizer/bracket-workspace"
import type { OrganizerCompetitionWorkspace } from "@/features/competition/application/ports/competition-repository"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}))

const unlocked: OrganizerCompetitionWorkspace = {
  tournament: {
    id: "tournament-1",
    title: "COURTSIDE OPEN",
    organizerId: "organizer-1",
    status: "REGISTRATION_CLOSED",
    version: 4,
  },
  approvedTeamCount: 2,
  bracket: null,
}

const locked: OrganizerCompetitionWorkspace = {
  ...unlocked,
  bracket: {
    id: "bracket-1",
    version: 2,
    status: "DRAFT",
    generationMethod: null,
    entriesLockedAt: "2026-08-19T05:00:00.000Z",
    hasStartedMatch: false,
    entries: [entry("entry-1", "team-1", "Bangkok Five", 1), entry("entry-2", "team-2", "Chiang Mai Hoops", 2)],
    rounds: [],
  },
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("BracketWorkspace", () => {
  it("shows the three-step workflow and locks approved entries", async () => {
    const fetchMock = vi.fn(async () => Response.json({ workspace: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<BracketWorkspace workspace={unlocked} />)

    expect(screen.getByText("01")).toBeTruthy()
    expect(screen.getByText("ล็อกรายชื่อทีม")).toBeTruthy()
    expect(screen.getByText("02")).toBeTruthy()
    expect(screen.getByText("03")).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "ล็อกรายชื่อ" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/bracket/entries",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ expectedVersion: 4 }),
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it("renders seed controls for every locked team", () => {
    render(<BracketWorkspace workspace={locked} />)

    expect(
      (screen.getByRole("radio", { name: "กำหนด Seed" }) as HTMLInputElement)
        .checked,
    ).toBe(true)
    expect(
      (screen.getByLabelText("Seed Bangkok Five") as HTMLInputElement).value,
    ).toBe("1")
    expect(
      (screen.getByLabelText("Seed Chiang Mai Hoops") as HTMLInputElement).value,
    ).toBe("2")
    expect(screen.getByText("ล็อกแล้ว")).toBeTruthy()
  })

  it("submits random generation with the current bracket version", async () => {
    const fetchMock = vi.fn(async () => Response.json({ bracket: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<BracketWorkspace workspace={locked} />)

    await user.click(screen.getByRole("radio", { name: "สุ่มอัตโนมัติ" }))
    await user.click(screen.getByRole("button", { name: "สร้างตัวอย่างสาย" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/bracket/generate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          method: "RANDOM",
          expectedVersion: 2,
          redraw: false,
        }),
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it("publishes a generated draft", async () => {
    const fetchMock = vi.fn(async () => Response.json({ bracket: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    const generated: OrganizerCompetitionWorkspace = {
      ...locked,
      bracket: {
        ...locked.bracket!,
        rounds: [
          {
            id: "round-1",
            name: "Final",
            sequence: 1,
            matches: [
              {
                id: "match-1",
                sequence: 1,
                homeTeamId: "team-1",
                awayTeamId: "team-2",
                status: "SCHEDULED",
              },
            ],
          },
        ],
      },
    }
    render(<BracketWorkspace workspace={generated} />)

    await user.click(
      screen.getByRole("button", { name: "เผยแพร่สายการแข่งขัน" }),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/bracket/publication",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ expectedVersion: 2 }),
      }),
    )
  })
})

function entry(
  id: string,
  teamId: string,
  teamNameSnapshot: string,
  seed: number,
) {
  return {
    id,
    bracketId: "bracket-1",
    registrationId: `registration-${id}`,
    teamId,
    teamNameSnapshot,
    seed,
    drawPosition: seed,
    startRoundSequence: 1,
  }
}
