import { describe, expect, it, vi } from "vitest"

import type { TeamRepository } from "@/features/team-management/application/ports/team-repository"
import type { Tournament } from "@/features/tournaments/domain/tournament"
import { getTournamentRegistrationOptions } from "@/features/tournaments/application/get-tournament-registration-options"
import { createTestActor } from "@/tests/fixtures/actor"

const openTournament = {
  id: "tournament-1",
  status: "OPEN",
} as Tournament

function teamRepository(): TeamRepository {
  return {
    inTransaction: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findById: vi.fn(),
    listByOwner: vi.fn(async () => [
      {
        id: "team-1",
        name: "Bangkok Ballers",
        province: "Bangkok",
        ownerId: "team-manager-1",
      },
    ]),
    findUser: vi.fn(),
    listUsersByRoles: vi.fn(),
    listActiveMembers: vi.fn(),
    addMember: vi.fn(),
    deactivateMember: vi.fn(),
    appendAuditEvent: vi.fn(),
  }
}

describe("getTournamentRegistrationOptions", () => {
  it("returns owned teams only for a team manager viewing an open tournament", async () => {
    const teams = teamRepository()
    const actor = createTestActor("team-manager-1", "TEAM_MANAGER")

    const options = await getTournamentRegistrationOptions(
      openTournament,
      actor,
      { teams },
    )

    expect(options).toEqual([
      { id: "team-1", name: "Bangkok Ballers" },
    ])
    expect(teams.listByOwner).toHaveBeenCalledWith("team-manager-1")
  })

  it.each([
    { actor: null, status: "OPEN" as const },
    {
      actor: createTestActor("admin-1", "PLATFORM_ADMIN"),
      status: "OPEN" as const,
    },
    {
      actor: createTestActor("team-manager-1", "TEAM_MANAGER"),
      status: "CLOSED" as const,
    },
  ])(
    "does not expose registration options to an ineligible viewer",
    async ({ actor, status }) => {
      const teams = teamRepository()

      const options = await getTournamentRegistrationOptions(
        { ...openTournament, status },
        actor,
        { teams },
      )

      expect(options).toEqual([])
      expect(teams.listByOwner).not.toHaveBeenCalled()
    },
  )
})
