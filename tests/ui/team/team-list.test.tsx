import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getOwnedTeamWorkspace: vi.fn(),
  listOwnedTeams: vi.fn(),
}))

vi.mock("@/components/team/team-workspace-header", () => ({
  TeamWorkspaceHeader: () => <div>Team header</div>,
}))
vi.mock("@/features/identity/infrastructure/next-cookie-current-actor-provider", () => ({
  createNextCookieCurrentActorProvider: () => ({
    getCurrentActor: vi.fn(async () => ({ id: "manager-1", role: "TEAM_MANAGER_COACH" })),
  }),
}))
vi.mock("@/features/team-management/application/get-owned-team-workspace", () => ({
  getOwnedTeamWorkspace: mocks.getOwnedTeamWorkspace,
}))
vi.mock("@/features/team-management/application/list-owned-teams", () => ({
  listOwnedTeams: mocks.listOwnedTeams,
}))
vi.mock("@/features/team-management/infrastructure/get-team-repository", () => ({
  getTeamRepository: () => ({}),
}))

import TeamPage from "@/app/(admin)/team/page"

const team = {
  id: "team-1",
  name: "Bangkok Ballers",
  provinceCode: "10",
  province: "กรุงเทพมหานคร",
  ownerId: "manager-1",
  format: "THREE_V_THREE" as const,
  isActive: true,
  deactivatedAt: null,
  version: 0,
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("team list", () => {
  it("shows team format and active player count without a coach count", async () => {
    mocks.listOwnedTeams.mockResolvedValue([team])
    mocks.getOwnedTeamWorkspace.mockResolvedValue({
      team,
      members: [
        { id: "member-1", userId: "coach-1", role: "COACH", isActive: true, deactivatedAt: null },
      ],
      players: [
        { id: "player-1", isActive: true },
        { id: "player-2", isActive: true },
      ],
    })

    render(await TeamPage())

    expect(screen.getByText("3v3")).toBeTruthy()
    expect(screen.getByText("ผู้เล่น 2 คน")).toBeTruthy()
    expect(screen.queryByText(/โค้ช/)).toBeNull()
  })
})
