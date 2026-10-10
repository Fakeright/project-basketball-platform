import { describe, expect, it } from "vitest"

import {
  createBaseDemoFixtureData,
  type CompetitionFixtureReplacement,
  type DemoCompetitionFixtureState,
  type DemoSeedPort,
  type DemoSeedTransactionPort,
  runBaseDemoSeed,
  runCompetitionDemoSeed,
} from "@/features/demo-data/infrastructure/demo-seed-orchestration"
import { createDemoCompetitionFixtures } from "@/features/competition/infrastructure/demo-competition-fixtures"
import type {
  BaseDemoSeedSnapshot,
  CompetitionDemoSeedSnapshot,
} from "@/features/demo-data/infrastructure/demo-seed-safety"
import { demoSeedTimestamp } from "@/features/demo-data/infrastructure/demo-workflow-fixtures"

describe("demo seed orchestration", () => {
  it("preflights before applying base fixture rows", async () => {
    const events: string[] = []
    const port = {
      transaction: async <T>(work: (transaction: typeof port) => Promise<T>) =>
        work(port),
      readBaseSnapshot: async () => {
        events.push("read-base")
        return {
          users: [{ id: "admin-1", email: "foreign@example.com", role: "PLATFORM_ADMIN" }],
          tournaments: [],
          teams: [],
          players: [],
          registrations: [],
        }
      },
      applyBaseFixture: async () => {
        events.push("write-base")
      },
      readCompetitionFixtureState: async () => {
        throw new Error("NOT_USED")
      },
      replaceCompetitionFixture: async () => {
        throw new Error("NOT_USED")
      },
    }

    await expect(runBaseDemoSeed(port)).rejects.toThrow(
      "DEMO_ID_COLLISION:user:admin-1",
    )
    expect(events).toEqual(["read-base"])
  })

  it("preflights all competition fixtures before the first replacement", async () => {
    const events: string[] = []
    const port = {
      transaction: async <T>(work: (transaction: typeof port) => Promise<T>) =>
        work(port),
      readBaseSnapshot: async () => {
        throw new Error("NOT_USED")
      },
      applyBaseFixture: async () => {
        throw new Error("NOT_USED")
      },
      readCompetitionFixtureState: async (fixture: { tournamentId: string }) => {
        events.push(`read:${fixture.tournamentId}`)
        return {
          tournament: {
            organizerId: "organizer-1",
            brackets: [],
            registrations: [],
          },
          snapshot: {
            teams: [],
            registrations: [],
            bracket: null,
            audit: null,
            entries: [],
            rounds: [],
            matches: [],
            results: [],
          },
        }
      },
      replaceCompetitionFixture: async (input: { fixture: { tournamentId: string } }) => {
        events.push(`write:${input.fixture.tournamentId}`)
      },
    }

    await runCompetitionDemoSeed(port)

    expect(events).toEqual([
      "read:tournament-closed",
      "read:tournament-ongoing",
      "read:tournament-completed",
      "write:tournament-closed",
      "write:tournament-ongoing",
      "write:tournament-completed",
    ])
  })

  it("rejects every deterministic base and competition ID collision before the first write", async () => {
    const baseCases: Array<{
      expected: string
      set: (port: StatefulFakePort) => void
    }> = [
      {
        expected: "DEMO_ID_COLLISION:user:admin-1",
        set: (port) => {
          port.baseSnapshot.users = [{ id: "admin-1", email: "foreign@example.com", role: "PLATFORM_ADMIN" }]
        },
      },
      {
        expected: "DEMO_ID_COLLISION:tournament:tournament-draft",
        set: (port) => {
          port.baseSnapshot.tournaments = [{ id: "tournament-draft", organizerId: "foreign-owner" }]
        },
      },
      {
        expected: "DEMO_ID_COLLISION:team:team-manager-1-team",
        set: (port) => {
          port.baseSnapshot.teams = [{ id: "team-manager-1-team", ownerId: "foreign-owner" }]
        },
      },
      {
        expected: "DEMO_ID_COLLISION:player:team-manager-1-team-player-1",
        set: (port) => {
          port.baseSnapshot.players = [{ id: "team-manager-1-team-player-1", teamId: "foreign-team" }]
        },
      },
      {
        expected: "DEMO_ID_COLLISION:registration:demo-registration-pending",
        set: (port) => {
          port.baseSnapshot.registrations = [{ id: "demo-registration-pending", tournamentId: "foreign-tournament", teamId: "demo-registration-team-pending" }]
        },
      },
    ]

    for (const testCase of baseCases) {
      const port = new StatefulFakePort()
      testCase.set(port)
      await expect(runBaseDemoSeed(port)).rejects.toThrow(testCase.expected)
      expect(port.writeEvents).toEqual([])
    }

    const fixture = createDemoCompetitionFixtures().find(
      ({ tournamentId }) => tournamentId === "tournament-ongoing",
    )!
    const competitionCases: Array<{
      expected: string
      set: (snapshot: CompetitionDemoSeedSnapshot) => void
    }> = [
      {
        expected: `DEMO_ID_COLLISION:team:${fixture.teams[0]!.id}`,
        set: (snapshot) => { snapshot.teams = [{ id: fixture.teams[0]!.id, ownerId: "foreign-owner" }] },
      },
      {
        expected: `DEMO_ID_COLLISION:registration:${fixture.entries[0]!.registrationId}`,
        set: (snapshot) => { snapshot.registrations = [{ id: fixture.entries[0]!.registrationId, tournamentId: "foreign-tournament", teamId: fixture.entries[0]!.id }] },
      },
      {
        expected: `DEMO_ID_COLLISION:bracket:${fixture.bracketId}`,
        set: (snapshot) => { snapshot.bracket = { id: fixture.bracketId, tournamentId: "foreign-tournament" } },
      },
      {
        expected: `DEMO_ID_COLLISION:audit:${fixture.bracketId}-audit`,
        set: (snapshot) => { snapshot.audit = { id: `${fixture.bracketId}-audit`, actorId: "foreign-admin", tournamentId: fixture.tournamentId, entityId: fixture.bracketId } },
      },
      {
        expected: `DEMO_ID_COLLISION:bracket-entry:${fixture.entries[0]!.entryId}`,
        set: (snapshot) => { snapshot.entries = [{ id: fixture.entries[0]!.entryId, bracketId: "foreign-bracket", registrationId: fixture.entries[0]!.registrationId, teamId: fixture.entries[0]!.id }] },
      },
      {
        expected: `DEMO_ID_COLLISION:bracket-round:${fixture.rounds[0]!.id}`,
        set: (snapshot) => { snapshot.rounds = [{ id: fixture.rounds[0]!.id, bracketId: "foreign-bracket" }] },
      },
      {
        expected: `DEMO_ID_COLLISION:match:${fixture.matches[0]!.id}`,
        set: (snapshot) => { snapshot.matches = [{ id: fixture.matches[0]!.id, tournamentId: fixture.tournamentId, bracketId: fixture.bracketId, roundId: "foreign-round" }] },
      },
      {
        expected: `DEMO_ID_COLLISION:match-result:${fixture.matches.find(({ status }) => status === "COMPLETED")!.id}-result`,
        set: (snapshot) => { const match = fixture.matches.find(({ status }) => status === "COMPLETED")!; snapshot.results = [{ id: `${match.id}-result`, matchId: "foreign-match" }] },
      },
    ]

    for (const testCase of competitionCases) {
      const port = new StatefulFakePort()
      port.setCompetitionSnapshot(fixture, testCase.set)
      await expect(runCompetitionDemoSeed(port)).rejects.toThrow(testCase.expected)
      expect(port.writeEvents).toEqual([])
    }
  })

  it("converges complete fixture tables and timestamps across two runs", async () => {
    const port = new StatefulFakePort()

    await runBaseDemoSeed(port)
    await runCompetitionDemoSeed(port)
    const first = port.completeTables()

    port.corruptConvergentFields()
    await runBaseDemoSeed(port)
    await runCompetitionDemoSeed(port)

    expect(port.completeTables()).toEqual(first)
    const deletePredicates = createDemoCompetitionFixtures().map((fixture) => ({
      id: fixture.bracketId,
      tournamentId: fixture.tournamentId,
    }))
    expect(port.deletePredicates).toEqual([...deletePredicates, ...deletePredicates])
    expect(port.completeTables().timestamps).toEqual([demoSeedTimestamp])
  })
})

