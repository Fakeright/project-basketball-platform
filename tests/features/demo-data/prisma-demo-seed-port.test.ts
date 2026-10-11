import { describe, expect, it } from "vitest"

import { createDemoCompetitionFixtures } from "@/features/competition/infrastructure/demo-competition-fixtures"
import {
  createBaseDemoFixtureData,
  runBaseDemoSeed,
  runCompetitionDemoSeed,
} from "@/features/demo-data/infrastructure/demo-seed-orchestration"
import { createPrismaDemoSeedPort } from "@/features/demo-data/infrastructure/prisma-demo-seed-port"
import { thaiProvinces } from "@/features/provinces/domain/thai-provinces"
import type { PrismaClient } from "@/lib/generated/prisma/client"

type Row = Record<string, unknown>
type TableName =
  | "provinces"
  | "users"
  | "organizerProfiles"
  | "tournaments"
  | "teams"
  | "players"
  | "registrations"
  | "brackets"
  | "entries"
  | "rounds"
  | "matches"
  | "results"
  | "audits"

interface QueryCall {
  key: string
  args: unknown
}

interface WriteCall {
  key: string
  args: unknown
}

type QueryResponder = (args: unknown) => unknown

describe("Prisma demo seed port", () => {
  it("uses production ID/email, ID/slug, and dependent lookups before base writes", async () => {
    const base = createBaseDemoFixtureData()
    const cases: Array<{
      query: string
      row: Row
      error: string
      targetId: string
    }> = [
      {
        query: "user.findMany",
        row: { id: "foreign-user-by-email", email: base.users[0].email, role: base.users[0].role },
        error: "DEMO_ID_COLLISION:user:foreign-user-by-email",
        targetId: base.users[0].id,
      },
      {
        query: "tournament.findMany",
        row: { id: "foreign-tournament-by-slug", organizerId: "organizer-1" },
        error: "DEMO_ID_COLLISION:tournament:foreign-tournament-by-slug",
        targetId: base.tournaments[0].id,
      },
      {
        query: "team.findMany",
        row: { id: base.teams[0].id, ownerId: "foreign-owner" },
        error: `DEMO_ID_COLLISION:team:${base.teams[0].id}`,
        targetId: base.teams[0].id,
      },
      {
        query: "teamPlayer.findMany",
        row: { id: base.teams[0].players[0].id, teamId: "foreign-team" },
        error: `DEMO_ID_COLLISION:player:${base.teams[0].players[0].id}`,
        targetId: base.teams[0].players[0].id,
      },
      {
        query: "registration.findMany",
        row: {
          id: base.registrations[0].id,
          tournamentId: "foreign-tournament",
          teamId: base.registrations[0].team.id,
        },
        error: `DEMO_ID_COLLISION:registration:${base.registrations[0].id}`,
        targetId: base.registrations[0].id,
      },
    ]

    for (const testCase of cases) {
      const prisma = new RecordingPrisma()
      prisma.setQueryResponse(testCase.query, () => [testCase.row])

      await expect(runBaseDemoSeed(createPort(prisma))).rejects.toThrow(testCase.error)

      expect(prisma.writeCalls).toEqual([])
      expect(prisma.queryCalls.map(({ key }) => key)).toEqual([
        "user.findMany",
        "tournament.findMany",
        "team.findMany",
        "teamPlayer.findMany",
        "registration.findMany",
      ])
      expect(prisma.queryContainingId(testCase.query, testCase.targetId)).toBeDefined()
    }

    const lookupPrisma = new RecordingPrisma()
    await runBaseDemoSeed(createPort(lookupPrisma))
    expect(lookupPrisma.queryCallsFor("user.findMany")[0]?.args).toMatchObject({
      where: {
        OR: [
          { id: { in: base.users.map(({ id }) => id) } },
          { email: { in: base.users.map(({ email }) => email) } },
        ],
      },
    })
    expect(lookupPrisma.queryCallsFor("tournament.findMany")[0]?.args).toMatchObject({
      where: {
        OR: [
          { id: { in: base.tournaments.map(({ id }) => id) } },
          { slug: { in: base.tournaments.map(({ slug }) => slug) } },
        ],
      },
    })
  })

  it("uses every competition parent lookup before the first production replacement", async () => {
    const fixtures = createDemoCompetitionFixtures()
    const standardFixture = fixtures[0]!
    const resultFixture = fixtures[1]!
    const completedMatch = resultFixture.matches.find(
      ({ status }) => status === "COMPLETED",
    )!
    const cases: Array<{
      query: string
      row: Row
      error: string
      targetId: string
    }> = [
      {
        query: "tournament.findUnique",
        row: { id: standardFixture.tournamentId, slug: "foreign-slug", organizerId: "organizer-1", provinceCode: "10", format: "FIVE_V_FIVE", brackets: [], registrations: [] },
        error: `DEMO_TOURNAMENT_NOT_FOUND:${standardFixture.tournamentId}`,
        targetId: standardFixture.tournamentId,
      },
      {
        query: "team.findMany",
        row: { id: standardFixture.teams[0].id, ownerId: "foreign-owner" },
        error: `DEMO_ID_COLLISION:team:${standardFixture.teams[0].id}`,
        targetId: standardFixture.teams[0].id,
      },
      {
        query: "registration.findMany",
        row: { id: standardFixture.entries[0].registrationId, tournamentId: "foreign-tournament", teamId: standardFixture.entries[0].id },
        error: `DEMO_ID_COLLISION:registration:${standardFixture.entries[0].registrationId}`,
        targetId: standardFixture.entries[0].registrationId,
      },
      {
        query: "bracket.findUnique",
        row: { id: standardFixture.bracketId, tournamentId: "foreign-tournament" },
        error: `DEMO_ID_COLLISION:bracket:${standardFixture.bracketId}`,
        targetId: standardFixture.bracketId,
      },
      {
        query: "auditLog.findUnique",
        row: { id: `${standardFixture.bracketId}-audit`, actorId: "foreign-admin", tournamentId: standardFixture.tournamentId, entityId: standardFixture.bracketId },
        error: `DEMO_ID_COLLISION:audit:${standardFixture.bracketId}-audit`,
        targetId: `${standardFixture.bracketId}-audit`,
      },
      {
        query: "bracketEntry.findMany",
        row: { id: standardFixture.entries[0].entryId, bracketId: "foreign-bracket", registrationId: standardFixture.entries[0].registrationId, teamId: standardFixture.entries[0].id },
        error: `DEMO_ID_COLLISION:bracket-entry:${standardFixture.entries[0].entryId}`,
        targetId: standardFixture.entries[0].entryId,
      },
      {
        query: "bracketRound.findMany",
        row: { id: standardFixture.rounds[0].id, bracketId: "foreign-bracket" },
        error: `DEMO_ID_COLLISION:bracket-round:${standardFixture.rounds[0].id}`,
        targetId: standardFixture.rounds[0].id,
      },
      {
        query: "match.findMany",
        row: { id: standardFixture.matches[0].id, tournamentId: standardFixture.tournamentId, bracketId: standardFixture.bracketId, roundId: "foreign-round" },
        error: `DEMO_ID_COLLISION:match:${standardFixture.matches[0].id}`,
        targetId: standardFixture.matches[0].id,
      },
      {
        query: "matchResult.findMany",
        row: { id: `${completedMatch.id}-result`, matchId: "foreign-match" },
        error: `DEMO_ID_COLLISION:match-result:${completedMatch.id}-result`,
        targetId: `${completedMatch.id}-result`,
      },
    ]

    for (const testCase of cases) {
      const prisma = new RecordingPrisma()
      await runBaseDemoSeed(createPort(prisma))
      prisma.clearCalls()
      prisma.setQueryResponse(testCase.query, (args) =>
        queryContainsId(args, testCase.targetId) ? [testCase.row] : null,
      )

      await expect(runCompetitionDemoSeed(createPort(prisma))).rejects.toThrow(testCase.error)

      expect(prisma.writeCalls).toEqual([])
      expect(prisma.queryContainingId(testCase.query, testCase.targetId)).toBeDefined()
    }
  })

  it("persists the independently specified fixture tables and converges every writable row", async () => {
    const prisma = new RecordingPrisma()
    const port = createPort(prisma)

    await runBaseDemoSeed(port)
    await runCompetitionDemoSeed(port)
    expectExactFixtureTables(prisma.rows())

    prisma.staleWritableValues()
    await runBaseDemoSeed(port)
    await runCompetitionDemoSeed(port)

    expectExactFixtureTables(prisma.rows())
    const expectedDeletes = createDemoCompetitionFixtures().map((fixture) => ({
      where: { id: fixture.bracketId, tournamentId: fixture.tournamentId },
    }))
    expect(prisma.writeCallsFor("bracket.deleteMany").map(({ args }) => args)).toEqual([
      ...expectedDeletes,
      ...expectedDeletes,
    ])

    const tables = prisma.rows()
    expect(tables.registrations.every(({ id, decidedAt }) =>
      id === "demo-registration-pending"
        ? decidedAt === null
        : decidedAt === "2026-08-24T03:00:00.000Z",
    )).toBe(true)
    expect(tables.brackets.map(({ entriesLockedAt, publishedAt }) => ({
      entriesLockedAt,
      publishedAt,
    }))).toEqual(Array(3).fill({
      entriesLockedAt: "2026-08-24T03:00:00.000Z",
      publishedAt: "2026-08-24T03:00:00.000Z",
    }))
  })
})

