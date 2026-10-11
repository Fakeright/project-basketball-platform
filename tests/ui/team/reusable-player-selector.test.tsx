import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useState } from "react"

import { ReusablePlayerSelector } from "@/components/team/reusable-player-selector"
import type { ReusableTeamPlayer } from "@/features/team-management/domain/team-player-history"

afterEach(cleanup)

const players: readonly ReusableTeamPlayer[] = [
  {
    key: "player-one",
    player: {
      firstName: "สมชาย",
      lastName: "ใจดี",
      nickname: "ชาย",
      birthDate: "2010-02-03",
      jerseyNumber: 4,
      position: "PG",
      phone: "0812345678",
    },
    isActive: true,
    sourceTeams: [{ id: "team-a", name: "A Team", playerIsActive: true }],
  },
  {
    key: "shared-player",
    player: {
      firstName: "Anan",
      lastName: "Strong",
      nickname: "Ace",
      birthDate: "2009-05-06",
      jerseyNumber: 8,
      position: "SG",
      phone: null,
    },
    isActive: true,
    sourceTeams: [
      { id: "team-a", name: "A Team", playerIsActive: true },
      { id: "team-b", name: "B Team", playerIsActive: false },
    ],
  },
  {
    key: "inactive-player",
    player: {
      firstName: "สุดา",
      lastName: "แข็งแรง",
      nickname: "ดา",
      birthDate: "2011-07-08",
      jerseyNumber: null,
      position: null,
      phone: null,
    },
    isActive: false,
    sourceTeams: [{ id: "team-b", name: "B Team", playerIsActive: false }],
  },
]

