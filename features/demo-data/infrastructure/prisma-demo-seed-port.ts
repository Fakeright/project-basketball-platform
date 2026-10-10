import type { DemoCompetitionFixture } from "@/features/competition/infrastructure/demo-competition-fixtures"
import {
  Prisma,
  PrismaClient,
} from "@/lib/generated/prisma/client"

import {
  demoRegistrationScenarios,
  demoSeedUsers,
  demoWorkflowTournaments,
  type DemoTeamFixture,
  getDemoBaseTeams,
} from "./demo-workflow-fixtures"
import type {
  BaseDemoFixtureData,
  CompetitionFixtureReplacement,
  DemoCompetitionFixtureState,
  DemoSeedPort,
  DemoSeedTransactionPort,
} from "./demo-seed-orchestration"

export function createPrismaDemoSeedPort(prisma: PrismaClient): DemoSeedPort {
  return {
    transaction: (operation) =>
      prisma.$transaction(
        (transaction) => operation(new PrismaDemoSeedTransactionPort(transaction)),
        { maxWait: 10_000, timeout: 120_000 },
      ),
  }
}

class PrismaDemoSeedTransactionPort implements DemoSeedTransactionPort {
  constructor(private readonly transaction: Prisma.TransactionClient) {}

  async readBaseSnapshot() {
    const teams = getDemoBaseTeams()
    const playerIds = teams.flatMap(({ players }) => players.map(({ id }) => id))

    const users = await this.transaction.user.findMany({
      where: {
        OR: [
          { id: { in: demoSeedUsers.map(({ id }) => id) } },
          { email: { in: demoSeedUsers.map(({ email }) => email) } },
        ],
      },
      select: { id: true, email: true, role: true },
    })
    const tournaments = await this.transaction.tournament.findMany({
      where: {
        OR: [
          { id: { in: demoWorkflowTournaments.map(({ id }) => id) } },
          { slug: { in: demoWorkflowTournaments.map(({ slug }) => slug) } },
        ],
      },
      select: { id: true, organizerId: true },
    })
    const existingTeams = await this.transaction.team.findMany({
      where: { id: { in: teams.map(({ id }) => id) } },
      select: { id: true, ownerId: true },
    })
    const players = await this.transaction.teamPlayer.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, teamId: true },
    })
    const registrations = await this.transaction.registration.findMany({
      where: { id: { in: demoRegistrationScenarios.map(({ id }) => id) } },
      select: { id: true, tournamentId: true, teamId: true },
    })

    return { users, tournaments, teams: existingTeams, players, registrations }
  }

  async applyBaseFixture(data: BaseDemoFixtureData): Promise<void> {
    const timestamp = fixedTimestamp(data.timestamp)

    for (const province of data.provinces) {
      await this.transaction.province.upsert({
        where: { code: province.code },
        update: { nameTh: province.nameTh, nameEn: province.nameEn },
        create: province,
      })
    }

    for (const user of data.users) {
      await this.transaction.user.upsert({
        where: { id: user.id },
        update: { ...user, createdAt: timestamp, updatedAt: timestamp },
        create: { ...user, createdAt: timestamp, updatedAt: timestamp },
      })
    }

    for (const user of data.users.filter(
      (candidate) => candidate.role === "TOURNAMENT_ORGANIZER",
    )) {
      await this.transaction.organizerProfile.upsert({
        where: { userId: user.id },
        update: {
          organizationName: user.displayName,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        create: {
          userId: user.id,
          organizationName: user.displayName,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      })
    }

    for (const tournament of data.tournaments) {
      await this.transaction.tournament.upsert({
        where: { id: tournament.id },
        update: tournamentData(tournament, timestamp),
        create: tournamentData(tournament, timestamp),
      })
    }

    for (const team of data.teams) {
      await this.seedTeam(team, timestamp)
    }

    for (const scenario of data.registrations) {
      await this.transaction.registration.upsert({
        where: { id: scenario.id },
        update: {
          tournamentId: scenario.tournamentId,
          teamId: scenario.team.id,
          status: scenario.status,
          decisionNote: scenario.decisionNote,
          createdAt: timestamp,
          updatedAt: timestamp,
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
          createdAt: timestamp,
          updatedAt: timestamp,
          decidedAt: scenario.decidedAt ? new Date(scenario.decidedAt) : null,
        },
      })
    }
  }

  async readCompetitionFixtureState(
    fixture: DemoCompetitionFixture,
  ): Promise<DemoCompetitionFixtureState> {
    const tournament = await this.transaction.tournament.findUnique({
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
    const teams = await this.transaction.team.findMany({
      where: { id: { in: fixture.teams.map(({ id }) => id) } },
      select: { id: true, ownerId: true },
    })
    const registrations = await this.transaction.registration.findMany({
      where: { id: { in: fixture.entries.map(({ registrationId }) => registrationId) } },
      select: { id: true, tournamentId: true, teamId: true },
    })
    const bracket = await this.transaction.bracket.findUnique({
      where: { id: fixture.bracketId },
      select: { id: true, tournamentId: true },
    })
    const audit = await this.transaction.auditLog.findUnique({
      where: { id: `${fixture.bracketId}-audit` },
      select: { id: true, actorId: true, tournamentId: true, entityId: true },
    })
    const entries = await this.transaction.bracketEntry.findMany({
      where: { id: { in: fixture.entries.map(({ entryId }) => entryId) } },
      select: { id: true, bracketId: true, registrationId: true, teamId: true },
    })
    const rounds = await this.transaction.bracketRound.findMany({
      where: { id: { in: fixture.rounds.map(({ id }) => id) } },
      select: { id: true, bracketId: true },
    })
    const matches = await this.transaction.match.findMany({
      where: { id: { in: fixture.matches.map(({ id }) => id) } },
      select: { id: true, tournamentId: true, bracketId: true, roundId: true },
    })
    const results = await this.transaction.matchResult.findMany({
      where: { id: { in: completedResultIds } },
      select: { id: true, matchId: true },
    })

    return {
      tournament,
      snapshot: { teams, registrations, bracket, audit, entries, rounds, matches, results },
    }
  }

  async replaceCompetitionFixture(
    input: CompetitionFixtureReplacement,
  ): Promise<void> {
    const timestamp = fixedTimestamp(input.timestamp)
    const { fixture, tournament } = input

    await this.transaction.bracket.deleteMany({ where: input.deleteWhere })

    for (const team of fixture.teams) {
      await this.transaction.team.upsert({
        where: { id: team.id },
        update: {
          name: team.name,
          provinceCode: tournament.provinceCode,
          ownerId: "team-manager-1",
          format: tournament.format,
          isActive: true,
          deactivatedAt: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        create: {
          id: team.id,
          name: team.name,
          provinceCode: tournament.provinceCode,
          ownerId: "team-manager-1",
          format: tournament.format,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      })

      await this.transaction.registration.upsert({
        where: { id: team.registrationId },
        update: {
          tournamentId: fixture.tournamentId,
          teamId: team.id,
          status: "APPROVED",
          decisionNote: "ข้อมูลตัวอย่างสำหรับทดสอบสายการแข่งขัน",
          createdAt: timestamp,
          updatedAt: timestamp,
          decidedAt: timestamp,
          cancelledAt: null,
          withdrawnAt: null,
        },
        create: {
          id: team.registrationId,
          tournamentId: fixture.tournamentId,
          teamId: team.id,
          status: "APPROVED",
          decisionNote: "ข้อมูลตัวอย่างสำหรับทดสอบสายการแข่งขัน",
          createdAt: timestamp,
          updatedAt: timestamp,
          decidedAt: timestamp,
        },
      })
    }

    await this.createBracket(fixture, timestamp)
    await this.transaction.auditLog.upsert({
      where: { id: `${fixture.bracketId}-audit` },
      update: auditData(fixture, timestamp),
      create: { id: `${fixture.bracketId}-audit`, ...auditData(fixture, timestamp) },
    })
  }

  private async seedTeam(team: DemoTeamFixture, timestamp: Date): Promise<void> {
    await this.transaction.team.upsert({
      where: { id: team.id },
      update: {
        name: team.name,
        provinceCode: team.provinceCode,
        ownerId: team.ownerId,
        format: team.format,
        isActive: true,
        deactivatedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      create: {
        id: team.id,
        name: team.name,
        provinceCode: team.provinceCode,
        ownerId: team.ownerId,
        format: team.format,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    })

    for (const player of team.players) {
      await this.transaction.teamPlayer.upsert({
        where: { id: player.id },
        update: {
          firstName: player.firstName,
          lastName: player.lastName,
          birthDate: new Date(player.birthDate),
          jerseyNumber: player.jerseyNumber,
          isActive: player.isActive,
          deactivatedAt: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        create: {
          id: player.id,
          teamId: team.id,
          firstName: player.firstName,
          lastName: player.lastName,
          birthDate: new Date(player.birthDate),
          jerseyNumber: player.jerseyNumber,
          isActive: player.isActive,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      })
    }
  }

  private async createBracket(
    fixture: DemoCompetitionFixture,
    timestamp: Date,
  ): Promise<void> {
    await this.transaction.bracket.create({
      data: {
        id: fixture.bracketId,
        tournamentId: fixture.tournamentId,
        status: fixture.bracketStatus,
        mode: "SYSTEM_GENERATED",
        generationMethod: fixture.generationMethod,
        entriesLockedAt: timestamp,
        publishedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    })
    await this.transaction.bracketEntry.createMany({
      data: fixture.entries.map((entry) => ({
        id: entry.entryId,
        bracketId: fixture.bracketId,
        registrationId: entry.registrationId,
        teamId: entry.id,
        teamNameSnapshot: entry.name,
        seed: entry.seed,
        drawPosition: entry.seed,
        startRoundSequence: entry.startRoundSequence,
        createdAt: timestamp,
      })),
    })
    await this.transaction.bracketRound.createMany({
      data: fixture.rounds.map((round) => ({
        id: round.id,
        bracketId: fixture.bracketId,
        name: round.name,
        sequence: round.sequence,
      })),
    })
    await this.transaction.match.createMany({
      data: fixture.matches.map((match) => ({
        id: match.id,
        tournamentId: fixture.tournamentId,
        bracketId: fixture.bracketId,
        roundId: match.roundId,
        sequence: match.sequence,
        purpose: match.purpose,
        scheduledAt: new Date(match.scheduledAt),
        court: match.court,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        winnerTeamId: match.winnerTeamId,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status,
        nextSlot: match.nextSlot,
        updatedAt: timestamp,
      })),
    })
    for (const match of fixture.matches) {
      if (match.nextMatchId) {
        await this.transaction.match.update({
          where: { id: match.id },
          data: { nextMatchId: match.nextMatchId, updatedAt: timestamp },
        })
      }
      if (
        match.status === "COMPLETED" &&
        match.homeScore !== null &&
        match.awayScore !== null &&
        match.winnerTeamId
      ) {
        await this.transaction.matchResult.create({
          data: {
            id: `${match.id}-result`,
            matchId: match.id,
            confirmedBy: "admin-1",
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            winnerTeamId: match.winnerTeamId,
            confirmedAt: timestamp,
          },
        })
      }
    }
  }
}

function tournamentData(
  tournament: BaseDemoFixtureData["tournaments"][number],
  timestamp: Date,
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
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function auditData(fixture: DemoCompetitionFixture, timestamp: Date) {
  return {
    actorId: "admin-1",
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
    createdAt: timestamp,
  }
}

function fixedTimestamp(value: string): Date {
  return new Date(value)
}