class RecordingPrisma {
  queryCalls: QueryCall[] = []
  writeCalls: WriteCall[] = []
  private readonly queryResponses = new Map<string, QueryResponder>()
  private readonly tables: Record<TableName, Map<string, Row>> = {
    provinces: new Map(), users: new Map(), organizerProfiles: new Map(), tournaments: new Map(), teams: new Map(), players: new Map(), registrations: new Map(), brackets: new Map(), entries: new Map(), rounds: new Map(), matches: new Map(), results: new Map(), audits: new Map(),
  }

  readonly user = { findMany: (args: unknown) => this.findMany("users", "user.findMany", args), upsert: (args: unknown) => this.upsert("users", "user.upsert", args) }
  readonly province = { upsert: (args: unknown) => this.upsert("provinces", "province.upsert", args) }
  readonly organizerProfile = { upsert: (args: unknown) => this.upsert("organizerProfiles", "organizerProfile.upsert", args) }
  readonly tournament = { findMany: (args: unknown) => this.findMany("tournaments", "tournament.findMany", args), findUnique: (args: unknown) => this.findUnique("tournaments", "tournament.findUnique", args), upsert: (args: unknown) => this.upsert("tournaments", "tournament.upsert", args) }
  readonly team = { findMany: (args: unknown) => this.findMany("teams", "team.findMany", args), upsert: (args: unknown) => this.upsert("teams", "team.upsert", args) }
  readonly teamPlayer = { findMany: (args: unknown) => this.findMany("players", "teamPlayer.findMany", args), upsert: (args: unknown) => this.upsert("players", "teamPlayer.upsert", args) }
  readonly registration = { findMany: (args: unknown) => this.findMany("registrations", "registration.findMany", args), upsert: (args: unknown) => this.upsert("registrations", "registration.upsert", args) }
  readonly bracket = { findUnique: (args: unknown) => this.findUnique("brackets", "bracket.findUnique", args), deleteMany: (args: unknown) => this.deleteBrackets(args), create: (args: unknown) => this.create("brackets", "bracket.create", args) }
  readonly bracketEntry = { findMany: (args: unknown) => this.findMany("entries", "bracketEntry.findMany", args), createMany: (args: unknown) => this.createMany("entries", "bracketEntry.createMany", args) }
  readonly bracketRound = { findMany: (args: unknown) => this.findMany("rounds", "bracketRound.findMany", args), createMany: (args: unknown) => this.createMany("rounds", "bracketRound.createMany", args) }
  readonly match = { findMany: (args: unknown) => this.findMany("matches", "match.findMany", args), createMany: (args: unknown) => this.createMany("matches", "match.createMany", args), update: (args: unknown) => this.update("matches", "match.update", args) }
  readonly matchResult = { findMany: (args: unknown) => this.findMany("results", "matchResult.findMany", args), create: (args: unknown) => this.create("results", "matchResult.create", args) }
  readonly auditLog = { findUnique: (args: unknown) => this.findUnique("audits", "auditLog.findUnique", args), upsert: (args: unknown) => this.upsert("audits", "auditLog.upsert", args) }

