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
    for (const capacity of [6, 8, 12, 16, 24, 32]) {
      expect(
        screen.getByRole("option", { name: `${capacity} ทีม` }),
      ).toBeTruthy()
    }
    expect(screen.getByRole("option", { name: "กำหนดเอง" })).toBeTruthy()
  })

  it("reveals one custom capacity form value", async () => {
    const user = userEvent.setup()
    const { container } = render(<TournamentCapacityField />)

    await user.selectOptions(
      screen.getByLabelText("จำนวนทีมสูงสุด"),
      "CUSTOM",
    )
    const customInput = screen.getByLabelText("ระบุจำนวนทีม")
    await user.type(customInput, "10")

    expect((customInput as HTMLInputElement).value).toBe("10")
    expect(container.querySelectorAll('[name="capacity"]')).toHaveLength(1)
  })

  it("opens custom mode for a non-standard edit value", () => {
    render(<TournamentCapacityField defaultValue={10} />)

    expect(
      (screen.getByLabelText("จำนวนทีมสูงสุด") as HTMLSelectElement).value,
    ).toBe("CUSTOM")
    expect(
      (screen.getByLabelText("ระบุจำนวนทีม") as HTMLInputElement).value,
    ).toBe("10")
  })
})
