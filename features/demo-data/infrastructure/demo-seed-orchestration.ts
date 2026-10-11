import { createDemoCompetitionFixtures, type DemoCompetitionFixture } from "@/features/competition/infrastructure/demo-competition-fixtures"
import { thaiProvinces } from "@/features/provinces/domain/thai-provinces"
import type { TournamentFormat } from "@/lib/generated/prisma/client"

import {
  demoRegistrationScenarios,
  demoSeedTimestamp,
  demoSeedUsers,
  demoWorkflowTournaments,
  getDemoBaseTeams,
} from "./demo-workflow-fixtures"
import {
  assertBaseDemoSeedPreflight,
  assertCompetitionDemoSeedPreflight,
  fixtureBracketDeleteWhere,
  type BaseDemoSeedSnapshot,
  type CompetitionDemoSeedSnapshot,
} from "./demo-seed-safety"

export interface DemoCompetitionFixtureState {
  tournament: {
    organizerId: string
    provinceCode: string
    format: TournamentFormat
    brackets: Array<{ id: string }>
    registrations: Array<{ id: string }>
  }
  snapshot: CompetitionDemoSeedSnapshot
}

export interface BaseDemoFixtureData {
  timestamp: string
  provinces: typeof thaiProvinces
  users: typeof demoSeedUsers
  tournaments: typeof demoWorkflowTournaments
  teams: ReturnType<typeof getDemoBaseTeams>
  registrations: typeof demoRegistrationScenarios
}

export interface CompetitionFixtureReplacement {
  fixture: DemoCompetitionFixture
  tournament: DemoCompetitionFixtureState["tournament"]
  deleteWhere: { id: string; tournamentId: string }
  timestamp: string
}

export interface DemoSeedTransactionPort {
  readBaseSnapshot(): Promise<BaseDemoSeedSnapshot>
  applyBaseFixture(data: BaseDemoFixtureData): Promise<void>
  readCompetitionFixtureState(
    fixture: DemoCompetitionFixture,
  ): Promise<DemoCompetitionFixtureState>
  replaceCompetitionFixture(
    input: CompetitionFixtureReplacement,
  ): Promise<void>
}

export interface DemoSeedPort {
  transaction<T>(
    operation: (transaction: DemoSeedTransactionPort) => Promise<T>,
  ): Promise<T>
}

export async function runBaseDemoSeed(port: DemoSeedPort): Promise<void> {
  await port.transaction(async (transaction) => {
    assertBaseDemoSeedPreflight(await transaction.readBaseSnapshot())
    await transaction.applyBaseFixture(createBaseDemoFixtureData())
  })
}

export async function runCompetitionDemoSeed(port: DemoSeedPort): Promise<void> {
  const fixtures = createDemoCompetitionFixtures()

  await port.transaction(async (transaction) => {
    const preflightedFixtures: Array<{
      fixture: DemoCompetitionFixture
      state: DemoCompetitionFixtureState
    }> = []

    for (const fixture of fixtures) {
      preflightedFixtures.push({
        fixture,
        state: await transaction.readCompetitionFixtureState(fixture),
      })
    }

    for (const { fixture, state } of preflightedFixtures) {
      assertBaseDemoSeedPreflight({
        users: [],
        tournaments: [{ id: fixture.tournamentId, organizerId: state.tournament.organizerId }],
        teams: [],
        players: [],
        registrations: [],
      })
      assertCompetitionDemoSeedPreflight(fixture, state.snapshot)
      assertOnlyDemoRows(
        state.tournament.brackets.map(({ id }) => id),
        fixture.bracketId,
        fixture.tournamentId,
      )
      assertOnlyDemoRows(
        state.tournament.registrations.map(({ id }) => id),
        fixture.entries.map(({ registrationId }) => registrationId),
        fixture.tournamentId,
      )
    }

    for (const { fixture, state } of preflightedFixtures) {
      await transaction.replaceCompetitionFixture({
        fixture,
        tournament: state.tournament,
        deleteWhere: fixtureBracketDeleteWhere(fixture),
        timestamp: demoSeedTimestamp,
      })
    }
  })
}

export function createBaseDemoFixtureData(): BaseDemoFixtureData {
  return {
    timestamp: demoSeedTimestamp,
    provinces: thaiProvinces,
    users: demoSeedUsers,
    tournaments: demoWorkflowTournaments,
    teams: getDemoBaseTeams(),
    registrations: demoRegistrationScenarios,
  }
}

function assertOnlyDemoRows(
  actualIds: string[],
  allowedIds: string | string[],
  tournamentId: string,
): void {
  const allowed = new Set(
    Array.isArray(allowedIds) ? allowedIds : [allowedIds],
  )
  const unexpectedIds = actualIds.filter((id) => !allowed.has(id))

  if (unexpectedIds.length > 0) {
    throw new Error(`DEMO_TARGET_HAS_USER_DATA:${tournamentId}`)
  }
}