  async $transaction<T>(operation: (transaction: object) => Promise<T>): Promise<T> { return operation(this) }

  setQueryResponse(key: string, response: QueryResponder): void { this.queryResponses.set(key, response) }
  clearCalls(): void { this.queryCalls = []; this.writeCalls = [] }
  queryCallsFor(key: string): QueryCall[] { return this.queryCalls.filter((call) => call.key === key) }
  writeCallsFor(key: string): WriteCall[] { return this.writeCalls.filter((call) => call.key === key) }
  queryContainingId(key: string, id: string): QueryCall | undefined { return this.queryCallsFor(key).find(({ args }) => queryContainsId(args, id)) }
  rows(): Record<TableName, Row[]> { return Object.fromEntries(Object.entries(this.tables).map(([name, rows]) => [name, [...rows.values()].sort((left, right) => rowKey(left).localeCompare(rowKey(right)))])) as Record<TableName, Row[]> }

  staleWritableValues(): void {
    this.patchRows("provinces", { nameTh: "stale", nameEn: "stale" })
    this.patchRows("users", { displayName: "stale", createdAt: "2000-01-01T00:00:00.000Z", updatedAt: "2000-01-01T00:00:00.000Z" })
    this.patchRows("organizerProfiles", { organizationName: "stale", createdAt: "2000-01-01T00:00:00.000Z", updatedAt: "2000-01-01T00:00:00.000Z" })
    this.patchRows("tournaments", { title: "stale", createdAt: "2000-01-01T00:00:00.000Z", updatedAt: "2000-01-01T00:00:00.000Z" })
    this.patchRows("teams", { name: "stale", isActive: false, deactivatedAt: "2000-01-01T00:00:00.000Z", createdAt: "2000-01-01T00:00:00.000Z", updatedAt: "2000-01-01T00:00:00.000Z" })
    this.patchRows("players", { firstName: "stale", isActive: false, deactivatedAt: "2000-01-01T00:00:00.000Z", createdAt: "2000-01-01T00:00:00.000Z", updatedAt: "2000-01-01T00:00:00.000Z" })
    this.patchRows("registrations", { status: "PENDING", decisionNote: "stale", decidedAt: "2000-01-01T00:00:00.000Z", cancelledAt: "2000-01-01T00:00:00.000Z", withdrawnAt: "2000-01-01T00:00:00.000Z", createdAt: "2000-01-01T00:00:00.000Z", updatedAt: "2000-01-01T00:00:00.000Z" })
    this.patchRows("brackets", { status: "DRAFT", entriesLockedAt: "2000-01-01T00:00:00.000Z", publishedAt: "2000-01-01T00:00:00.000Z", createdAt: "2000-01-01T00:00:00.000Z", updatedAt: "2000-01-01T00:00:00.000Z" })
    this.patchRows("entries", { teamNameSnapshot: "stale", seed: 99, drawPosition: 99, startRoundSequence: 99, createdAt: "2000-01-01T00:00:00.000Z" })
    this.patchRows("rounds", { name: "stale", sequence: 99 })
    this.patchRows("matches", { purpose: "STANDARD", scheduledAt: "2000-01-01T00:00:00.000Z", court: "stale", homeScore: 0, awayScore: 0, status: "SCHEDULED", updatedAt: "2000-01-01T00:00:00.000Z" })
    this.patchRows("results", { confirmedBy: "stale", homeScore: 0, awayScore: 0, winnerTeamId: "stale", confirmedAt: "2000-01-01T00:00:00.000Z" })
    this.patchRows("audits", { action: "stale", entityType: "stale", afterJson: { stale: true }, createdAt: "2000-01-01T00:00:00.000Z" })
  }

