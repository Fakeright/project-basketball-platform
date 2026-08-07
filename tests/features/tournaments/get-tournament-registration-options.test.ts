import { describe, expect, it, vi } from "vitest"

import type { TeamRepository } from "@/features/team-management/application/ports/team-repository"
import type { RegistrationRepository } from "@/features/registrations/application/ports/registration-repository"
import type { Tournament } from "@/features/tournaments/domain/tournament"
import {
  getTournamentRegistrationAvailability,
  getTournamentRegistrationOptions,
} from "@/features/tournaments/application/get-tournament-registration-options"
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
        provinceCode: "10",
        province: "กรุงเทพมหานคร",
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

function registrationRepository(): RegistrationRepository {
  return {
    inTransaction: vi.fn(),
    getApplicationContext: vi.fn(),
    findActive: vi.fn(async () => null),
    createPending: vi.fn(),
    findById: vi.fn(),
    cancelWithVersion: vi.fn(),
    findReviewContext: vi.fn(),
    approveWithCapacity: vi.fn(),
    rejectWithVersion: vi.fn(),
    withdrawWithVersion: vi.fn(),
    findTeam: vi.fn(),
    listByTeam: vi.fn(),
    findTournamentForReview: vi.fn(),
    listByTournament: vi.fn(),
  }
}

describe("getTournamentRegistrationOptions", () => {
  it("returns owned teams only for a team manager viewing an open tournament", async () => {
    const teams = teamRepository()
    const registrations = registrationRepository()
    const actor = createTestActor("team-manager-1", "TEAM_MANAGER_COACH")

    const options = await getTournamentRegistrationOptions(
      openTournament,
      actor,
      { teams, registrations },
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
      actor: createTestActor("team-manager-1", "TEAM_MANAGER_COACH"),
      status: "CLOSED" as const,
    },
  ])(
    "does not expose registration options to an ineligible viewer",
    async ({ actor, status }) => {
      const teams = teamRepository()
      const registrations = registrationRepository()

      const options = await getTournamentRegistrationOptions(
        { ...openTournament, status },
        actor,
        { teams, registrations },
      )

      expect(options).toEqual([])
      expect(teams.listByOwner).not.toHaveBeenCalled()
    },
  )

  it("excludes teams that already have an active application after a refresh", async () => {
    const teams = teamRepository()
    const registrations = registrationRepository()
    vi.mocked(registrations.findActive).mockResolvedValue({
      id: "registration-1",
      tournamentId: "tournament-1",
      teamId: "team-1",
      status: "PENDING",
      decisionNote: null,
      decidedAt: null,
      cancelledAt: null,
      withdrawnAt: null,
      version: 0,
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:00.000Z",
    })

    const options = await getTournamentRegistrationOptions(
      openTournament,
      createTestActor("team-manager-1", "TEAM_MANAGER_COACH"),
      { teams, registrations },
    )

    expect(options).toEqual([])
    expect(registrations.findActive).toHaveBeenCalledWith(
      "tournament-1",
      "team-1",
    )
  })

  it("distinguishes no owned teams from teams that already applied", async () => {
    const teams = teamRepository()
    const registrations = registrationRepository()
    vi.mocked(teams.listByOwner).mockResolvedValueOnce([])

    await expect(
      getTournamentRegistrationAvailability(
        openTournament,
        createTestActor("team-manager-1", "TEAM_MANAGER_COACH"),
        { teams, registrations },
      ),
    ).resolves.toEqual({ state: "NO_TEAMS", teams: [] })

    vi.mocked(teams.listByOwner).mockResolvedValueOnce([
      {
        id: "team-1",
        name: "Bangkok Ballers",
        provinceCode: "10",
        province: "กรุงเทพมหานคร",
        ownerId: "team-manager-1",
      },
    ])
    vi.mocked(registrations.findActive).mockResolvedValueOnce({
      id: "registration-1",
      tournamentId: "tournament-1",
      teamId: "team-1",
      status: "PENDING",
      decisionNote: null,
      decidedAt: null,
      cancelledAt: null,
      withdrawnAt: null,
      version: 0,
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:00.000Z",
    })

    await expect(
      getTournamentRegistrationAvailability(
        openTournament,
        createTestActor("team-manager-1", "TEAM_MANAGER_COACH"),
        { teams, registrations },
      ),
    ).resolves.toEqual({ state: "ALREADY_APPLIED", teams: [] })
  })

  it("reports that registration is closed for a Team Manager", async () => {
    await expect(
      getTournamentRegistrationAvailability(
        { ...openTournament, status: "CLOSED" },
        createTestActor("team-manager-1", "TEAM_MANAGER_COACH"),
        {
          teams: teamRepository(),
          registrations: registrationRepository(),
        },
      ),
    ).resolves.toEqual({ state: "CLOSED", teams: [] })
  })
})
