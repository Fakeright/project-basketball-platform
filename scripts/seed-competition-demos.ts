import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"

import { createDemoCompetitionFixtures } from "../features/competition/infrastructure/demo-competition-fixtures"
import {
  demoSeedTimestamp,
} from "../features/demo-data/infrastructure/demo-workflow-fixtures"
import {
  assertBaseDemoSeedPreflight,
  assertCompetitionDemoSeedPreflight,
  createDemoSeedClient,
  fixtureBracketDeleteWhere,
} from "../features/demo-data/infrastructure/demo-seed-safety"
import {
  Prisma,
  PrismaClient,
} from "../lib/generated/prisma/client"

config({ path: ".env.local" })
config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL_NOT_CONFIGURED")
}

const prisma = createDemoSeedClient(process.env, () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  }),
)

const demoOwnerId = "team-manager-1"
const demoAdminId = "admin-1"
const demoTimestamp = new Date(demoSeedTimestamp)

async function main() {
  const fixtures = createDemoCompetitionFixtures()

  await prisma.$transaction(async (transaction) => {
    const preflightedFixtures = [] as Array<{
      fixture: (typeof fixtures)[number]
      state: Awaited<ReturnType<typeof readCompetitionFixtureState>>
    }>
    for (const fixture of fixtures) {
      preflightedFixtures.push({
        fixture,
        state: await readCompetitionFixtureState(transaction, fixture),
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
      await transaction.bracket.deleteMany({
        where: fixtureBracketDeleteWhere(fixture),
      })

      for (const team of fixture.teams) {
        await transaction.team.upsert({
          where: { id: team.id },
          update: {
            name: team.name,
            provinceCode: state.tournament.provinceCode,
            ownerId: demoOwnerId,
            format: state.tournament.format,
            isActive: true,
            deactivatedAt: null,
            createdAt: demoTimestamp,
            updatedAt: demoTimestamp,
          },
          create: {
            id: team.id,
            name: team.name,
            provinceCode: state.tournament.provinceCode,
            ownerId: demoOwnerId,
            format: state.tournament.format,
            createdAt: demoTimestamp,
            updatedAt: demoTimestamp,
          },
        })

        await transaction.registration.upsert({
          where: { id: team.registrationId },
          update: {
            tournamentId: fixture.tournamentId,
            teamId: team.id,
            status: "APPROVED",
            decisionNote: "ข้อมูลตัวอย่างสำหรับทดสอบสายการแข่งขัน",
            createdAt: demoTimestamp,
            updatedAt: demoTimestamp,
            decidedAt: demoTimestamp,
            cancelledAt: null,
            withdrawnAt: null,
          },
          create: {
            id: team.registrationId,
            tournamentId: fixture.tournamentId,
            teamId: team.id,
            status: "APPROVED",
            decisionNote: "ข้อมูลตัวอย่างสำหรับทดสอบสายการแข่งขัน",
            createdAt: demoTimestamp,
            updatedAt: demoTimestamp,
            decidedAt: demoTimestamp,
          },
        })
      }

      await createBracket(transaction, fixture)
      await transaction.auditLog.upsert({
        where: { id: `${fixture.bracketId}-audit` },
        update: {
          actorId: demoAdminId,
          tournamentId: fixture.tournamentId,
          action: "DEMO_COMPETITION_SEEDED",
          entityType: "Bracket",
          entityId: fixture.bracketId,
          createdAt: demoTimestamp,
          afterJson: {
            teamCount: fixture.teams.length,
            matchCount: fixture.matches.length,
            completedMatchCount: fixture.matches.filter(
              ({ status }) => status === "COMPLETED",
            ).length,
          },
        },
        create: {
          id: `${fixture.bracketId}-audit`,
          actorId: demoAdminId,
          tournamentId: fixture.tournamentId,
          action: "DEMO_COMPETITION_SEEDED",
          entityType: "Bracket",
          entityId: fixture.bracketId,
          afterJson: {
            teamCount: fixture.teams.length,
            matchCount: fixture.matches.length,
            completedMatchCount: fixture.matches.filter(
              ({ status }) => status === "COMPLETED",
            ).length,
          },
          createdAt: demoTimestamp,
        },
      })
    }
  }, {
    maxWait: 10_000,
    timeout: 120_000,
  })

  for (const fixture of fixtures) {
    console.info(`Seeded ${fixture.tournamentSlug}`)
  }
}

async function createBracket(
  transaction: Prisma.TransactionClient,
  fixture: ReturnType<typeof createDemoCompetitionFixtures>[number],
) {
  const publishedAt = demoTimestamp

  await transaction.bracket.create({
    data: {
      id: fixture.bracketId,
      tournamentId: fixture.tournamentId,
      status: fixture.bracketStatus,
      mode: "SYSTEM_GENERATED",
      generationMethod: fixture.generationMethod,
      entriesLockedAt: publishedAt,
      publishedAt,
      createdAt: demoTimestamp,
      updatedAt: demoTimestamp,
    },
  })

  await transaction.bracketEntry.createMany({
    data: fixture.entries.map((entry) => ({
      id: entry.entryId,
      bracketId: fixture.bracketId,
      registrationId: entry.registrationId,
      teamId: entry.id,
      teamNameSnapshot: entry.name,
      seed: entry.seed,
      drawPosition: entry.seed,
      startRoundSequence: entry.startRoundSequence,
      createdAt: demoTimestamp,
    })),
  })

  await transaction.bracketRound.createMany({
    data: fixture.rounds.map((round) => ({
      id: round.id,
      bracketId: fixture.bracketId,
      name: round.name,
      sequence: round.sequence,
    })),
  })

  await transaction.match.createMany({
    data: fixture.matches.map((match) => ({
      id: match.id,
      tournamentId: fixture.tournamentId,
      bracketId: fixture.bracketId,
      roundId: match.roundId,
      sequence: match.sequence,
      scheduledAt: new Date(match.scheduledAt),
      court: match.court,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      winnerTeamId: match.winnerTeamId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status,
      nextSlot: match.nextSlot,
      updatedAt: demoTimestamp,
    })),
  })

  for (const match of fixture.matches) {
    if (match.nextMatchId) {
      await transaction.match.update({
        where: { id: match.id },
        data: { nextMatchId: match.nextMatchId, updatedAt: demoTimestamp },
      })
    }

    if (
      match.status === "COMPLETED" &&
      match.homeScore !== null &&
      match.awayScore !== null &&
      match.winnerTeamId
    ) {
      await transaction.matchResult.create({
        data: {
          id: `${match.id}-result`,
          matchId: match.id,
          confirmedBy: demoAdminId,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          winnerTeamId: match.winnerTeamId,
          confirmedAt: demoTimestamp,
        },
      })
    }
  }
}

async function readCompetitionFixtureState(
  transaction: Prisma.TransactionClient,
  fixture: ReturnType<typeof createDemoCompetitionFixtures>[number],
) {
  const tournament = await transaction.tournament.findUnique({
    where: { id: fixture.tournamentId },
    select: {
      organizerId: true,
      slug: true,
      provinceCode: true,
      format: true,
      brackets: { select: { id: true } },
      registrations: { select: { id: true } },
    },
  })

  if (!tournament || tournament.slug !== fixture.tournamentSlug) {
    throw new Error(`DEMO_TOURNAMENT_NOT_FOUND:${fixture.tournamentId}`)
  }

  const completedResultIds = fixture.matches
    .filter(({ status }) => status === "COMPLETED")
    .map(({ id }) => `${id}-result`)
  const teams = await transaction.team.findMany({
    where: { id: { in: fixture.teams.map(({ id }) => id) } },
    select: { id: true, ownerId: true },
  })
  const registrations = await transaction.registration.findMany({
    where: { id: { in: fixture.entries.map(({ registrationId }) => registrationId) } },
    select: { id: true, tournamentId: true, teamId: true },
  })
  const bracket = await transaction.bracket.findUnique({
    where: { id: fixture.bracketId },
    select: { id: true, tournamentId: true },
  })
  const audit = await transaction.auditLog.findUnique({
    where: { id: `${fixture.bracketId}-audit` },
    select: { id: true, actorId: true, tournamentId: true, entityId: true },
  })
  const entries = await transaction.bracketEntry.findMany({
    where: { id: { in: fixture.entries.map(({ entryId }) => entryId) } },
    select: { id: true, bracketId: true, registrationId: true, teamId: true },
  })
  const rounds = await transaction.bracketRound.findMany({
    where: { id: { in: fixture.rounds.map(({ id }) => id) } },
    select: { id: true, bracketId: true },
  })
  const matches = await transaction.match.findMany({
    where: { id: { in: fixture.matches.map(({ id }) => id) } },
    select: { id: true, tournamentId: true, bracketId: true, roundId: true },
  })
  const results = await transaction.matchResult.findMany({
    where: { id: { in: completedResultIds } },
    select: { id: true, matchId: true },
  })

  return {
    tournament,
    snapshot: { teams, registrations, bracket, audit, entries, rounds, matches, results },
  }
}

function assertOnlyDemoRows(
  actualIds: string[],
  allowedIds: string | string[],
  tournamentId: string,
) {
  const allowed = new Set(
    Array.isArray(allowedIds) ? allowedIds : [allowedIds],
  )
  const unexpectedIds = actualIds.filter((id) => !allowed.has(id))

  if (unexpectedIds.length > 0) {
    throw new Error(`DEMO_TARGET_HAS_USER_DATA:${tournamentId}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
