import { describe, expect, it, vi } from "vitest"

import type { TournamentCompetitionLifecycleContext } from "@/features/competition/domain/competition"
import { listOwnedTournamentWorkflows } from "@/features/tournament-operations/application/list-owned-tournament-workflows"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"
import { createTestActor } from "@/tests/fixtures/actor"

const organizerActor = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const teamManagerActor = createTestActor("manager-1", "TEAM_MANAGER_COACH")
const tournament: TournamentOperation = {
  id: "t-1",
  organizerId: organizerActor.id,
  title: "COURTSIDE Bracket Cup",
  description: "การแข่งขันตัวอย่าง",
  rules: "กติกามาตรฐาน",
  provinceCode: "10",
  province: "กรุงเทพมหานคร",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE",
  ageGroup: "Open",
  startsAt: "2026-11-15T02:00:00.000Z",
  endsAt: "2026-11-16T11:00:00.000Z",
  registrationDeadline: "2026-11-01T16:59:00.000Z",
  capacity: 8,
  status: "REGISTRATION_CLOSED",
  governanceStatus: "ACTIVE",
  governanceReason: null,
  governanceUpdatedAt: null,
  version: 2,
  createdAt: "2026-08-24T01:00:00.000Z",
  updatedAt: "2026-08-24T02:00:00.000Z",
}
const closedContext: TournamentCompetitionLifecycleContext = {
  tournamentId: tournament.id,
  organizerId: organizerActor.id,
  status: "REGISTRATION_CLOSED",
  tournamentGovernanceStatus: "ACTIVE",
  version: tournament.version,
  activeBracket: null,
}

describe("listOwnedTournamentWorkflows", () => {
  it("lists only the current organizer tournaments", async () => {
    const listByOrganizer = vi.fn(async () => [tournament])
    const findCompetitionLifecycleContext = vi.fn(async () => closedContext)

    await expect(
      listOwnedTournamentWorkflows(organizerActor, {
        tournaments: { listByOrganizer, findCompetitionLifecycleContext },
      }),
    ).resolves.toEqual([
      {
        tournament,
        competitionIssues: ["BRACKET_MISSING"],
      },
    ])
    expect(listByOrganizer).toHaveBeenCalledWith(organizerActor.id)
    expect(findCompetitionLifecycleContext).toHaveBeenCalledWith(tournament.id)
  })

  it("rejects a team manager before reading the repository", async () => {
    const listByOrganizer = vi.fn()
    const findCompetitionLifecycleContext = vi.fn()

    await expect(
      listOwnedTournamentWorkflows(teamManagerActor, {
        tournaments: { listByOrganizer, findCompetitionLifecycleContext },
      }),
    ).rejects.toThrow("FORBIDDEN")
    expect(listByOrganizer).not.toHaveBeenCalled()
    expect(findCompetitionLifecycleContext).not.toHaveBeenCalled()
  })
})
