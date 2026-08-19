import { randomUUID } from "node:crypto"

import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client"
import type {
  CompetitionRepository,
  CompetitionRepositoryTransaction,
  BracketLockContext,
  BracketGenerationContext,
  LockedCompetitionWorkspace,
  LockEntriesInput,
  PersistedCompetitionBracket,
  PersistGeneratedPlanInput,
  OrganizerCompetitionWorkspace,
  BracketPublicationContext,
  SetBracketPublicationInput,
} from "@/features/competition/application/ports/competition-repository"

type CompetitionDatabaseClient = Pick<
  PrismaClient,
  | "bracket"
  | "bracketEntry"
  | "bracketRound"
  | "match"
  | "auditLog"
  | "tournament"
>

export class PrismaCompetitionRepository implements CompetitionRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly createId: () => string = randomUUID,
  ) {}

  async inTransaction<T>(
    operation: (repository: CompetitionRepositoryTransaction) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction((transaction) =>
      operation(new PrismaCompetitionOperations(transaction, this.createId)),
    )
  }

  persistGeneratedPlan(input: PersistGeneratedPlanInput) {
    return this.prisma.$transaction((transaction) =>
      new PrismaCompetitionOperations(
        transaction,
        this.createId,
      ).persistGeneratedPlan(input),
    )
  }

  findLockContext(tournamentId: string) {
    return new PrismaCompetitionOperations(
      this.prisma,
      this.createId,
    ).findLockContext(tournamentId)
  }

  lockEntries(input: LockEntriesInput) {
    return this.prisma.$transaction((transaction) =>
      new PrismaCompetitionOperations(transaction, this.createId).lockEntries(input),
    )
  }

  findGenerationContext(tournamentId: string) {
    return new PrismaCompetitionOperations(
      this.prisma,
      this.createId,
    ).findGenerationContext(tournamentId)
  }

  async findOrganizerWorkspace(
    tournamentId: string,
  ): Promise<OrganizerCompetitionWorkspace | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        title: true,
        organizerId: true,
        status: true,
        version: true,
        registrations: {
          where: { status: "APPROVED" },
          select: { id: true },
        },
        brackets: {
          where: { status: { not: "ARCHIVED" } },
          take: 1,
          select: {
            id: true,
            version: true,
            status: true,
            generationMethod: true,
            entriesLockedAt: true,
            entries: { orderBy: { drawPosition: "asc" } },
            rounds: {
              orderBy: { sequence: "asc" },
              select: {
                id: true,
                name: true,
                sequence: true,
                matches: {
                  orderBy: { sequence: "asc" },
                  select: {
                    id: true,
                    sequence: true,
                    homeTeamId: true,
                    awayTeamId: true,
                    status: true,
                  },
                },
              },
            },
            matches: {
              where: { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
              select: { id: true },
            },
          },
        },
      },
    })
    if (!tournament) return null

    const bracket = tournament.brackets[0]
    return {
      tournament: {
        id: tournament.id,
        title: tournament.title,
        organizerId: tournament.organizerId,
        status: tournament.status,
        version: tournament.version,
      },
      approvedTeamCount: tournament.registrations.length,
      bracket: bracket
        ? {
            id: bracket.id,
            version: bracket.version,
            status: bracket.status,
            generationMethod: bracket.generationMethod,
            entriesLockedAt: bracket.entriesLockedAt?.toISOString() ?? null,
            hasStartedMatch: bracket.matches.length > 0,
            entries: bracket.entries,
            rounds: bracket.rounds,
          }
        : null,
    }
  }

  findPublicationContext(tournamentId: string) {
    return new PrismaCompetitionOperations(
      this.prisma,
      this.createId,
    ).findPublicationContext(tournamentId)
  }

  setPublication(input: SetBracketPublicationInput) {
    return this.prisma.$transaction((transaction) =>
      new PrismaCompetitionOperations(transaction, this.createId).setPublication(
        input,
      ),
    )
  }
}

