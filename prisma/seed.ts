import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
import {
  Prisma,
  PrismaClient,
} from "../lib/generated/prisma/client"
import {
  demoRegistrationScenarios,
  demoSeedUsers,
  demoSeedTimestamp,
  demoWorkflowTournaments,
  getDemoBaseTeams,
  type DemoTeamFixture,
} from "../features/demo-data/infrastructure/demo-workflow-fixtures"
import {
  assertBaseDemoSeedPreflight,
  createDemoSeedClient,
} from "../features/demo-data/infrastructure/demo-seed-safety"
import { thaiProvinces } from "../features/provinces/domain/thai-provinces"

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

async function main() {
  await prisma.$transaction(async (transaction) => {
    const teams = getDemoBaseTeams()
    assertBaseDemoSeedPreflight(await readBaseDemoSeedSnapshot(transaction, teams))

    for (const province of thaiProvinces) {
      await transaction.province.upsert({
        where: { code: province.code },
        update: { nameTh: province.nameTh, nameEn: province.nameEn },
        create: province,
      })
    }

    for (const user of demoSeedUsers) {
      await transaction.user.upsert({
        where: { id: user.id },
        update: { ...user, createdAt: fixedTimestamp(), updatedAt: fixedTimestamp() },
        create: { ...user, createdAt: fixedTimestamp(), updatedAt: fixedTimestamp() },
      })
    }

    for (const user of demoSeedUsers.filter(
      (candidate) => candidate.role === "TOURNAMENT_ORGANIZER",
    )) {
      await transaction.organizerProfile.upsert({
        where: { userId: user.id },
        update: {
          organizationName: user.displayName,
          createdAt: fixedTimestamp(),
          updatedAt: fixedTimestamp(),
        },
        create: {
          userId: user.id,
          organizationName: user.displayName,
          createdAt: fixedTimestamp(),
          updatedAt: fixedTimestamp(),
        },
      })
    }

    for (const tournament of demoWorkflowTournaments) {
      await transaction.tournament.upsert({
        where: { id: tournament.id },
        update: tournamentData(tournament),
        create: tournamentData(tournament),
      })
    }

    for (const team of teams) {
      await seedTeam(transaction, team)
    }

    for (const scenario of demoRegistrationScenarios) {
      await transaction.registration.upsert({
        where: { id: scenario.id },
        update: {
          tournamentId: scenario.tournamentId,
          teamId: scenario.team.id,
          status: scenario.status,
          decisionNote: scenario.decisionNote,
          createdAt: fixedTimestamp(),
          updatedAt: fixedTimestamp(),
          decidedAt: scenario.decidedAt ? new Date(scenario.decidedAt) : null,
          cancelledAt: null,
          withdrawnAt: null,
        },
        create: {
          id: scenario.id,
          tournamentId: scenario.tournamentId,
          teamId: scenario.team.id,
          status: scenario.status,
          decisionNote: scenario.decisionNote,
          createdAt: fixedTimestamp(),
          updatedAt: fixedTimestamp(),
          decidedAt: scenario.decidedAt ? new Date(scenario.decidedAt) : null,
        },
      })
    }
  }, { maxWait: 10_000, timeout: 60_000 })
}

function tournamentData(
  tournament: (typeof demoWorkflowTournaments)[number],
) {
  return {
    id: tournament.id,
    slug: tournament.slug,
    title: tournament.title,
    status: tournament.status,
    organizerId: tournament.organizerId,
    provinceCode: tournament.provinceCode,
    venue: tournament.venue,
    format: tournament.format,
    ageGroup: tournament.ageGroup,
    startsAt: new Date(tournament.startsAt),
    endsAt: new Date(tournament.endsAt),
    registrationDeadline: new Date(tournament.registrationDeadline),
    capacity: tournament.capacity,
    description: tournament.description,
    rules: tournament.rules,
    createdAt: fixedTimestamp(),
    updatedAt: fixedTimestamp(),
  }
}

async function seedTeam(
  transaction: Prisma.TransactionClient,
  team: DemoTeamFixture,
) {
  await transaction.team.upsert({
    where: { id: team.id },
    update: {
      name: team.name,
      provinceCode: team.provinceCode,
      ownerId: team.ownerId,
      format: team.format,
      isActive: true,
      deactivatedAt: null,
      createdAt: fixedTimestamp(),
      updatedAt: fixedTimestamp(),
    },
    create: {
      id: team.id,
      name: team.name,
      provinceCode: team.provinceCode,
      ownerId: team.ownerId,
      format: team.format,
      createdAt: fixedTimestamp(),
      updatedAt: fixedTimestamp(),
    },
  })

  for (const player of team.players) {
    await transaction.teamPlayer.upsert({
      where: { id: player.id },
      update: {
        firstName: player.firstName,
        lastName: player.lastName,
        birthDate: new Date(player.birthDate),
        jerseyNumber: player.jerseyNumber,
        isActive: player.isActive,
        deactivatedAt: null,
        createdAt: fixedTimestamp(),
        updatedAt: fixedTimestamp(),
      },
      create: {
        id: player.id,
        teamId: team.id,
        firstName: player.firstName,
        lastName: player.lastName,
        birthDate: new Date(player.birthDate),
        jerseyNumber: player.jerseyNumber,
        isActive: player.isActive,
        createdAt: fixedTimestamp(),
        updatedAt: fixedTimestamp(),
      },
    })
  }
}

async function readBaseDemoSeedSnapshot(
  transaction: Prisma.TransactionClient,
  teams: readonly DemoTeamFixture[],
) {
  const playerIds = teams.flatMap(({ players }) => players.map(({ id }) => id))

  const users = await transaction.user.findMany({
    where: {
      OR: [
        { id: { in: demoSeedUsers.map(({ id }) => id) } },
        { email: { in: demoSeedUsers.map(({ email }) => email) } },
      ],
    },
    select: { id: true, email: true, role: true },
  })
  const tournaments = await transaction.tournament.findMany({
    where: {
      OR: [
        { id: { in: demoWorkflowTournaments.map(({ id }) => id) } },
        { slug: { in: demoWorkflowTournaments.map(({ slug }) => slug) } },
      ],
    },
    select: { id: true, organizerId: true },
  })
  const existingTeams = await transaction.team.findMany({
    where: { id: { in: teams.map(({ id }) => id) } },
    select: { id: true, ownerId: true },
  })
  const players = await transaction.teamPlayer.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, teamId: true },
  })
  const registrations = await transaction.registration.findMany({
    where: { id: { in: demoRegistrationScenarios.map(({ id }) => id) } },
    select: { id: true, tournamentId: true, teamId: true },
  })

  return { users, tournaments, teams: existingTeams, players, registrations }
}

function fixedTimestamp() {
  return new Date(demoSeedTimestamp)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
