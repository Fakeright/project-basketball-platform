import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
import {
  PrismaClient,
  Role,
} from "../lib/generated/prisma/client"
import {
  assertDemoEnvironment,
  demoRegistrationScenarios,
  demoSampleTeams,
  demoSeedTimestamp,
  demoWorkflowTournaments,
} from "../features/demo-data/infrastructure/demo-workflow-fixtures"
import { thaiProvinces } from "../features/provinces/domain/thai-provinces"

config({ path: ".env.local" })
config()

assertDemoEnvironment(process.env)

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL_NOT_CONFIGURED")
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  for (const province of thaiProvinces) {
    await prisma.province.upsert({
      where: { code: province.code },
      update: { nameTh: province.nameTh, nameEn: province.nameEn },
      create: province,
    })
  }

  const users = [
    { id: "admin-1", email: "admin@courtside.local", displayName: "COURTSIDE Admin", role: Role.PLATFORM_ADMIN },
    { id: "organizer-1", email: "organizer.one@courtside.local", displayName: "ผู้จัดการแข่งขัน 1", role: Role.TOURNAMENT_ORGANIZER },
    { id: "organizer-2", email: "organizer.two@courtside.local", displayName: "ผู้จัดการแข่งขัน 2", role: Role.TOURNAMENT_ORGANIZER },
    { id: "team-manager-1", email: "team.manager@courtside.local", displayName: "COURTSIDE Team Manager", role: Role.TEAM_MANAGER_COACH },
    { id: "coach-1", email: "coach.one@courtside.local", displayName: "COURTSIDE Coach", role: Role.TEAM_MANAGER_COACH },
    { id: "player-1", email: "player.one@courtside.local", displayName: "COURTSIDE Player 1", role: Role.PLAYER },
    { id: "player-2", email: "player.two@courtside.local", displayName: "COURTSIDE Player 2", role: Role.PLAYER },
    { id: "player-3", email: "player.three@courtside.local", displayName: "COURTSIDE Player 3", role: Role.PLAYER },
    { id: "player-4", email: "player.four@courtside.local", displayName: "COURTSIDE Player 4", role: Role.PLAYER },
    { id: "player-5", email: "player.five@courtside.local", displayName: "COURTSIDE Player 5", role: Role.PLAYER },
  ] as const

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: { ...user, createdAt: new Date(demoSeedTimestamp) },
    })
  }

  for (const user of users.filter(
    (candidate) => candidate.role === Role.TOURNAMENT_ORGANIZER,
  )) {
    await prisma.organizerProfile.upsert({
      where: { userId: user.id },
      update: { organizationName: user.displayName },
      create: { userId: user.id, organizationName: user.displayName },
    })
  }

  for (const tournament of demoWorkflowTournaments) {
    await prisma.tournament.upsert({
      where: { id: tournament.id },
      update: tournamentData(tournament),
      create: {
        ...tournament,
        ...tournamentData(tournament),
      },
    })
  }

  for (const team of [
    ...demoSampleTeams,
    ...demoRegistrationScenarios.map(({ team }) => team),
  ]) {
    await seedTeam(team)
  }

  for (const scenario of demoRegistrationScenarios) {
    await prisma.registration.upsert({
      where: { id: scenario.id },
      update: {
        tournamentId: scenario.tournamentId,
        teamId: scenario.team.id,
        status: scenario.status,
        decisionNote: scenario.decisionNote,
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
        createdAt: new Date(scenario.createdAt),
        decidedAt: scenario.decidedAt ? new Date(scenario.decidedAt) : null,
      },
    })
  }
}

function tournamentData(
  tournament: (typeof demoWorkflowTournaments)[number],
) {
  return {
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
    createdAt: new Date(tournament.createdAt),
  }
}

async function seedTeam(
  team: (typeof demoSampleTeams)[number] | (typeof demoRegistrationScenarios)[number]["team"],
) {
  await prisma.team.upsert({
    where: { id: team.id },
    update: {
      name: team.name,
      provinceCode: team.provinceCode,
      ownerId: team.ownerId,
      format: team.format,
      isActive: true,
      deactivatedAt: null,
    },
    create: {
      id: team.id,
      name: team.name,
      provinceCode: team.provinceCode,
      ownerId: team.ownerId,
      format: team.format,
      createdAt: new Date(team.createdAt),
    },
  })

  for (const player of team.players) {
    await prisma.teamPlayer.upsert({
      where: { id: player.id },
      update: {
        firstName: player.firstName,
        lastName: player.lastName,
        birthDate: new Date(player.birthDate),
        jerseyNumber: player.jerseyNumber,
        isActive: player.isActive,
        deactivatedAt: null,
      },
      create: {
        id: player.id,
        teamId: team.id,
        firstName: player.firstName,
        lastName: player.lastName,
        birthDate: new Date(player.birthDate),
        jerseyNumber: player.jerseyNumber,
        isActive: player.isActive,
        createdAt: new Date(team.createdAt),
      },
    })
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
