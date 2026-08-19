import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"

import { createDemoCompetitionFixtures } from "../features/competition/infrastructure/demo-competition-fixtures"
import {
  Prisma,
  PrismaClient,
} from "../lib/generated/prisma/client"

config({ path: ".env.local" })
config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL_NOT_CONFIGURED")
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const demoOwnerId = "team-manager-1"
const demoAdminId = "admin-1"

async function main() {
  const fixtures = createDemoCompetitionFixtures()

  for (const fixture of fixtures) {
    await prisma.$transaction(async (transaction) => {
      const tournament = await transaction.tournament.findUnique({
        where: { id: fixture.tournamentId },
        select: {
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

      assertOnlyDemoRows(
        tournament.brackets.map(({ id }) => id),
        fixture.bracketId,
        fixture.tournamentId,
      )
      assertOnlyDemoRows(
        tournament.registrations.map(({ id }) => id),
        fixture.entries.map(({ registrationId }) => registrationId),
        fixture.tournamentId,
      )

      await transaction.bracket.deleteMany({
        where: { id: fixture.bracketId },
      })

      for (const team of fixture.teams) {
        await transaction.team.upsert({
          where: { id: team.id },
          update: {
            name: team.name,
            provinceCode: tournament.provinceCode,
            format: tournament.format,
            isActive: true,
            deactivatedAt: null,
          },
          create: {
            id: team.id,
            name: team.name,
            provinceCode: tournament.provinceCode,
            ownerId: demoOwnerId,
            format: tournament.format,
          },
        })

        await transaction.registration.upsert({
          where: { id: team.registrationId },
          update: {
            teamId: team.id,
            status: "APPROVED",
            decisionNote: "ข้อมูลตัวอย่างสำหรับทดสอบสายการแข่งขัน",
            decidedAt: new Date(),
            cancelledAt: null,
            withdrawnAt: null,
          },
          create: {
            id: team.registrationId,
            tournamentId: fixture.tournamentId,
            teamId: team.id,
            status: "APPROVED",
            decisionNote: "ข้อมูลตัวอย่างสำหรับทดสอบสายการแข่งขัน",
            decidedAt: new Date(),
          },
        })
      }

      await createBracket(transaction, fixture)
      await transaction.auditLog.deleteMany({
        where: {
          action: "DEMO_COMPETITION_SEEDED",
          entityType: "Bracket",
          entityId: fixture.bracketId,
        },
      })
      await transaction.auditLog.create({
        data: {
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
        },
      })
    }, {
      maxWait: 10_000,
      timeout: 60_000,
    })

    console.info(`Seeded ${fixture.tournamentSlug}`)
  }
}

async function createBracket(
  transaction: Prisma.TransactionClient,
  fixture: ReturnType<typeof createDemoCompetitionFixtures>[number],
) {
  const publishedAt = new Date()

  await transaction.bracket.create({
    data: {
      id: fixture.bracketId,
      tournamentId: fixture.tournamentId,
      status: "PUBLISHED",
      mode: "SYSTEM_GENERATED",
      generationMethod: fixture.generationMethod,
      entriesLockedAt: publishedAt,
      publishedAt,
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
    })),
  })

  for (const match of fixture.matches) {
    if (match.nextMatchId) {
      await transaction.match.update({
        where: { id: match.id },
        data: { nextMatchId: match.nextMatchId },
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
        },
      })
    }
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
