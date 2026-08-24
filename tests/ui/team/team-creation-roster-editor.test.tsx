import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it } from "vitest"

import {
  createManualTeamCreationPlayerRow,
  getSubmittableTeamCreationPlayerRows,
  TeamCreationRosterEditor,
  type TeamCreationPlayerRow,
  validateTeamCreationPlayerRows,
} from "@/components/team/team-creation-roster-editor"
import type { ReusableTeamPlayer } from "@/features/team-management/domain/team-player-history"

afterEach(cleanup)

const reusablePlayers: readonly ReusableTeamPlayer[] = [
  {
    key: "history-player-1",
    player: {
      firstName: "สมชาย",
      lastName: "ใจดี",
      birthDate: "2010-02-03",
      nickname: "ชาย",
      jerseyNumber: 4,
      position: "PG",
      phone: "0812345678",
    },
    isActive: true,
    sourceTeams: [{ id: "team-a", name: "A Team", playerIsActive: true }],
  },
]

describe("TeamCreationRosterEditor", () => {
  it("copies selected history into an editable snapshot and removes only its source row when deselected", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<RosterHarness reusablePlayers={reusablePlayers} />)

    await user.click(screen.getByRole("button", { name: "เลือกจากผู้เล่นเดิม" }))
    await user.click(screen.getByRole("checkbox", { name: "เลือก สมชาย ใจดี" }))

    const roster = screen.getByRole("region", { name: "รายชื่อที่จะเพิ่ม" })
    expect(
      (within(roster).getByLabelText("ชื่อ", { selector: "input" }) as HTMLInputElement).value,
    ).toBe("สมชาย")
    const jersey = within(roster).getByLabelText("เบอร์เสื้อ")
    await user.clear(jersey)
    await user.type(jersey, "12")

    rerender(
      <RosterHarness
        reusablePlayers={[
          {
            ...reusablePlayers[0],
            player: { ...reusablePlayers[0].player, jerseyNumber: 99 },
          },
        ]}
      />,
    )
    expect((within(roster).getByLabelText("เบอร์เสื้อ") as HTMLInputElement).value).toBe("12")

    await user.click(screen.getByRole("checkbox", { name: "เลือก สมชาย ใจดี" }))
    expect(within(roster).queryByDisplayValue("สมชาย")).toBeNull()
  })

  it("adds and removes manual rows while omitting blank manual rows from submission", async () => {
    const user = userEvent.setup()
    render(<RosterHarness reusablePlayers={[]} />)

    await user.click(screen.getByRole("button", { name: "เพิ่มผู้เล่นใหม่" }))
    await user.click(screen.getByRole("button", { name: "เพิ่มผู้เล่นใหม่" }))
    expect(screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })).toHaveLength(2)
    expect(screen.getByTestId("submittable-count").textContent).toBe("0")

    await user.type(screen.getAllByLabelText("ชื่อ", { selector: "input" })[0], "มานะ")
    expect(screen.getByTestId("submittable-count").textContent).toBe("1")

    await user.click(screen.getByRole("button", { name: "ลบผู้เล่นคนที่ 2" }))
    expect(screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })).toHaveLength(1)
  })

  it("shows duplicate identity and jersey errors and focuses the first invalid field", async () => {
    const user = userEvent.setup()
    render(<RosterHarness reusablePlayers={[]} />)

    await user.click(screen.getByRole("button", { name: "เพิ่มผู้เล่นใหม่" }))
    await user.click(screen.getByRole("button", { name: "เพิ่มผู้เล่นใหม่" }))

    const firstNames = screen.getAllByLabelText("ชื่อ", { selector: "input" })
    const lastNames = screen.getAllByLabelText("นามสกุล", { selector: "input" })
    const birthDates = screen.getAllByLabelText("วันเกิด")
    const jerseys = screen.getAllByLabelText("เบอร์เสื้อ")
    for (let index = 0; index < 2; index += 1) {
      await user.type(firstNames[index], "สมชาย")
      await user.type(lastNames[index], "ใจดี")
      await user.type(birthDates[index], "2010-02-03")
      await user.type(jerseys[index], "4")
    }

    await user.click(screen.getByRole("button", { name: "ตรวจสอบรายชื่อ" }))

    expect(screen.getAllByText("ผู้เล่นคนนี้อยู่ในรายชื่อแล้ว")).toHaveLength(2)
    expect(screen.getAllByText("เบอร์เสื้อนี้ถูกใช้แล้ว")).toHaveLength(2)
    expect(document.activeElement).toBe(firstNames[0])
  })

  it("does not move focus to another invalid field while the user corrects the first one", async () => {
    const user = userEvent.setup()
    render(<RosterHarness reusablePlayers={[]} />)

    await user.click(screen.getByRole("button", { name: "เพิ่มผู้เล่นใหม่" }))
    await user.type(screen.getByLabelText("ชื่อเล่น", { selector: "input" }), "ชาย")
    await user.click(screen.getByRole("button", { name: "ตรวจสอบรายชื่อ" }))

    const firstName = screen.getByLabelText("ชื่อ", { selector: "input" })
    await waitFor(() => expect(document.activeElement).toBe(firstName))
    await user.type(firstName, "สมชาย")

    expect(document.activeElement).toBe(firstName)
    expect((firstName as HTMLInputElement).value).toBe("สมชาย")
    expect(screen.getByText("กรุณาระบุนามสกุลผู้เล่น")).toBeTruthy()
  })

  it("keeps required errors without treating two partial identities as duplicate players", () => {
    const firstRow = createManualTeamCreationPlayerRow("manual-1")
    const secondRow = createManualTeamCreationPlayerRow("manual-2")
    firstRow.values.firstName = "สมชาย"
    secondRow.values.firstName = "สมชาย"

    const validatedRows = validateTeamCreationPlayerRows([firstRow, secondRow])

    expect(validatedRows.map((row) => row.errors.lastName)).toEqual([
      "กรุณาระบุนามสกุลผู้เล่น",
      "กรุณาระบุนามสกุลผู้เล่น",
    ])
    expect(validatedRows.map((row) => row.errors.birthDate)).toEqual([
      "กรุณาระบุวันเกิดผู้เล่น",
      "กรุณาระบุวันเกิดผู้เล่น",
    ])
    expect(validatedRows.map((row) => row.errors.firstName)).toEqual([
      undefined,
      undefined,
    ])
  })

  it("keeps desktop column headers and mobile field labels without a fixed-width wrapper", () => {
    render(
      <TeamCreationRosterEditor
        onRowsChange={() => undefined}
        reusablePlayers={[]}
        rows={[createManualTeamCreationPlayerRow("manual-1")]}
      />,
    )

    expect(screen.getAllByText("เบอร์โทรศัพท์", { selector: "span" })).toHaveLength(2)
    expect(screen.getByRole("region", { name: "รายชื่อที่จะเพิ่ม" }).className).toContain("min-w-0")
  })
})

function RosterHarness({
  reusablePlayers,
}: {
  reusablePlayers: readonly ReusableTeamPlayer[]
}) {
  const [rows, setRows] = useState<TeamCreationPlayerRow[]>([])
  const [focusRequestId, setFocusRequestId] = useState(0)

  return (
    <>
      <TeamCreationRosterEditor
        focusRequestId={focusRequestId}
        onRowsChange={setRows}
        reusablePlayers={reusablePlayers}
        rows={rows}
      />
      <button
        onClick={() => {
          setRows(validateTeamCreationPlayerRows(rows))
          setFocusRequestId((current) => current + 1)
        }}
        type="button"
      >
        ตรวจสอบรายชื่อ
      </button>
      <span data-testid="submittable-count">
        {getSubmittableTeamCreationPlayerRows(rows).length}
      </span>
    </>
  )
}