class StatefulFakePort implements DemoSeedPort, DemoSeedTransactionPort {
  baseSnapshot: BaseDemoSeedSnapshot = emptyBaseSnapshot()
  writeEvents: string[] = []
  deletePredicates: Array<{ id: string; tournamentId: string }> = []
  private readonly competitionSnapshots = new Map<string, CompetitionDemoSeedSnapshot>()
  private tables = {
    provinces: [] as object[],
    users: [] as object[],
    organizerProfiles: [] as object[],
    tournaments: [] as object[],
    teams: [] as object[],
    players: [] as object[],
    registrations: [] as object[],
    brackets: [] as object[],
    audits: [] as object[],
    entries: [] as object[],
    rounds: [] as object[],
    matches: [] as object[],
    results: [] as object[],
  }

  async transaction<T>(
    operation: (transaction: DemoSeedTransactionPort) => Promise<T>,
  ): Promise<T> {
    return operation(this)
  }

  async readBaseSnapshot(): Promise<BaseDemoSeedSnapshot> {
    return this.baseSnapshot
  }

  async applyBaseFixture(data: ReturnType<typeof createBaseDemoFixtureData>): Promise<void> {
    this.writeEvents.push("base")
    const timestamp = data.timestamp
    this.tables.provinces = data.provinces.map((province) => ({ ...province }))
    this.tables.users = data.users.map((user) => ({ ...user, createdAt: timestamp, updatedAt: timestamp }))
    this.tables.organizerProfiles = data.users
      .filter(({ role }) => role === "TOURNAMENT_ORGANIZER")
      .map(({ id, displayName }) => ({ userId: id, organizationName: displayName, createdAt: timestamp, updatedAt: timestamp }))
    this.tables.tournaments = data.tournaments.map((tournament) => ({ ...tournament, createdAt: timestamp, updatedAt: timestamp }))
    this.tables.teams = data.teams.map((team) => ({
      id: team.id,
      name: team.name,
      provinceCode: team.provinceCode,
      ownerId: team.ownerId,
      format: team.format,
      isActive: true,
      deactivatedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    }))
    this.tables.players = data.teams.flatMap((team) =>
      team.players.map((player) => ({ ...player, teamId: team.id, createdAt: timestamp, updatedAt: timestamp })),
    )
    this.tables.registrations = data.registrations.map(({ team, ...registration }) => ({
      ...registration,
      teamId: team.id,
      createdAt: timestamp,
      updatedAt: timestamp,
      cancelledAt: null,
      withdrawnAt: null,
    }))
    this.baseSnapshot = {
      users: data.users.map(({ id, email, role }) => ({ id, email, role })),
      tournaments: data.tournaments.map(({ id, organizerId }) => ({ id, organizerId })),
      teams: data.teams.map(({ id, ownerId }) => ({ id, ownerId })),
      players: data.teams.flatMap(({ id: teamId, players }) => players.map(({ id }) => ({ id, teamId }))),
      registrations: data.registrations.map(({ id, tournamentId, team }) => ({ id, tournamentId, teamId: team.id })),
    }
  }

