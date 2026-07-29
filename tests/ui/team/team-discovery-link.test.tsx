import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { TeamWorkspaceHeader } from "@/components/team/team-workspace-header"

afterEach(cleanup)

describe("TeamWorkspaceHeader", () => {
  it("offers Team Managers a prominent link to persisted tournament discovery", () => {
    render(<TeamWorkspaceHeader actorRole="TEAM_MANAGER" />)

    const discoveryLink = screen.getByRole("link", {
      name: "ค้นหารายการแข่งขัน",
    })
    expect(discoveryLink.getAttribute("href")).toBe("/tournaments")
  })

  it("does not offer the Team Manager application action to another role", () => {
    render(<TeamWorkspaceHeader actorRole="PLATFORM_ADMIN" />)

    expect(
      screen.queryByRole("link", { name: "ค้นหารายการแข่งขัน" }),
    ).toBeNull()
  })
})
