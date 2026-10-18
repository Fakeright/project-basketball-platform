import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import { TournamentCapacityField } from "@/components/admin/tournament-capacity-field"

afterEach(cleanup)

describe("TournamentCapacityField", () => {
  it("offers common capacities and defaults to 16 teams", () => {
    render(<TournamentCapacityField />)

    const select = screen.getByLabelText(
      "จำนวนทีมสูงสุด",
    ) as HTMLSelectElement
    expect(select.value).toBe("16")
    for (const capacity of [8, 16, 32]) {
      expect(
        screen.getByRole("option", { name: `${capacity} ทีม` }),
      ).toBeTruthy()
    }
    expect(screen.queryByRole("option", { name: "กำหนดเอง" })).toBeNull()
    expect(screen.getAllByRole("option")).toHaveLength(3)
  })

  it("submits one capacity value when selection changes", async () => {
    const user = userEvent.setup()
    const { container } = render(<TournamentCapacityField />)

    await user.selectOptions(screen.getByLabelText("จำนวนทีมสูงสุด"), "8")

    expect((screen.getByLabelText("จำนวนทีมสูงสุด") as HTMLSelectElement).value).toBe("8")
    expect(container.querySelectorAll('[name="capacity"]')).toHaveLength(1)
  })

  it("shows an existing legacy value without making it a new-tournament choice", () => {
    render(<TournamentCapacityField defaultValue={6} />)

    expect(
      (screen.getByLabelText("จำนวนทีมสูงสุด") as HTMLSelectElement).value,
    ).toBe("6")
    expect(screen.getAllByRole("option")).toHaveLength(4)
  })
})