  async readCompetitionFixtureState(
    fixture: Parameters<DemoSeedTransactionPort["readCompetitionFixtureState"]>[0],
  ): Promise<DemoCompetitionFixtureState> {
    const snapshot = this.competitionSnapshots.get(fixture.tournamentId) ?? emptyCompetitionSnapshot()
    return {
      tournament: {
        organizerId: "organizer-1",
        provinceCode: "10",
        format: "FIVE_V_FIVE",
        brackets: this.tables.brackets
          .filter((row) => hasString(row, "tournamentId", fixture.tournamentId))
          .map((row) => ({ id: stringValue(row, "id") })),
        registrations: this.tables.registrations
          .filter((row) => hasString(row, "tournamentId", fixture.tournamentId))
          .map((row) => ({ id: stringValue(row, "id") })),
      },
      snapshot,
    }
  }

  async replaceCompetitionFixture(input: CompetitionFixtureReplacement): Promise<void> {
    this.writeEvents.push(`competition:${input.fixture.tournamentId}`)
    this.deletePredicates.push(input.deleteWhere)
    const { fixture, timestamp } = input
    const deletedBracket = this.tables.brackets.find((row) =>
      hasString(row, "id", input.deleteWhere.id) &&
      hasString(row, "tournamentId", input.deleteWhere.tournamentId),
    )

    if (deletedBracket) {
      const deletedMatchIds = new Set(
        this.tables.matches
          .filter((row) => hasString(row, "bracketId", fixture.bracketId))
          .map((row) => stringValue(row, "id")),
      )
      this.tables.brackets = this.tables.brackets.filter((row) => row !== deletedBracket)
      this.tables.entries = this.tables.entries.filter((row) => !hasString(row, "bracketId", fixture.bracketId))
      this.tables.rounds = this.tables.rounds.filter((row) => !hasString(row, "bracketId", fixture.bracketId))
      this.tables.matches = this.tables.matches.filter((row) => !hasString(row, "bracketId", fixture.bracketId))
      this.tables.results = this.tables.results.filter((row) => !deletedMatchIds.has(stringValue(row, "matchId")))
    }
    this.tables.teams = mergeRows(this.tables.teams, fixture.teams.map((team) => ({
      id: team.id,
      name: team.name,
      provinceCode: input.tournament.provinceCode,
      ownerId: "team-manager-1",
      format: input.tournament.format,
      isActive: true,
      deactivatedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })))
    this.tables.registrations = mergeRows(this.tables.registrations, fixture.entries.map((entry) => ({
      id: entry.registrationId,
      tournamentId: fixture.tournamentId,
      teamId: entry.id,
      status: "APPROVED",
      decisionNote: "ข้อมูลตัวอย่างสำหรับทดสอบสายการแข่งขัน",
      createdAt: timestamp,
      updatedAt: timestamp,
      decidedAt: timestamp,
      cancelledAt: null,
      withdrawnAt: null,
    })))
    this.tables.brackets.push({
      id: fixture.bracketId,
      tournamentId: fixture.tournamentId,
      status: fixture.bracketStatus,
      mode: "SYSTEM_GENERATED",
      generationMethod: fixture.generationMethod,
      entriesLockedAt: timestamp,
      publishedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    this.tables.audits = mergeRows(this.tables.audits, [{
      id: `${fixture.bracketId}-audit`,
      actorId: "admin-1",
      tournamentId: fixture.tournamentId,
      action: "DEMO_COMPETITION_SEEDED",
      entityType: "Bracket",
      entityId: fixture.bracketId,
      afterJson: {
        teamCount: fixture.teams.length,
        matchCount: fixture.matches.length,
        completedMatchCount: fixture.matches.filter(({ status }) => status === "COMPLETED").length,
      },
      createdAt: timestamp,
    }])
    this.tables.entries.push(...fixture.entries.map((entry) => ({
      id: entry.entryId,
      bracketId: fixture.bracketId,
      registrationId: entry.registrationId,
      teamId: entry.id,
      teamNameSnapshot: entry.name,
      seed: entry.seed,
      drawPosition: entry.seed,
      startRoundSequence: entry.startRoundSequence,
      createdAt: timestamp,
    })))
    this.tables.rounds.push(...fixture.rounds.map((round) => ({ ...round, bracketId: fixture.bracketId })))
    this.tables.matches.push(...fixture.matches.map((match) => ({
      id: match.id,
      tournamentId: fixture.tournamentId,
      bracketId: fixture.bracketId,
      roundId: match.roundId,
      sequence: match.sequence,
      purpose: match.purpose,
      scheduledAt: match.scheduledAt,
      court: match.court,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      winnerTeamId: match.winnerTeamId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status,
      nextMatchId: match.nextMatchId,
      nextSlot: match.nextSlot,
      updatedAt: timestamp,
    })))
    this.tables.results.push(...fixture.matches
      .filter(({ status }) => status === "COMPLETED")
      .map((match) => ({
        id: `${match.id}-result`,
        matchId: match.id,
        confirmedBy: "admin-1",
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        winnerTeamId: match.winnerTeamId,
        confirmedAt: timestamp,
      })))
    this.competitionSnapshots.set(fixture.tournamentId, completeCompetitionSnapshot(fixture))
  }

  setCompetitionSnapshot(
    fixture: Parameters<DemoSeedTransactionPort["readCompetitionFixtureState"]>[0],
    mutate: (snapshot: CompetitionDemoSeedSnapshot) => void,
  ): void {
    const snapshot = emptyCompetitionSnapshot()
    mutate(snapshot)
    this.competitionSnapshots.set(fixture.tournamentId, snapshot)
  }

  corruptConvergentFields(): void {
    this.tables.users = this.tables.users.map((row) => ({ ...row, displayName: "stale", updatedAt: "2000-01-01T00:00:00.000Z" }))
    this.tables.teams = this.tables.teams.map((row) => ({ ...row, name: "stale", updatedAt: "2000-01-01T00:00:00.000Z" }))
  }

  completeTables() {
    const tables = Object.fromEntries(
      Object.entries(this.tables).map(([name, rows]) => [name, [...rows].sort((left, right) => stringValue(left, "id").localeCompare(stringValue(right, "id")))]),
    )
    return {
      ...tables,
      timestamps: uniqueStrings(
        Object.values(tables).flatMap((rows) => rows.flatMap((row) => [
          stringValue(row, "createdAt", ""),
          stringValue(row, "updatedAt", ""),
          stringValue(row, "publishedAt", ""),
          stringValue(row, "confirmedAt", ""),
        ]).filter(Boolean)),
      ),
    }
  }
}

function emptyBaseSnapshot(): BaseDemoSeedSnapshot {
  return { users: [], tournaments: [], teams: [], players: [], registrations: [] }
}

function emptyCompetitionSnapshot(): CompetitionDemoSeedSnapshot {
  return { teams: [], registrations: [], bracket: null, audit: null, entries: [], rounds: [], matches: [], results: [] }
}

function completeCompetitionSnapshot(
  fixture: Parameters<DemoSeedTransactionPort["readCompetitionFixtureState"]>[0],
): CompetitionDemoSeedSnapshot {
  return {
    teams: fixture.teams.map(({ id }) => ({ id, ownerId: "team-manager-1" })),
    registrations: fixture.entries.map(({ registrationId, id }) => ({ id: registrationId, tournamentId: fixture.tournamentId, teamId: id })),
    bracket: { id: fixture.bracketId, tournamentId: fixture.tournamentId },
    audit: { id: `${fixture.bracketId}-audit`, actorId: "admin-1", tournamentId: fixture.tournamentId, entityId: fixture.bracketId },
    entries: fixture.entries.map(({ entryId, registrationId, id }) => ({ id: entryId, bracketId: fixture.bracketId, registrationId, teamId: id })),
    rounds: fixture.rounds.map(({ id }) => ({ id, bracketId: fixture.bracketId })),
    matches: fixture.matches.map(({ id, roundId }) => ({ id, tournamentId: fixture.tournamentId, bracketId: fixture.bracketId, roundId })),
    results: fixture.matches.filter(({ status }) => status === "COMPLETED").map(({ id }) => ({ id: `${id}-result`, matchId: id })),
  }
}

function mergeRows(rows: object[], replacements: object[]): object[] {
  const replacementIds = new Set(replacements.map((row) => stringValue(row, "id")))
  return [...rows.filter((row) => !replacementIds.has(stringValue(row, "id"))), ...replacements]
}

function hasString(row: object, key: string, expected: string): boolean {
  return stringValue(row, key) === expected
}

function stringValue(row: object, key: string, fallback = "missing"): string {
  const value = Reflect.get(row, key)
  return typeof value === "string" ? value : fallback
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)].sort()
}
