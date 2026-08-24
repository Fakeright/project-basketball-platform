import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TournamentSearchForm } from "@/components/tournament-search-form"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

describe("TournamentSearchForm age group filter", () => {
  beforeEach(() => push.mockReset())
  afterEach(cleanup)

  it("offers all canonical age groups", async () => {
    const user = userEvent.setup()
    render(<TournamentSearchForm initialFilters={{}} />)

    await user.click(screen.getByLabelText("รุ่นอายุ"))
    for (const option of [
      "ทั้งหมด",
      "U12",
      "U14",
      "U16",
      "U18",
      "U23",
      "Open",
    ]) {
      expect(await screen.findByRole("option", { name: option })).toBeTruthy()
    }
  })

  it("submits a canonical age group in the URL", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <TournamentSearchForm initialFilters={{ query: "Bangkok" }} />,
    )

    await user.click(screen.getByLabelText("รุ่นอายุ"))
    await user.click(await screen.findByRole("option", { name: "U23" }))
    await user.click(within(container).getByRole("button", { name: "ค้นหา" }))

    expect(push).toHaveBeenCalledWith(
      "/tournaments?q=Bangkok&ageGroup=U23",
    )
  })

  it("restores a canonical age group from initial filters", () => {
    render(<TournamentSearchForm initialFilters={{ ageGroup: "U18" }} />)

    expect(screen.getByLabelText("รุ่นอายุ").textContent).toContain("U18")
  })

  it("clears an initial age group with all", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <TournamentSearchForm
        initialFilters={{ ageGroup: "U18", query: "Bangkok" }}
      />,
    )

    await user.click(screen.getByLabelText("รุ่นอายุ"))
    await user.click(await screen.findByRole("option", { name: "ทั้งหมด" }))
    await user.click(within(container).getByRole("button", { name: "ค้นหา" }))

    expect(push).toHaveBeenCalledWith("/tournaments?q=Bangkok")
  })
})