  private async findMany(table: TableName, key: string, args: unknown): Promise<Row[]> {
    this.recordQuery(key, args)
    const response = this.queryResponses.get(key)?.(args)
    if (response !== null && response !== undefined) return normalizeRows(response)
    return this.filterRows(table, args)
  }

  private async findUnique(table: TableName, key: string, args: unknown): Promise<Row | null> {
    this.recordQuery(key, args)
    const response = this.queryResponses.get(key)?.(args)
    if (response !== null && response !== undefined) {
      return normalizeRow(Array.isArray(response) ? response[0] : response)
    }
    const id = stringValue(recordValue(recordValue(args).where).id)
    const row = id ? this.tables[table].get(id) ?? null : null
    if (!row || table !== "tournaments") return row
    return {
      ...row,
      brackets: [...this.tables.brackets.values()]
        .filter((bracket) => bracket.tournamentId === id)
        .map(({ id: bracketId }) => ({ id: bracketId })),
      registrations: [...this.tables.registrations.values()]
        .filter((registration) => registration.tournamentId === id)
        .map(({ id: registrationId }) => ({ id: registrationId })),
    }
  }

  private async upsert(table: TableName, key: string, args: unknown): Promise<Row> {
    this.recordWrite(key, args)
    const input = recordValue(args)
    const rowId = rowKey(recordValue(input.where))
    const current = this.tables[table].get(rowId)
    const next = {
      ...current,
      ...modelDefaults(table),
      ...normalizeRow(current ? input.update : input.create),
    }
    this.tables[table].set(rowId, next)
    return next
  }

