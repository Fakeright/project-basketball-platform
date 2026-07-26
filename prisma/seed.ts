import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
import {
  PrismaClient,
  Role,
  TeamMemberRole,
  TournamentFormat,
  TournamentStatus,
} from "../lib/generated/prisma/client"

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
  const users = [
    { id: "admin-1", email: "admin@courtside.local", displayName: "COURTSIDE Admin", role: Role.PLATFORM_ADMIN },
    { id: "organizer-1", email: "organizer.one@courtside.local", displayName: "ผู้จัดการแข่งขัน 1", role: Role.TOURNAMENT_ORGANIZER },
    { id: "organizer-2", email: "organizer.two@courtside.local", displayName: "ผู้จัดการแข่งขัน 2", role: Role.TOURNAMENT_ORGANIZER },
    { id: "team-manager-1", email: "team.manager@courtside.local", displayName: "COURTSIDE Team Manager", role: Role.TEAM_MANAGER },
    { id: "coach-1", email: "coach.one@courtside.local", displayName: "COURTSIDE Coach", role: Role.COACH },
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
        province: "Bangkok",
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
    province: "Bangkok",
    ownerId: "team-manager-1",
  }
  await prisma.team.upsert({
    where: { id: developmentTeam.id },
    update: developmentTeam,
    create: developmentTeam,
  })

  const members = [
    { userId: "coach-1", role: TeamMemberRole.COACH },
    { userId: "player-1", role: TeamMemberRole.PLAYER },
    { userId: "player-2", role: TeamMemberRole.PLAYER },
    { userId: "player-3", role: TeamMemberRole.PLAYER },
    { userId: "player-4", role: TeamMemberRole.PLAYER },
    { userId: "player-5", role: TeamMemberRole.PLAYER },
  ] as const

  for (const member of members) {
    await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId: developmentTeam.id,
          userId: member.userId,
        },
      },
      update: {
        role: member.role,
        isActive: true,
        deactivatedAt: null,
      },
      create: {
        id: `${developmentTeam.id}-${member.userId}`,
        teamId: developmentTeam.id,
        userId: member.userId,
        role: member.role,
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
