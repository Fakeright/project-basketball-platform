import type {
  RegistrationStatus,
  TournamentFormat,
  TournamentStatus,
} from "@/lib/generated/prisma/client"

export const demoSeedTimestamp = "2026-08-24T03:00:00.000Z"

interface DemoPlayerFixture {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  jerseyNumber: number
  isActive: true
}

export interface DemoTeamFixture {
  id: string
  name: string
  provinceCode: "10"
  ownerId: "team-manager-1"
  format: TournamentFormat
  createdAt: string
  players: readonly DemoPlayerFixture[]
}

export interface DemoWorkflowTournament {
  id:
    | "tournament-draft"
    | "tournament-submitted"
    | "tournament-published"
    | "tournament-closed"
    | "tournament-ongoing"
    | "tournament-completed"
  slug: string
  title: string
  status: TournamentStatus
  organizerId: "organizer-1"
  provinceCode: "10"
  venue: string
  format: TournamentFormat
  ageGroup: string
  startsAt: string
  endsAt: string
  registrationDeadline: string
  capacity: number
  description: string
  rules: string
  createdAt: string
}

export interface DemoRegistrationScenario {
  id: string
  tournamentId: "tournament-published"
  team: DemoTeamFixture
  status: RegistrationStatus
  decisionNote: string | null
  createdAt: string
  decidedAt: string | null
}

const tournamentDates = {
  startsAt: "2026-11-15T02:00:00.000Z",
  endsAt: "2026-11-16T11:00:00.000Z",
  registrationDeadline: "2026-11-01T16:59:00.000Z",
  createdAt: demoSeedTimestamp,
} as const

const tournamentDefaults = {
  organizerId: "organizer-1",
  provinceCode: "10",
  venue: "COURTSIDE Arena",
  ageGroup: "Open",
  capacity: 16,
  description: "ข้อมูลตัวอย่างสำหรับการพัฒนา COURTSIDE",
  rules: "กติกามาตรฐานของรายการ",
  ...tournamentDates,
} as const

export const demoWorkflowTournaments = [
  {
    ...tournamentDefaults,
    id: "tournament-draft",
    slug: "courtside-draft-cup",
    title: "COURTSIDE Draft Cup",
    status: "DRAFT",
    format: "THREE_V_THREE",
  },
  {
    ...tournamentDefaults,
    id: "tournament-submitted",
    slug: "courtside-review-cup",
    title: "COURTSIDE Review Cup",
    status: "SUBMITTED",
    format: "FIVE_V_FIVE",
  },
  {
    ...tournamentDefaults,
    id: "tournament-published",
    slug: "courtside-registration-cup",
    title: "COURTSIDE Registration Cup",
    status: "PUBLISHED",
    format: "FIVE_V_FIVE",
  },
  {
    ...tournamentDefaults,
    id: "tournament-closed",
    slug: "courtside-bracket-cup",
    title: "COURTSIDE Bracket Cup",
    status: "REGISTRATION_CLOSED",
    format: "FIVE_V_FIVE",
  },
  {
    ...tournamentDefaults,
    id: "tournament-ongoing",
    slug: "courtside-live-cup",
    title: "COURTSIDE Live Cup",
    status: "IN_PROGRESS",
    format: "FIVE_V_FIVE",
  },
  {
    ...tournamentDefaults,
    id: "tournament-completed",
    slug: "courtside-championship",
    title: "COURTSIDE Championship",
    status: "COMPLETED",
    format: "FIVE_V_FIVE",
  },
] as const satisfies readonly DemoWorkflowTournament[]

const demoRegistrationPlayers = [
  { firstName: "Anan", lastName: "Sukjai", birthDate: "2002-01-10" },
  { firstName: "Burin", lastName: "Klaiklang", birthDate: "2001-02-11" },
  { firstName: "Chai", lastName: "Wattanakul", birthDate: "2003-03-12" },
  { firstName: "Danai", lastName: "Rattanapong", birthDate: "2002-04-13" },
  { firstName: "Ekkachai", lastName: "Phromdee", birthDate: "2001-05-14" },
] as const

function createPlayers(teamId: string): readonly DemoPlayerFixture[] {
  return demoRegistrationPlayers.map((player, index) => ({
    id: `${teamId}-player-${index + 1}`,
    ...player,
    jerseyNumber: index + 1,
    isActive: true,
  }))
}

function createFiveVFiveTeam(id: string, name: string): DemoTeamFixture {
  return {
    id,
    name,
    provinceCode: "10",
    ownerId: "team-manager-1",
    format: "FIVE_V_FIVE",
    createdAt: demoSeedTimestamp,
    players: createPlayers(id),
  }
}

export const demoRegistrationScenarios = [
  {
    id: "demo-registration-pending",
    tournamentId: "tournament-published",
    team: createFiveVFiveTeam(
      "demo-registration-team-pending",
      "Registration Pending Five",
    ),
    status: "PENDING",
    decisionNote: null,
    createdAt: demoSeedTimestamp,
    decidedAt: null,
  },
  {
    id: "demo-registration-approved",
    tournamentId: "tournament-published",
    team: createFiveVFiveTeam(
      "demo-registration-team-approved",
      "Registration Approved Five",
    ),
    status: "APPROVED",
    decisionNote: "เอกสารทีมครบถ้วน",
    createdAt: demoSeedTimestamp,
    decidedAt: demoSeedTimestamp,
  },
  {
    id: "demo-registration-rejected",
    tournamentId: "tournament-published",
    team: createFiveVFiveTeam(
      "demo-registration-team-rejected",
      "Registration Rejected Five",
    ),
    status: "REJECTED",
    decisionNote: "เอกสารทีมยังไม่ครบ",
    createdAt: demoSeedTimestamp,
    decidedAt: demoSeedTimestamp,
  },
] as const satisfies readonly DemoRegistrationScenario[]

export const demoSampleTeams = [
  {
    id: "team-manager-1-team-3x3",
    name: "COURTSIDE Development 3x3",
    provinceCode: "10",
    ownerId: "team-manager-1",
    format: "THREE_V_THREE",
    createdAt: demoSeedTimestamp,
    players: [
      { id: "team-manager-1-team-3x3-player-1", firstName: "Fah", lastName: "Siam", birthDate: "2004-01-01", jerseyNumber: 1, isActive: true },
      { id: "team-manager-1-team-3x3-player-2", firstName: "Gawin", lastName: "Thai", birthDate: "2004-02-02", jerseyNumber: 2, isActive: true },
      { id: "team-manager-1-team-3x3-player-3", firstName: "Hathai", lastName: "Court", birthDate: "2004-03-03", jerseyNumber: 3, isActive: true },
    ],
  },
  createFiveVFiveTeam("team-manager-1-team", "COURTSIDE Development Team"),
] as const satisfies readonly DemoTeamFixture[]

export function assertDemoEnvironment(environment: NodeJS.ProcessEnv): void {
  if (
    environment.NODE_ENV === "production" ||
    environment.VERCEL_ENV === "production"
  ) {
    throw new Error("DEMO_SEED_PRODUCTION_BLOCKED")
  }
}