  private async create(table: TableName, key: string, args: unknown): Promise<Row> {
    this.recordWrite(key, args)
    const data = { ...modelDefaults(table), ...normalizeRow(recordValue(args).data) }
    this.tables[table].set(rowKey(data), data)
    return data
  }

  private async createMany(table: TableName, key: string, args: unknown): Promise<{ count: number }> {
    this.recordWrite(key, args)
    const rows = normalizeRows(recordValue(args).data).map((row) => ({
      ...modelDefaults(table),
      ...row,
    }))
    for (const row of rows) this.tables[table].set(rowKey(row), row)
    return { count: rows.length }
  }

  private async update(table: TableName, key: string, args: unknown): Promise<Row> {
    this.recordWrite(key, args)
    const input = recordValue(args)
    const rowId = rowKey(recordValue(input.where))
    const next = { ...this.tables[table].get(rowId), ...normalizeRow(input.data) }
    this.tables[table].set(rowId, next)
    return next
  }

  private async deleteBrackets(args: unknown): Promise<{ count: number }> {
    this.recordWrite("bracket.deleteMany", args)
    const where = recordValue(recordValue(args).where)
    const deleted = [...this.tables.brackets.values()].filter((row) => Object.entries(where).every(([key, value]) => row[key] === value))
    for (const bracket of deleted) {
      const bracketId = stringValue(bracket.id)!
      const matchIds = [...this.tables.matches.values()].filter((match) => match.bracketId === bracketId).map((match) => stringValue(match.id)!)
      this.tables.brackets.delete(bracketId)
      this.removeByRelation("entries", "bracketId", bracketId)
      this.removeByRelation("rounds", "bracketId", bracketId)
      this.removeByRelation("matches", "bracketId", bracketId)
      for (const matchId of matchIds) this.removeByRelation("results", "matchId", matchId)
    }
    return { count: deleted.length }
  }

  private filterRows(table: TableName, args: unknown): Row[] {
    const where = recordValue(recordValue(args).where)
    const clauses = Array.isArray(where.OR) ? where.OR.map(recordValue) : [where]
    return [...this.tables[table].values()].filter((row) => clauses.some((clause) => matchesWhere(row, clause)))
  }

