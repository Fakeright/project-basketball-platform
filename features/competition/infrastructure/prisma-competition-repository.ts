import { randomUUID } from "node:crypto"

import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client"
import type {
  CompetitionRepository,
  CompetitionRepositoryTransaction,
  PersistedCompetitionBracket,
  PersistGeneratedPlanInput,
} from "@/features/competition/application/ports/competition-repository"

type CompetitionDatabaseClient = Pick<
  PrismaClient,
  "bracket" | "bracketEntry" | "bracketRound" | "match" | "auditLog"
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
}

class PrismaCompetitionOperations implements CompetitionRepositoryTransaction {
  constructor(
    private readonly prisma: CompetitionDatabaseClient,
    private readonly createId: () => string,
  ) {}

  async persistGeneratedPlan(
    input: PersistGeneratedPlanInput,
  ): Promise<PersistedCompetitionBracket> {
    const bracket = await this.prisma.bracket.create({
        data: {
          id: input.bracketId,
          tournamentId: input.tournamentId,
          generationMethod: input.generationMethod,
          entriesLockedAt: new Date(input.at),
        },
        select: { id: true, tournamentId: true, version: true },
      })
      const roundIds = new Map(
        input.plan.rounds.map((round) => [round.sequence, this.createId()]),
      )
      const matchIds = new Map(
        input.plan.matches.map((match) => [match.key, this.createId()]),
      )

      await this.prisma.bracketEntry.createMany({
        data: input.entries.map((entry) => ({ ...entry })),
      })
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
            entryCount: input.entries.length,
            matchCount: input.plan.matches.length,
            adminOverride: input.adminOverride,
          }),
        },
      })
    return bracket
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
