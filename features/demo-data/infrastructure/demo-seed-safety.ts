import type { DemoCompetitionFixture } from "@/features/competition/infrastructure/demo-competition-fixtures"

import {
  assertDemoEnvironment,
  demoRegistrationScenarios,
  demoSeedUsers,
  demoWorkflowTournaments,
  getDemoBaseTeams,
} from "./demo-workflow-fixtures"

interface ExistingUser {
  id: string
  email: string
  role: string
}

interface ExistingTournament {
  id: string
  organizerId: string
}

interface ExistingTeam {
  id: string
  ownerId: string
}

interface ExistingPlayer {
  id: string
  teamId: string
}

interface ExistingRegistration {
  id: string
  tournamentId: string
  teamId: string
}

export interface BaseDemoSeedSnapshot {
  users: ExistingUser[]
  tournaments: ExistingTournament[]
  teams: ExistingTeam[]
  players: ExistingPlayer[]
  registrations: ExistingRegistration[]
}

export interface CompetitionDemoSeedSnapshot {
  teams: ExistingTeam[]
  registrations: ExistingRegistration[]
  bracket: { id: string; tournamentId: string } | null
  audit: {
    id: string
    actorId: string
    tournamentId: string | null
    entityId: string
  } | null
  entries: Array<{
    id: string
    bracketId: string
    registrationId: string
    teamId: string
  }>
  rounds: Array<{ id: string; bracketId: string }>
  matches: Array<{
    id: string
    tournamentId: string
    bracketId: string
    roundId: string
  }>
  results: Array<{ id: string; matchId: string }>
}

export function createDemoSeedClient<T>(
  environment: NodeJS.ProcessEnv,
  createClient: () => T,
): T {
  assertDemoEnvironment(environment)
  return createClient()
}

export function assertBaseDemoSeedPreflight(
  snapshot: BaseDemoSeedSnapshot,
): void {
  assertCompatible(
    "user",
    snapshot.users,
    demoSeedUsers,
    (actual, expected) =>
      actual.email === expected.email && actual.role === expected.role,
  )
  assertCompatible(
    "tournament",
    snapshot.tournaments,
    demoWorkflowTournaments,
    (actual, expected) => actual.organizerId === expected.organizerId,
  )
  assertCompatible(
    "team",
    snapshot.teams,
    getDemoBaseTeams(),
    (actual, expected) => actual.ownerId === expected.ownerId,
  )
  assertCompatible(
    "player",
    snapshot.players,
    getDemoBaseTeams().flatMap(({ id: teamId, players }) =>
      players.map(({ id }) => ({ id, teamId })),
    ),
    (actual, expected) => actual.teamId === expected.teamId,
  )
  assertCompatible(
    "registration",
    snapshot.registrations,
    demoRegistrationScenarios.map(({ id, tournamentId, team }) => ({
      id,
      tournamentId,
      teamId: team.id,
    })),
    (actual, expected) =>
      actual.tournamentId === expected.tournamentId &&
      actual.teamId === expected.teamId,
  )
}

export function assertCompetitionDemoSeedPreflight(
  fixture: DemoCompetitionFixture,
  snapshot: CompetitionDemoSeedSnapshot,
): void {
  assertCompatible(
    "team",
    snapshot.teams,
    fixture.teams.map(({ id }) => ({ id, ownerId: "team-manager-1" })),
    (actual, expected) => actual.ownerId === expected.ownerId,
  )
  assertCompatible(
    "registration",
    snapshot.registrations,
    fixture.entries.map(({ registrationId, id }) => ({
      id: registrationId,
      tournamentId: fixture.tournamentId,
      teamId: id,
    })),
    (actual, expected) =>
      actual.tournamentId === expected.tournamentId &&
      actual.teamId === expected.teamId,
  )
  assertSingleCompatible(
    "bracket",
    snapshot.bracket,
    { id: fixture.bracketId, tournamentId: fixture.tournamentId },
    (actual, expected) => actual.tournamentId === expected.tournamentId,
  )
  assertSingleCompatible(
    "audit",
    snapshot.audit,
    {
      id: `${fixture.bracketId}-audit`,
      actorId: "admin-1",
      tournamentId: fixture.tournamentId,
      entityId: fixture.bracketId,
    },
    (actual, expected) =>
      actual.actorId === expected.actorId &&
      actual.tournamentId === expected.tournamentId &&
      actual.entityId === expected.entityId,
  )
  assertCompatible(
    "bracket-entry",
    snapshot.entries,
    fixture.entries.map(({ entryId, registrationId, id }) => ({
      id: entryId,
      bracketId: fixture.bracketId,
      registrationId,
      teamId: id,
    })),
    (actual, expected) =>
      actual.bracketId === expected.bracketId &&
      actual.registrationId === expected.registrationId &&
      actual.teamId === expected.teamId,
  )
  assertCompatible(
    "bracket-round",
    snapshot.rounds,
    fixture.rounds.map(({ id }) => ({ id, bracketId: fixture.bracketId })),
    (actual, expected) => actual.bracketId === expected.bracketId,
  )
  assertCompatible(
    "match",
    snapshot.matches,
    fixture.matches.map(({ id, roundId }) => ({
      id,
      tournamentId: fixture.tournamentId,
      bracketId: fixture.bracketId,
      roundId,
    })),
    (actual, expected) =>
      actual.tournamentId === expected.tournamentId &&
      actual.bracketId === expected.bracketId &&
      actual.roundId === expected.roundId,
  )
  assertCompatible(
    "match-result",
    snapshot.results,
    fixture.matches
      .filter(({ status }) => status === "COMPLETED")
      .map(({ id }) => ({ id: `${id}-result`, matchId: id })),
    (actual, expected) => actual.matchId === expected.matchId,
  )
}

export function fixtureBracketDeleteWhere(
  fixture: DemoCompetitionFixture,
): { id: string; tournamentId: string } {
  return { id: fixture.bracketId, tournamentId: fixture.tournamentId }
}

function assertCompatible<TActual extends { id: string }, TExpected extends { id: string }>(
  kind: string,
  actualRows: readonly TActual[],
  expectedRows: readonly TExpected[],
  matches: (actual: TActual, expected: TExpected) => boolean,
): void {
  const expectedById = new Map(expectedRows.map((row) => [row.id, row]))

  for (const actual of actualRows) {
    const expected = expectedById.get(actual.id)
    if (!expected || !matches(actual, expected)) {
      throw new Error(`DEMO_ID_COLLISION:${kind}:${actual.id}`)
    }
  }
}

function assertSingleCompatible<TActual extends { id: string }, TExpected extends { id: string }>(
  kind: string,
  actual: TActual | null,
  expected: TExpected,
  matches: (actual: TActual, expected: TExpected) => boolean,
): void {
  if (actual && (actual.id !== expected.id || !matches(actual, expected))) {
    throw new Error(`DEMO_ID_COLLISION:${kind}:${actual.id}`)
  }
}