class PrismaCompetitionOperations implements CompetitionRepositoryTransaction {
  constructor(
    private readonly prisma: CompetitionDatabaseClient,
    private readonly createId: () => string,
  ) {}

  async findLockContext(tournamentId: string): Promise<BracketLockContext | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "asc" },
          include: { team: { select: { name: true } } },
        },
        brackets: {
          where: { status: { not: "ARCHIVED" } },
          include: {
            matches: {
              where: { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
              select: { id: true },
            },
          },
        },
      },
    })
    if (!tournament) return null

    return {
      tournamentId: tournament.id,
      organizerId: tournament.organizerId,
      tournamentStatus: tournament.status,
      capacity: tournament.capacity,
      version: tournament.version,
      approvedEntries: tournament.registrations.map((registration) => ({
        registrationId: registration.id,
        teamId: registration.teamId,
        teamName: registration.team.name,
      })),
      hasStartedMatch: tournament.brackets.some(
        (bracket) => bracket.matches.length > 0,
      ),
    }
  }

  async findGenerationContext(
    tournamentId: string,
  ): Promise<BracketGenerationContext | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        organizerId: true,
        brackets: {
          where: { status: { not: "ARCHIVED" } },
          take: 1,
          select: {
            id: true,
            version: true,
            generationMethod: true,
            drawToken: true,
            entries: { orderBy: { drawPosition: "asc" } },
            matches: {
              where: { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
              select: { id: true },
            },
          },
        },
      },
    })
    const bracket = tournament?.brackets[0]
    if (!tournament || !bracket) return null

    return {
      tournamentId: tournament.id,
      organizerId: tournament.organizerId,
      bracketId: bracket.id,
      bracketVersion: bracket.version,
      generationMethod: bracket.generationMethod,
      drawToken: bracket.drawToken,
      hasStartedMatch: bracket.matches.length > 0,
      entries: bracket.entries,
    }
  }

  async findPublicationContext(
    tournamentId: string,
  ): Promise<BracketPublicationContext | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        organizerId: true,
        brackets: {
          where: { status: { not: "ARCHIVED" } },
          take: 1,
          select: {
            id: true,
            version: true,
            status: true,
            _count: { select: { entries: true, rounds: true, matches: true } },
            matches: {
              where: { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
              select: { id: true },
            },
          },
        },
      },
    })
    const bracket = tournament?.brackets[0]
    if (!tournament || !bracket) return null

    return {
      tournamentId: tournament.id,
      organizerId: tournament.organizerId,
      bracketId: bracket.id,
      bracketVersion: bracket.version,
      bracketStatus: bracket.status,
      entryCount: bracket._count.entries,
      roundCount: bracket._count.rounds,
      matchCount: bracket._count.matches,
      hasStartedMatch: bracket.matches.length > 0,
    }
  }

  async lockEntries(
    input: LockEntriesInput,
  ): Promise<LockedCompetitionWorkspace> {
    const context = await this.findLockContext(input.tournamentId)
    if (!context) throw new Error("NOT_FOUND")

    const updated = await this.prisma.tournament.updateMany({
      where: {
        id: input.tournamentId,
        version: input.expectedVersion,
        status: "REGISTRATION_CLOSED",
      },
      data: { version: { increment: 1 } },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    const bracket = await this.prisma.bracket.create({
      data: {
        tournamentId: input.tournamentId,
        entriesLockedAt: new Date(input.at),
      },
      select: { id: true, tournamentId: true, version: true },
    })
    const entries = context.approvedEntries.map((entry, index) => ({
      id: this.createId(),
      bracketId: bracket.id,
      registrationId: entry.registrationId,
      teamId: entry.teamId,
      teamNameSnapshot: entry.teamName,
      seed: index + 1,
      drawPosition: index + 1,
      startRoundSequence: 1,
    }))
    await this.prisma.bracketEntry.createMany({ data: entries })
    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        tournamentId: input.tournamentId,
        action: "BRACKET_ENTRIES_LOCKED",
        entityType: "Bracket",
        entityId: bracket.id,
        afterJson: toJsonValue({
          entryCount: entries.length,
          adminOverride: input.adminOverride,
        }),
      },
    })

    return {
      ...bracket,
      entries: entries.map(({ teamId, teamNameSnapshot }) => ({
        teamId,
        teamNameSnapshot,
      })),
    }
  }

  async persistGeneratedPlan(
    input: PersistGeneratedPlanInput,
  ): Promise<PersistedCompetitionBracket> {
    const updated = await this.prisma.bracket.updateMany({
      where: {
        id: input.bracketId,
        tournamentId: input.tournamentId,
        version: input.expectedVersion,
        status: "DRAFT",
        entriesLockedAt: { not: null },
      },
      data: {
        generationMethod: input.generationMethod,
        drawToken: input.drawToken,
        version: { increment: 1 },
      },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    await this.prisma.bracketRound.deleteMany({
      where: { bracketId: input.bracketId },
    })
    await Promise.all(
      input.entries.map((entry) =>
        this.prisma.bracketEntry.update({
          where: { id: entry.id },
          data: {
            seed: entry.seed,
            drawPosition: entry.drawPosition,
            startRoundSequence: entry.startRoundSequence,
          },
        }),
      ),
    )

    const roundIds = new Map(
      input.plan.rounds.map((round) => [round.sequence, this.createId()]),
    )
    const matchIds = new Map(
      input.plan.matches.map((match) => [match.key, this.createId()]),
    )

    await this.prisma.bracketRound.createMany({
      data: input.plan.rounds.map((round) => ({
        id: requiredId(roundIds, round.sequence),
        bracketId: input.bracketId,
        name: round.name,
        sequence: round.sequence,
      })),
    })
    await this.prisma.match.createMany({
      data: input.plan.matches.map((match) => ({
        id: requiredId(matchIds, match.key),
        tournamentId: input.tournamentId,
        bracketId: input.bracketId,
        roundId: requiredId(roundIds, match.roundSequence),
        sequence: match.sequence,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        nextMatchId: match.nextMatchKey
          ? requiredId(matchIds, match.nextMatchKey)
          : null,
        nextSlot: match.nextSlot,
      })),
    })
    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        tournamentId: input.tournamentId,
        action: "BRACKET_GENERATED",
        entityType: "Bracket",
        entityId: input.bracketId,
        afterJson: toJsonValue({
          bracketId: input.bracketId,
          generationMethod: input.generationMethod,
          drawToken: input.drawToken,
          entryCount: input.entries.length,
          matchCount: input.plan.matches.length,
          adminOverride: input.adminOverride,
        }),
      },
    })

    return {
      id: input.bracketId,
      tournamentId: input.tournamentId,
      version: input.expectedVersion + 1,
    }
  }

  async setPublication(
    input: SetBracketPublicationInput,
  ): Promise<PersistedCompetitionBracket> {
    const beforeStatus = input.published ? "DRAFT" : "PUBLISHED"
    const afterStatus = input.published ? "PUBLISHED" : "DRAFT"
    const updated = await this.prisma.bracket.updateMany({
      where: {
        id: input.bracketId,
        tournamentId: input.tournamentId,
        version: input.expectedVersion,
        status: beforeStatus,
      },
      data: {
        status: afterStatus,
        publishedAt: input.published ? new Date(input.at) : null,
        version: { increment: 1 },
      },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        tournamentId: input.tournamentId,
        action: input.published ? "BRACKET_PUBLISHED" : "BRACKET_UNPUBLISHED",
        entityType: "Bracket",
        entityId: input.bracketId,
        afterJson: toJsonValue({
          status: afterStatus,
          reason: input.reason,
          adminOverride: input.adminOverride,
        }),
      },
    })

    return {
      id: input.bracketId,
      tournamentId: input.tournamentId,
      version: input.expectedVersion + 1,
    }
  }
}

function requiredId<TKey>(map: Map<TKey, string>, key: TKey): string {
  const id = map.get(key)
  if (!id) throw new Error("BRACKET_PLAN_INVALID")
  return id
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}
