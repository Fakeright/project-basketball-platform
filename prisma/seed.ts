import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
import {
  PrismaClient,
  Role,
  TournamentFormat,
  TournamentStatus,
} from "../lib/generated/prisma/client"
import { thaiProvinces } from "../features/provinces/domain/thai-provinces"

config({ path: ".env.local" })
config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL_NOT_CONFIGURED")
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const tournaments: Array<{ id: string; slug: string; title: string; status: TournamentStatus; organizerId: string }> = [
  { id: "tournament-draft", slug: "admin-draft-cup", title: "Admin Draft Cup", status: "DRAFT", organizerId: "organizer-1" },
  { id: "tournament-submitted", slug: "submitted-court-cup", title: "Submitted Court Cup", status: "SUBMITTED", organizerId: "organizer-1" },
  { id: "tournament-published", slug: "published-bangkok-open", title: "Published Bangkok Open", status: "PUBLISHED", organizerId: "organizer-1" },
  { id: "tournament-closed", slug: "closed-north-court", title: "North Court Closed", status: "REGISTRATION_CLOSED", organizerId: "organizer-2" },
  { id: "tournament-ongoing", slug: "ongoing-chonburi-cup", title: "Chonburi Coast Cup", status: "IN_PROGRESS", organizerId: "organizer-2" },
  { id: "tournament-completed", slug: "completed-hoops-classic", title: "Hoops Classic", status: "COMPLETED", organizerId: "organizer-2" },
]

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
    await prisma.user.upsert({ where: { id: user.id }, update: user, create: user })
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

  for (const tournament of tournaments) {
    await prisma.tournament.upsert({
      where: { id: tournament.id },
      update: { status: tournament.status, title: tournament.title },
      create: {
        ...tournament,
        provinceCode: "10",
        venue: "COURTSIDE Arena",
        format: TournamentFormat.FIVE_V_FIVE,
        ageGroup: "Open",
        startsAt: new Date("2026-11-15T02:00:00.000Z"),
        endsAt: new Date("2026-11-16T11:00:00.000Z"),
        registrationDeadline: new Date("2026-11-01T16:59:00.000Z"),
        capacity: 16,
        description: "ข้อมูลตัวอย่างสำหรับการพัฒนา Admin Tournament Management",
        rules: "กติกามาตรฐานของรายการ",
      },
    })
  }

  const developmentTeam = {
    id: "team-manager-1-team",
    name: "COURTSIDE Development Team",
    provinceCode: "10",
    ownerId: "team-manager-1",
    format: TournamentFormat.FIVE_V_FIVE,
  }
  await prisma.team.upsert({
    where: { id: developmentTeam.id },
    update: developmentTeam,
    create: developmentTeam,
  })

  const players = [
    { id: "team-manager-1-team-player-1", firstName: "Player", lastName: "One", birthDate: "2008-01-01", jerseyNumber: 1 },
    { id: "team-manager-1-team-player-2", firstName: "Player", lastName: "Two", birthDate: "2008-02-02", jerseyNumber: 2 },
    { id: "team-manager-1-team-player-3", firstName: "Player", lastName: "Three", birthDate: "2008-03-03", jerseyNumber: 3 },
    { id: "team-manager-1-team-player-4", firstName: "Player", lastName: "Four", birthDate: "2008-04-04", jerseyNumber: 4 },
    { id: "team-manager-1-team-player-5", firstName: "Player", lastName: "Five", birthDate: "2008-05-05", jerseyNumber: 5 },
  ] as const

  for (const player of players) {
    await prisma.teamPlayer.upsert({
      where: { id: player.id },
      update: {
        firstName: player.firstName,
        lastName: player.lastName,
        birthDate: new Date(player.birthDate),
        jerseyNumber: player.jerseyNumber,
        isActive: true,
        deactivatedAt: null,
      },
      create: {
        id: player.id,
        teamId: developmentTeam.id,
        firstName: player.firstName,
        lastName: player.lastName,
        birthDate: new Date(player.birthDate),
        jerseyNumber: player.jerseyNumber,
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