  private patchRows(table: TableName, patch: Row): void { for (const [id, row] of this.tables[table]) this.tables[table].set(id, { ...row, ...patch }) }
  private removeByRelation(table: TableName, field: string, value: string): void { for (const [id, row] of this.tables[table]) if (row[field] === value) this.tables[table].delete(id) }
  private recordQuery(key: string, args: unknown): void { this.queryCalls.push({ key, args: normalize(args) }) }
  private recordWrite(key: string, args: unknown): void { this.writeCalls.push({ key, args: normalize(args) }) }
}

function createPort(prisma: RecordingPrisma) { return createPrismaDemoSeedPort(prisma as unknown as PrismaClient) }

function expectExactFixtureTables(tables: Record<TableName, Row[]>): void {
  expect(Object.fromEntries(Object.entries(tables).map(([name, rows]) => [name, rows.length]))).toEqual({ provinces: 77, users: 10, organizerProfiles: 2, tournaments: 6, teams: 23, players: 23, registrations: 21, brackets: 3, entries: 18, rounds: 8, matches: 15, results: 9, audits: 3 })
  expect(tables).toEqual(expectedFixtureTables())
}

function expectedFixtureTables(): Record<TableName, Row[]> {
  const base = createBaseDemoFixtureData()
  const fixtures = createDemoCompetitionFixtures()
  const timestamp = "2026-08-24T03:00:00.000Z"
  const tournamentById = new Map(base.tournaments.map((tournament) => [tournament.id, tournament]))
  const expected: Record<TableName, Row[]> = {
    provinces: thaiProvinces.map((province) => ({ ...province })),
    users: base.users.map((user) => ({ ...user, createdAt: timestamp, updatedAt: timestamp })),
    organizerProfiles: base.users.filter(({ role }) => role === "TOURNAMENT_ORGANIZER").map(({ id, displayName }) => ({ userId: id, organizationName: displayName, createdAt: timestamp, updatedAt: timestamp })),
    tournaments: base.tournaments.map((tournament) => ({ ...tournament, createdAt: timestamp, updatedAt: timestamp })),
    teams: [...base.teams.map((team) => ({ id: team.id, name: team.name, provinceCode: team.provinceCode, ownerId: team.ownerId, format: team.format, isActive: true, deactivatedAt: null, createdAt: timestamp, updatedAt: timestamp })), ...fixtures.flatMap((fixture) => fixture.teams.map((team) => ({ id: team.id, name: team.name, provinceCode: tournamentById.get(fixture.tournamentId)!.provinceCode, ownerId: "team-manager-1", format: tournamentById.get(fixture.tournamentId)!.format, isActive: true, deactivatedAt: null, createdAt: timestamp, updatedAt: timestamp })))],
    players: base.teams.flatMap((team) => team.players.map((player) => ({ ...player, birthDate: new Date(player.birthDate).toISOString(), teamId: team.id, deactivatedAt: null, createdAt: timestamp, updatedAt: timestamp }))),
    registrations: [...base.registrations.map(({ team, ...registration }) => ({ ...registration, teamId: team.id, createdAt: timestamp, updatedAt: timestamp, cancelledAt: null, withdrawnAt: null })), ...fixtures.flatMap((fixture) => fixture.entries.map((entry) => ({ id: entry.registrationId, tournamentId: fixture.tournamentId, teamId: entry.id, status: "APPROVED", decisionNote: "ข้อมูลตัวอย่างสำหรับทดสอบสายการแข่งขัน", createdAt: timestamp, updatedAt: timestamp, decidedAt: timestamp, cancelledAt: null, withdrawnAt: null })))],
    brackets: fixtures.map((fixture) => ({ id: fixture.bracketId, tournamentId: fixture.tournamentId, status: fixture.bracketStatus, mode: "SYSTEM_GENERATED", generationMethod: fixture.generationMethod, entriesLockedAt: timestamp, publishedAt: timestamp, createdAt: timestamp, updatedAt: timestamp })),
    entries: fixtures.flatMap((fixture) => fixture.entries.map((entry) => ({ id: entry.entryId, bracketId: fixture.bracketId, registrationId: entry.registrationId, teamId: entry.id, teamNameSnapshot: entry.name, seed: entry.seed, drawPosition: entry.seed, startRoundSequence: entry.startRoundSequence, createdAt: timestamp }))),
    rounds: fixtures.flatMap((fixture) => fixture.rounds.map((round) => ({ ...round, bracketId: fixture.bracketId }))),
    matches: fixtures.flatMap((fixture) => fixture.matches.map((match) => ({ id: match.id, tournamentId: fixture.tournamentId, bracketId: fixture.bracketId, roundId: match.roundId, sequence: match.sequence, purpose: match.purpose, scheduledAt: match.scheduledAt, court: match.court, homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId, winnerTeamId: match.winnerTeamId, homeScore: match.homeScore, awayScore: match.awayScore, status: match.status, nextSlot: match.nextSlot, updatedAt: timestamp, nextMatchId: match.nextMatchId }))),
    results: fixtures.flatMap((fixture) => fixture.matches.filter(({ status }) => status === "COMPLETED").map((match) => ({ id: `${match.id}-result`, matchId: match.id, confirmedBy: "admin-1", homeScore: match.homeScore, awayScore: match.awayScore, winnerTeamId: match.winnerTeamId, confirmedAt: timestamp }))),
    audits: fixtures.map((fixture) => ({ id: `${fixture.bracketId}-audit`, actorId: "admin-1", tournamentId: fixture.tournamentId, action: "DEMO_COMPETITION_SEEDED", entityType: "Bracket", entityId: fixture.bracketId, afterJson: { teamCount: fixture.teams.length, matchCount: fixture.matches.length, completedMatchCount: fixture.matches.filter(({ status }) => status === "COMPLETED").length }, createdAt: timestamp })),
  }
  return Object.fromEntries(Object.entries(expected).map(([name, rows]) => [name, [...rows].sort((left, right) => rowKey(left).localeCompare(rowKey(right)))])) as Record<TableName, Row[]>
}

