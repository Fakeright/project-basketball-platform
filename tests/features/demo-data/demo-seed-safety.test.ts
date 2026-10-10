import { describe, expect, it } from "vitest"

import { createDemoCompetitionFixtures } from "@/features/competition/infrastructure/demo-competition-fixtures"
import {
  assertBaseDemoSeedPreflight,
  assertCompetitionDemoSeedPreflight,
  createDemoSeedClient,
  fixtureBracketDeleteWhere,
} from "@/features/demo-data/infrastructure/demo-seed-safety"
import {
  demoRegistrationScenarios,
  demoSeedUsers,
  demoWorkflowTournaments,
  getDemoBaseTeams,
} from "@/features/demo-data/infrastructure/demo-workflow-fixtures"

describe("demo seed safety", () => {
  it("blocks production before constructing a database client", () => {
    let constructed = false

    expect(() =>
      createDemoSeedClient({ NODE_ENV: "production" }, () => {
        constructed = true
        return { connected: true }
      }),
    ).toThrow("DEMO_SEED_PRODUCTION_BLOCKED")

    expect(constructed).toBe(false)
  })

  it("rejects a deterministic base team owned by another user", () => {
    expect(() =>
      assertBaseDemoSeedPreflight({
        users: [],
        tournaments: [],
        teams: [{ id: "team-manager-1-team", ownerId: "foreign-owner" }],
        players: [],
        registrations: [],
      }),
    ).toThrow("DEMO_ID_COLLISION:team:team-manager-1-team")
  })

  it("rejects a deterministic competition registration with a foreign parent", () => {
    const fixture = createDemoCompetitionFixtures()[0]
    const registration = fixture?.entries[0]

    expect(fixture).toBeDefined()
    expect(registration).toBeDefined()
    expect(() =>
      assertCompetitionDemoSeedPreflight(fixture!, {
        teams: [],
        registrations: [{
          id: registration!.registrationId,
          tournamentId: "foreign-tournament",
          teamId: registration!.id,
        }],
        bracket: null,
        audit: null,
        entries: [],
        rounds: [],
        matches: [],
        results: [],
      }),
    ).toThrow(
      `DEMO_ID_COLLISION:registration:${registration!.registrationId}`,
    )
  })

  it("preflights a global bracket ID and deletes only its expected tournament row", () => {
    const fixture = createDemoCompetitionFixtures()[0]

    expect(fixture).toBeDefined()
    expect(() =>
      assertCompetitionDemoSeedPreflight(fixture!, {
        teams: [],
        registrations: [],
        bracket: { id: fixture!.bracketId, tournamentId: "foreign-tournament" },
        audit: null,
        entries: [],
        rounds: [],
        matches: [],
        results: [],
      }),
    ).toThrow(`DEMO_ID_COLLISION:bracket:${fixture!.bracketId}`)
    expect(fixtureBracketDeleteWhere(fixture!)).toEqual({
      id: fixture!.bracketId,
      tournamentId: fixture!.tournamentId,
    })
  })

  it("accepts two compatible persisted fixture graphs without relation drift", () => {
    const fixture = createDemoCompetitionFixtures()[0]!
    const baseTeams = getDemoBaseTeams()
    const baseSnapshot = {
      users: demoSeedUsers.map(({ id, email, role }) => ({ id, email, role })),
      tournaments: demoWorkflowTournaments.map(({ id, organizerId }) => ({ id, organizerId })),
      teams: baseTeams.map(({ id, ownerId }) => ({ id, ownerId })),
      players: baseTeams.flatMap(({ id: teamId, players }) =>
        players.map(({ id }) => ({ id, teamId })),
      ),
      registrations: demoRegistrationScenarios.map(({ id, tournamentId, team }) => ({
        id,
        tournamentId,
        teamId: team.id,
      })),
    }
    const competitionSnapshot = {
      teams: fixture.teams.map(({ id }) => ({ id, ownerId: "team-manager-1" })),
      registrations: fixture.entries.map(({ registrationId, id }) => ({
        id: registrationId,
        tournamentId: fixture.tournamentId,
        teamId: id,
      })),
      bracket: { id: fixture.bracketId, tournamentId: fixture.tournamentId },
      audit: {
        id: `${fixture.bracketId}-audit`,
        actorId: "admin-1",
        tournamentId: fixture.tournamentId,
        entityId: fixture.bracketId,
      },
      entries: fixture.entries.map(({ entryId, registrationId, id }) => ({
        id: entryId,
        bracketId: fixture.bracketId,
        registrationId,
        teamId: id,
      })),
      rounds: fixture.rounds.map(({ id }) => ({ id, bracketId: fixture.bracketId })),
      matches: fixture.matches.map(({ id, roundId }) => ({
        id,
        tournamentId: fixture.tournamentId,
        bracketId: fixture.bracketId,
        roundId,
      })),
      results: fixture.matches
        .filter(({ status }) => status === "COMPLETED")
        .map(({ id }) => ({ id: `${id}-result`, matchId: id })),
    }

    for (let run = 0; run < 2; run += 1) {
      expect(() => assertBaseDemoSeedPreflight(baseSnapshot)).not.toThrow()
      expect(() =>
        assertCompetitionDemoSeedPreflight(fixture, competitionSnapshot),
      ).not.toThrow()
    }

    expect(baseSnapshot.registrations).toHaveLength(3)
    expect(competitionSnapshot.entries).toHaveLength(4)
    expect(competitionSnapshot.matches).toHaveLength(3)
  })
})
