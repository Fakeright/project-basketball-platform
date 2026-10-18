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
    tournamentGovernanceStatus: "ACTIVE",
    status: "REGISTRATION_CLOSED",
    version: 4,
  },
  approvedTeamCount: 2,
  bracket: null,
}

const locked: OrganizerCompetitionWorkspace = {
  ...unlocked,
  approvedTeamCount: 8,
  bracket: {
    id: "bracket-1",
    version: 2,
    status: "DRAFT",
    mode: "SYSTEM_GENERATED",
    generationMethod: null,
    entriesLockedAt: "2026-08-19T05:00:00.000Z",
    hasStartedMatch: false,
    entries: Array.from({ length: 8 }, (_, index) => entry(
      `entry-${index + 1}`,
      `team-${index + 1}`,
      index === 0 ? "Bangkok Five" : index === 1 ? "Chiang Mai Hoops" : `Team ${index + 1}`,
      index + 1,
    )),
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

  it("moves a team up and submits the visible order", async () => {
    const fetchMock = vi.fn(async () => Response.json({ bracket: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<BracketWorkspace workspace={locked} />)

    expect(
      (screen.getByRole("radio", { name: "เรียงทีมเอง" }) as HTMLInputElement)
        .checked,
    ).toBe(true)
    expect(screen.getByRole("button", { name: "เลื่อน Bangkok Five ขึ้น" }).hasAttribute("disabled")).toBe(true)
    await user.click(screen.getByRole("button", { name: "เลื่อน Chiang Mai Hoops ขึ้น" }))
    await user.click(screen.getByRole("button", { name: "สร้างตัวอย่างสาย" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/bracket/generate",
      expect.objectContaining({
        body: JSON.stringify({
          method: "ORDERED",
          expectedVersion: 2,
          positions: [
            { entryId: "entry-2", position: 1 },
            { entryId: "entry-1", position: 2 },
            ...locked.bracket!.entries.slice(2).map((entry, index) => ({
              entryId: entry.id,
              position: index + 3,
            })),
          ],
        }),
      }),
    )
    expect(screen.getByText("ล็อกแล้ว")).toBeTruthy()
  })

  it("moves teams with the keyboard and resets to server order after a new version", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<BracketWorkspace workspace={locked} />)

    const moveUp = screen.getByRole("button", { name: "เลื่อน Chiang Mai Hoops ขึ้น" })
    moveUp.focus()
    await user.keyboard("{Enter}")
    expect(screen.getByRole("button", { name: "เลื่อน Chiang Mai Hoops ขึ้น" }).hasAttribute("disabled")).toBe(true)

    rerender(<BracketWorkspace workspace={{
      ...locked,
      bracket: {
        ...locked.bracket!,
        version: 3,
        entries: locked.bracket!.entries,
      },
    }} />)
    expect(screen.getByRole("button", { name: "เลื่อน Chiang Mai Hoops ขึ้น" }).hasAttribute("disabled")).toBe(false)
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
          method: "RANDOM_ORDERED",
          expectedVersion: 2,
          redraw: false,
        }),
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it("requires confirmation before drawing a new random order", async () => {
    const fetchMock = vi.fn(async () => Response.json({ bracket: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true)
    const user = userEvent.setup()
    render(<BracketWorkspace workspace={{ ...locked, bracket: { ...locked.bracket!, generationMethod: "RANDOM_ORDERED" } }} />)

    await user.click(screen.getByRole("button", { name: "สุ่มใหม่" }))
    expect(fetchMock).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "สุ่มใหม่" }))
    expect(confirm).toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/bracket/generate",
      expect.objectContaining({ body: JSON.stringify({ method: "RANDOM_ORDERED", expectedVersion: 2, redraw: true }) }),
    )
    confirm.mockRestore()
  })

  it("keeps external mode available when twelve entries cannot generate a system bracket", () => {
    render(<BracketWorkspace
      workspace={{
        ...locked,
        approvedTeamCount: 12,
        bracket: {
          ...locked.bracket!,
          entries: Array.from({ length: 12 }, (_, index) => entry(`entry-${index + 1}`, `team-${index + 1}`, `Team ${index + 1}`, index + 1)),
        },
      }}
      modeContext={{ tournamentId: "tournament-1", organizerId: "organizer-1", tournamentGovernanceStatus: "ACTIVE", bracketId: "bracket-1", bracketVersion: 2, bracketStatus: "DRAFT", bracketMode: "SYSTEM_GENERATED", hasStartedMatch: false }}
    />)

    expect(screen.getByText("สายที่ระบบสร้างต้องมีทีมที่อนุมัติ 8, 16 หรือ 32 ทีม")).toBeTruthy()
    expect(screen.getByRole("button", { name: "สร้างตัวอย่างสาย" }).hasAttribute("disabled")).toBe(true)
    expect(screen.getByRole("radio", { name: "ใช้ไฟล์ภายนอก" })).toBeTruthy()
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
                scheduledAt: null,
                court: null,
                version: 0,
                homeScore: null,
                awayScore: null,
                winnerTeamId: null,
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