function modelDefaults(table: TableName): Row {
  switch (table) {
    case "teams":
    case "players":
      return { isActive: true, deactivatedAt: null }
    case "registrations":
      return { status: "PENDING", cancelledAt: null, withdrawnAt: null }
    case "matches":
      return { purpose: "STANDARD", nextMatchId: null, nextSlot: null, status: "SCHEDULED" }
    default:
      return {}
  }
}

function matchesWhere(row: Row, where: Row): boolean { return Object.entries(where).every(([key, value]) => { const condition = recordValue(value); return Array.isArray(condition.in) ? condition.in.includes(row[key]) : row[key] === value }) }
function queryContainsId(value: unknown, id: string): boolean { if (value === id) return true; if (Array.isArray(value)) return value.some((entry) => queryContainsId(entry, id)); return isRecord(value) && Object.values(value).some((entry) => queryContainsId(entry, id)) }
function normalizeRows(value: unknown): Row[] { return Array.isArray(value) ? value.map(normalizeRow) : [] }
function normalizeRow(value: unknown): Row { const normalized = normalize(value); return isRecord(normalized) ? normalized : {} }
function normalize(value: unknown): unknown { if (value instanceof Date) return value.toISOString(); if (Array.isArray(value)) return value.map(normalize); return isRecord(value) ? Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalize(entry)])) : value }
function recordValue(value: unknown): Row { return isRecord(value) ? value : {} }
function isRecord(value: unknown): value is Row { return typeof value === "object" && value !== null && !Array.isArray(value) }
function rowKey(row: Row): string { return stringValue(row.id) ?? stringValue(row.userId) ?? stringValue(row.code) ?? "missing" }
function stringValue(value: unknown): string | null { return typeof value === "string" ? value : null }
