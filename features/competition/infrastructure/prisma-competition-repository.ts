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
  MatchScheduleContext,
  ScheduleMatchMutation,
  ScheduledCompetitionMatch,
  MatchResultContext,
  RecordMatchScoreMutation,
  ConfirmMatchResultMutation,
  ResultCompetitionMatch,
  MatchResultCorrectionContext,
  CorrectMatchResultMutation,
} from "@/features/competition/application/ports/competition-repository"

type CompetitionDatabaseClient = Pick<
  PrismaClient,
  | "bracket"
  | "bracketEntry"
  | "bracketRound"
  | "match"
  | "matchResult"
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
                    scheduledAt: true,
                    court: true,
                    version: true,
                    homeScore: true,
                    awayScore: true,
                    winnerTeamId: true,
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
            rounds: bracket.rounds.map((round) => ({
              ...round,
              matches: round.matches.map((match) => ({
                ...match,
                scheduledAt: match.scheduledAt?.toISOString() ?? null,
              })),
            })),
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

  findMatchScheduleContext(input: {
    tournamentId: string
    matchId: string
    scheduledAt: string
    court: string
  }) {
    return new PrismaCompetitionOperations(
      this.prisma,
      this.createId,
    ).findMatchScheduleContext(input)
  }

  scheduleMatch(input: ScheduleMatchMutation) {
    return this.prisma.$transaction((transaction) =>
      new PrismaCompetitionOperations(transaction, this.createId).scheduleMatch(
        input,
      ),
    )
  }

  findResultContext(input: { tournamentId: string; matchId: string }) {
    return new PrismaCompetitionOperations(
      this.prisma,
      this.createId,
    ).findResultContext(input)
  }

  recordScore(input: RecordMatchScoreMutation) {
    return this.prisma.$transaction((transaction) =>
      new PrismaCompetitionOperations(transaction, this.createId).recordScore(
        input,
      ),
    )
  }

  confirmResultAndAdvance(input: ConfirmMatchResultMutation) {
    return this.prisma.$transaction((transaction) =>
      new PrismaCompetitionOperations(
        transaction,
        this.createId,
      ).confirmResultAndAdvance(input),
    )
  }

  findResultCorrectionContext(input: {
    tournamentId: string
    matchId: string
  }) {
    return new PrismaCompetitionOperations(
      this.prisma,
      this.createId,
    ).findResultCorrectionContext(input)
  }

  correctResult(input: CorrectMatchResultMutation) {
    return this.prisma.$transaction((transaction) =>
      new PrismaCompetitionOperations(transaction, this.createId).correctResult(
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

  async findMatchScheduleContext(input: {
    tournamentId: string
    matchId: string
    scheduledAt: string
    court: string
  }): Promise<MatchScheduleContext | null> {
    const match = await this.prisma.match.findFirst({
      where: { id: input.matchId, tournamentId: input.tournamentId },
      select: {
        id: true,
        status: true,
        version: true,
        bracket: { select: { status: true } },
        tournament: {
          select: {
            id: true,
            organizerId: true,
            startsAt: true,
            endsAt: true,
          },
        },
      },
    })
    if (!match) return null

    const conflict = await this.prisma.match.findFirst({
      where: {
        tournamentId: input.tournamentId,
        id: { not: input.matchId },
        scheduledAt: new Date(input.scheduledAt),
        court: { equals: input.court, mode: "insensitive" },
        status: { not: "COMPLETED" },
      },
      select: { id: true },
    })

    return {
      tournamentId: match.tournament.id,
      organizerId: match.tournament.organizerId,
      tournamentStartsAt: match.tournament.startsAt.toISOString(),
      tournamentEndsAt: match.tournament.endsAt.toISOString(),
      bracketStatus: match.bracket.status,
      matchId: match.id,
      matchStatus: match.status,
      matchVersion: match.version,
      hasCourtConflict: Boolean(conflict),
    }
  }

  async scheduleMatch(
    input: ScheduleMatchMutation,
  ): Promise<ScheduledCompetitionMatch> {
    const updated = await this.prisma.match.updateMany({
      where: {
        id: input.matchId,
        tournamentId: input.tournamentId,
        version: input.expectedVersion,
        status: "SCHEDULED",
      },
      data: {
        scheduledAt: new Date(input.scheduledAt),
        court: input.court,
        version: { increment: 1 },
      },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        tournamentId: input.tournamentId,
        action: "MATCH_SCHEDULED",
        entityType: "Match",
        entityId: input.matchId,
        afterJson: toJsonValue({
          scheduledAt: input.scheduledAt,
          court: input.court,
          overrideReason: input.overrideReason,
          adminOverride: input.adminOverride,
        }),
      },
    })

    return {
      id: input.matchId,
      scheduledAt: input.scheduledAt,
      court: input.court,
      version: input.expectedVersion + 1,
    }
  }

  async findResultContext(input: {
    tournamentId: string
    matchId: string
  }): Promise<MatchResultContext | null> {
    const match = await this.prisma.match.findFirst({
      where: { id: input.matchId, tournamentId: input.tournamentId },
      select: {
        id: true,
        status: true,
        version: true,
        homeTeamId: true,
        awayTeamId: true,
        nextMatchId: true,
        nextSlot: true,
        result: { select: { id: true } },
        bracket: { select: { status: true } },
        tournament: { select: { id: true, organizerId: true } },
        nextMatch: {
          select: {
            homeTeamId: true,
            awayTeamId: true,
          },
        },
      },
    })
    if (!match) return null

    return {
      tournamentId: match.tournament.id,
      organizerId: match.tournament.organizerId,
      bracketStatus: match.bracket.status,
      matchId: match.id,
      matchStatus: match.status,
      matchVersion: match.version,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      nextMatchId: match.nextMatchId,
      nextSlot: match.nextSlot,
      nextSlotTeamId:
        match.nextSlot === "HOME"
          ? match.nextMatch?.homeTeamId ?? null
          : match.nextSlot === "AWAY"
            ? match.nextMatch?.awayTeamId ?? null
            : null,
      resultConfirmed: Boolean(match.result),
    }
  }

  async recordScore(
    input: RecordMatchScoreMutation,
  ): Promise<ResultCompetitionMatch> {
    const updated = await this.prisma.match.updateMany({
      where: {
        id: input.matchId,
        tournamentId: input.tournamentId,
        version: input.expectedVersion,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        result: { is: null },
      },
      data: {
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        status: "IN_PROGRESS",
        winnerTeamId: null,
        version: { increment: 1 },
      },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        tournamentId: input.tournamentId,
        action: "MATCH_SCORE_RECORDED",
        entityType: "Match",
        entityId: input.matchId,
        afterJson: toJsonValue({
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          adminOverride: input.adminOverride,
        }),
      },
    })

    return resultMatch(input, "IN_PROGRESS", null)
  }

  async findResultCorrectionContext(input: {
    tournamentId: string
    matchId: string
  }): Promise<MatchResultCorrectionContext | null> {
    const match = await this.prisma.match.findFirst({
      where: { id: input.matchId, tournamentId: input.tournamentId },
      select: {
        id: true,
        version: true,
        status: true,
        homeTeamId: true,
        awayTeamId: true,
        winnerTeamId: true,
        nextMatchId: true,
        nextSlot: true,
        tournament: { select: { id: true, organizerId: true } },
        result: { select: { id: true } },
        nextMatch: {
          select: {
            status: true,
            homeTeamId: true,
            awayTeamId: true,
            homeScore: true,
            awayScore: true,
            result: { select: { id: true } },
          },
        },
      },
    })
    if (
      !match ||
      !match.homeTeamId ||
      !match.awayTeamId ||
      !match.winnerTeamId ||
      !match.result
    ) {
      return null
    }

    return {
      tournamentId: match.tournament.id,
      organizerId: match.tournament.organizerId,
      matchId: match.id,
      matchVersion: match.version,
      matchStatus: match.status,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      currentWinnerTeamId: match.winnerTeamId,
      nextMatchId: match.nextMatchId,
      nextSlot: match.nextSlot,
      nextMatchStatus: match.nextMatch?.status ?? null,
      nextSlotTeamId:
        match.nextSlot === "HOME"
          ? match.nextMatch?.homeTeamId ?? null
          : match.nextSlot === "AWAY"
            ? match.nextMatch?.awayTeamId ?? null
            : null,
      nextResultConfirmed: Boolean(match.nextMatch?.result),
      nextHasScore: Boolean(
        match.nextMatch &&
          (match.nextMatch.homeScore !== null ||
            match.nextMatch.awayScore !== null),
      ),
    }
  }

  async correctResult(
    input: CorrectMatchResultMutation,
  ): Promise<ResultCompetitionMatch> {
    const corrected = await this.prisma.match.updateMany({
      where: {
        id: input.matchId,
        tournamentId: input.tournamentId,
        version: input.expectedVersion,
        status: "COMPLETED",
        winnerTeamId: input.previousWinnerTeamId,
      },
      data: {
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        winnerTeamId: input.winnerTeamId,
        version: { increment: 1 },
      },
    })
    if (corrected.count !== 1) throw new Error("CONFLICT")

    const correctedResult = await this.prisma.matchResult.updateMany({
      where: {
        matchId: input.matchId,
        winnerTeamId: input.previousWinnerTeamId,
      },
      data: {
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        winnerTeamId: input.winnerTeamId,
        confirmedBy: input.actorId,
        confirmedAt: new Date(input.at),
      },
    })
    if (correctedResult.count !== 1) throw new Error("CONFLICT")

    if (
      input.replaceDownstreamSlot &&
      input.nextMatchId &&
      input.nextSlot
    ) {
      const slotField =
        input.nextSlot === "HOME" ? "homeTeamId" : "awayTeamId"
      const replaced = await this.prisma.match.updateMany({
        where: {
          id: input.nextMatchId,
          tournamentId: input.tournamentId,
          status: "SCHEDULED",
          homeScore: null,
          awayScore: null,
          result: { is: null },
          [slotField]: input.previousWinnerTeamId,
        },
        data: {
          [slotField]: input.winnerTeamId,
          version: { increment: 1 },
        },
      })
      if (replaced.count !== 1) {
        throw new Error("RESULT_CORRECTION_DOWNSTREAM_LOCKED")
      }
    }

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        tournamentId: input.tournamentId,
        action: "MATCH_RESULT_CORRECTED",
        entityType: "Match",
        entityId: input.matchId,
        beforeJson: toJsonValue({
          winnerTeamId: input.previousWinnerTeamId,
        }),
        afterJson: toJsonValue({
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          winnerTeamId: input.winnerTeamId,
          downstreamSlotReplaced: input.replaceDownstreamSlot,
          reason: input.reason,
        }),
      },
    })

    return resultMatch(input, "COMPLETED", input.winnerTeamId)
  }

  async confirmResultAndAdvance(
    input: ConfirmMatchResultMutation,
  ): Promise<ResultCompetitionMatch> {
    const updated = await this.prisma.match.updateMany({
      where: {
        id: input.matchId,
        tournamentId: input.tournamentId,
        version: input.expectedVersion,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        result: { is: null },
      },
      data: {
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        winnerTeamId: input.winnerTeamId,
        status: "COMPLETED",
        version: { increment: 1 },
      },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    await this.prisma.matchResult.create({
      data: {
        id: this.createId(),
        matchId: input.matchId,
        confirmedBy: input.actorId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        winnerTeamId: input.winnerTeamId,
        confirmedAt: new Date(input.at),
      },
    })

    if (input.nextMatchId && input.nextSlot) {
      const slotField =
        input.nextSlot === "HOME" ? "homeTeamId" : "awayTeamId"
      const advanced = await this.prisma.match.updateMany({
        where: {
          id: input.nextMatchId,
          tournamentId: input.tournamentId,
          status: "SCHEDULED",
          result: { is: null },
          OR: [
            { [slotField]: null },
            { [slotField]: input.winnerTeamId },
          ],
        },
        data: {
          [slotField]: input.winnerTeamId,
          version: { increment: 1 },
        },
      })
      if (advanced.count !== 1) {
        throw new Error("MATCH_ADVANCEMENT_CONFLICT")
      }
    }

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        tournamentId: input.tournamentId,
        action: "MATCH_RESULT_CONFIRMED",
        entityType: "Match",
        entityId: input.matchId,
        afterJson: toJsonValue({
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          winnerTeamId: input.winnerTeamId,
          nextMatchId: input.nextMatchId,
          nextSlot: input.nextSlot,
          adminOverride: input.adminOverride,
        }),
      },
    })

    return resultMatch(input, "COMPLETED", input.winnerTeamId)
  }
}

function resultMatch(
  input: {
    matchId: string
    homeScore: number
    awayScore: number
    expectedVersion: number
  },
  status: string,
  winnerTeamId: string | null,
): ResultCompetitionMatch {
  return {
    id: input.matchId,
    status,
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    winnerTeamId,
    version: input.expectedVersion + 1,
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