describe("ReusablePlayerSelector", () => {
  it("groups source teams deterministically and shows shared players with status and every source team", () => {
    renderSelector()

    const groups = screen.getAllByRole("group", { name: /ผู้เล่นเดิมจากทีม/ })
    expect(groups.map((group) => group.getAttribute("aria-label"))).toEqual([
      "ผู้เล่นเดิมจากทีม A Team",
      "ผู้เล่นเดิมจากทีม B Team",
    ])
    expect(within(groups[0]).getAllByRole("checkbox", { name: /Anan Strong/ })).toHaveLength(1)
    expect(within(groups[1]).getAllByRole("checkbox", { name: /Anan Strong/ })).toHaveLength(1)
    expect(screen.getAllByText("ทีมเดิม: A Team, B Team")).toHaveLength(2)
    expect(screen.getAllByText("ใช้งานอยู่").length).toBeGreaterThan(0)
    expect(screen.getByText("เคยนำออก")).toBeTruthy()
  })

  it("keeps player rows in deterministic key order when input order changes", () => {
    render(
      <ReusablePlayerSelector
        maximumSelection={30}
        onSelectionChange={vi.fn()}
        players={[...players].reverse()}
        selectedKeys={new Set()}
      />,
    )

    const teamA = screen.getByRole("group", { name: "ผู้เล่นเดิมจากทีม A Team" })
    expect(
      within(teamA)
        .getAllByRole("checkbox", { name: /^เลือก / })
        .map((checkbox) => checkbox.getAttribute("aria-label")),
    ).toEqual(["เลือก สมชาย ใจดี", "เลือก Anan Strong"])
  })

  it("searches Thai and English identity fields without clearing a keyboard selection", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    renderSelector({ onSelectionChange })

    const somchai = screen.getByRole("checkbox", { name: "เลือก สมชาย ใจดี" })
    somchai.focus()
    await user.keyboard(" ")
    expect((somchai as HTMLInputElement).checked).toBe(true)
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["player-one"]))

    const search = screen.getByRole("searchbox", { name: "ค้นหาผู้เล่นเดิม" })
    await user.type(search, "Ace")
    expect(screen.queryByText("สมชาย ใจดี")).toBeNull()
    expect(screen.getAllByText("Anan Strong")).toHaveLength(2)

    await user.clear(search)
    await user.type(search, "Anan")
    expect(screen.getAllByText("Anan Strong")).toHaveLength(2)
    expect(screen.queryByText("สมชาย ใจดี")).toBeNull()

    await user.clear(search)
    await user.type(search, "ใจดี")
    expect(
      (screen.getByRole("checkbox", { name: "เลือก สมชาย ใจดี" }) as HTMLInputElement).checked,
    ).toBe(true)
    expect(screen.queryByText("Anan Strong")).toBeNull()
  })

  it("deselects an individual player by toggling the same checkbox off", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    renderSelector({ onSelectionChange })

    const somchai = screen.getByRole("checkbox", { name: "เลือก สมชาย ใจดี" })
    await user.click(somchai)
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["player-one"]))

    await user.click(somchai)
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set())
    expect((somchai as HTMLInputElement).checked).toBe(false)
  })

  it("associates select-all text with clickable 24px touch targets while keeping exact names", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    renderSelector({ onSelectionChange })

    const globalCheckbox = screen.getByRole("checkbox", { name: "เลือกผู้เล่นเดิมทั้งหมด" })
    const globalLabel = globalCheckbox.closest("label")
    expect(globalLabel).not.toBeNull()
    expect(globalLabel?.className).toContain("min-h-6")
    expect(globalLabel?.className).toContain("min-w-6")
    expect(within(globalLabel as HTMLElement).getAllByText("เลือกทั้งหมด")).toHaveLength(1)

    await user.click(within(globalLabel as HTMLElement).getByText("เลือกทั้งหมด"))
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      new Set(["player-one", "shared-player", "inactive-player"]),
    )

    const teamCheckbox = screen.getByRole("checkbox", {
      name: "เลือกผู้เล่นทั้งหมดจากทีม A Team",
    })
    const teamLabel = teamCheckbox.closest("label")
    expect(teamLabel).not.toBeNull()
    expect(teamLabel?.className).toContain("min-h-6")
    expect(teamLabel?.className).toContain("min-w-6")

    await user.click(within(teamLabel as HTMLElement).getByText("A Team"))
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["inactive-player"]))

    const individualCheckbox = screen.getByRole("checkbox", { name: "เลือก สมชาย ใจดี" })
    const individualLabel = individualCheckbox.closest("label")
    expect(individualLabel).not.toBeNull()
    expect(individualLabel?.className).toContain("min-h-6")
    expect(individualLabel?.className).toContain("min-w-6")
    expect(individualCheckbox.className).toContain("size-4")
  })

  it("selects a team once per player key and exposes partial selection as indeterminate", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    renderSelector({ onSelectionChange })

    const somchai = screen.getByRole("checkbox", { name: "เลือก สมชาย ใจดี" })
    await user.click(somchai)

    const teamA = screen.getByRole("checkbox", {
      name: "เลือกผู้เล่นทั้งหมดจากทีม A Team",
    }) as HTMLInputElement
    expect(teamA.indeterminate).toBe(true)

    await user.click(teamA)
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      new Set(["player-one", "shared-player"]),
    )
    expect(teamA.checked).toBe(true)

    await user.click(teamA)
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set())
  })

  it("selects and deselects all visible players while counting a shared player only once", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    renderSelector({ onSelectionChange })

    const selectAll = screen.getByRole("checkbox", { name: "เลือกผู้เล่นเดิมทั้งหมด" })
    await user.click(selectAll)
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      new Set(["player-one", "shared-player", "inactive-player"]),
    )
    expect(screen.getByText("เลือกแล้ว 3 จาก 30 คน")).toBeTruthy()

    await user.click(selectAll)
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set())
  })

  it("adds visible players in deterministic order up to the limit and announces the Thai limit message", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    renderSelector({ maximumSelection: 2, onSelectionChange })

    await user.click(screen.getByRole("checkbox", { name: "เลือกผู้เล่นเดิมทั้งหมด" }))

    expect(onSelectionChange).toHaveBeenLastCalledWith(
      new Set(["player-one", "shared-player"]),
    )
    expect(screen.getByRole("status").textContent).toContain(
      "เลือกได้สูงสุด 2 คน กรุณานำผู้เล่นออกก่อนเลือกเพิ่ม",
    )
    expect(
      (screen.getByRole("checkbox", { name: "เลือก สุดา แข็งแรง" }) as HTMLInputElement)
        .checked,
    ).toBe(false)
  })

  it("keeps the limit message for an equivalent controlled Set and clears it below maximum", async () => {
    const onSelectionChange = vi.fn()
    const { rerender } = render(
      <ReusablePlayerSelector
        maximumSelection={2}
        onSelectionChange={onSelectionChange}
        players={players}
        selectedKeys={new Set(["player-one", "shared-player"])}
      />,
    )

    await userEvent.setup().click(
      screen.getByRole("checkbox", { name: "เลือก สุดา แข็งแรง" }),
    )
    expect(screen.getByRole("status").textContent).toContain("เลือกได้สูงสุด 2 คน")

    rerender(
      <ReusablePlayerSelector
        maximumSelection={2}
        onSelectionChange={onSelectionChange}
        players={players}
        selectedKeys={new Set(["shared-player", "player-one"])}
      />,
    )

    expect(screen.getByRole("status").textContent).toContain("เลือกได้สูงสุด 2 คน")

    rerender(
      <ReusablePlayerSelector
        maximumSelection={2}
        onSelectionChange={onSelectionChange}
        players={players}
        selectedKeys={new Set(["player-one"])}
      />,
    )

    await waitFor(() => expect(screen.getByRole("status").textContent).toBe(""))
  })

  it("selects only filtered players while preserving selected players hidden by search", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    renderSelector({ onSelectionChange })

    await user.click(screen.getByRole("checkbox", { name: "เลือก สมชาย ใจดี" }))
    const search = screen.getByRole("searchbox", { name: "ค้นหาผู้เล่นเดิม" })
    await user.type(search, "Ace")
    expect(screen.queryByText("สมชาย ใจดี")).toBeNull()

    await user.click(screen.getByRole("checkbox", { name: "เลือกผู้เล่นเดิมทั้งหมด" }))
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      new Set(["player-one", "shared-player"]),
    )
    expect(onSelectionChange).not.toHaveBeenLastCalledWith(
      new Set(["shared-player", "inactive-player"]),
    )
  })
})

function renderSelector({
  maximumSelection = 30,
  onSelectionChange = vi.fn(),
}: {
  maximumSelection?: number
  onSelectionChange?: (keys: Set<string>) => void
} = {}) {
  function ControlledSelector() {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

    return (
      <ReusablePlayerSelector
        maximumSelection={maximumSelection}
        onSelectionChange={(keys) => {
          onSelectionChange(keys)
          setSelectedKeys(keys)
        }}
        players={players}
        selectedKeys={selectedKeys}
      />
    )
  }

  return render(<ControlledSelector />)
}
