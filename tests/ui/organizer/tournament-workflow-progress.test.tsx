import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TournamentWorkflowProgress } from "@/components/organizer/tournament-workflow-progress"

describe("TournamentWorkflowProgress", () => {
  it("renders five stable links and marks the current section", () => {
    render(
      <TournamentWorkflowProgress
        currentSection="bracket"
        status="REGISTRATION_CLOSED"
        tournamentId="t-1"
      />,
    )

    expect(screen.getAllByRole("link")).toHaveLength(5)
    expect(
      screen
        .getByRole("link", { name: "สายการแข่งขัน" })
        .getAttribute("aria-current"),
    ).toBe("step")
    expect(screen.getByText("ปิดรับสมัคร")).toBeTruthy()
  })

  it("keeps the step list inside its own horizontal scroller", () => {
    const { container } = render(
      <TournamentWorkflowProgress
        currentSection="details"
        status="DRAFT"
        tournamentId="t-1"
      />,
    )

    expect(container.querySelector("nav")?.className).toContain(
      "overflow-x-auto",
    )
    expect(container.querySelector("ol")?.className).toContain("min-w-max")
  })

  it("shows a fallback status for an unrecognized workspace value", () => {
    render(
      <TournamentWorkflowProgress
        currentSection="details"
        status="UNKNOWN"
        tournamentId="t-1"
      />,
    )

    expect(screen.getByText("ยังไม่อยู่ในขั้นดำเนินการแข่งขัน")).toBeTruthy()
  })
})
