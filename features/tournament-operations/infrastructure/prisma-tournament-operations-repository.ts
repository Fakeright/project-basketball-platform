import { randomUUID } from "node:crypto"

import type {
  Prisma,
  PrismaClient,
  Tournament,
} from "@/lib/generated/prisma/client"
import type {
  TournamentOperation,
  TournamentOperationInput,
} from "@/features/tournament-operations/domain/tournament-operation"

import type {
  TournamentOperationsRepository,
  TournamentReviewTransition,
} from "./tournament-operations-repository"

type TournamentTransactionClient = Pick<Prisma.TransactionClient, "tournament">

export class PrismaTournamentOperationsRepository
  implements TournamentOperationsRepository
{
  constructor(
    private readonly prisma: PrismaClient,
    private readonly createId: () => string = randomUUID,
  ) {}

  async create(
    input: TournamentOperationInput & { organizerId: string },
  ): Promise<TournamentOperation> {
    const tournament = await this.prisma.tournament.create({
      data: {
        ...input,
        slug: `tournament-${this.createId()}`,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        registrationDeadline: new Date(input.registrationDeadline),
      },
    })

    return mapTournament(tournament)
  }

  async findById(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    })
    return tournament ? mapTournament(tournament) : null
  }

  async listByOrganizer(organizerId: string) {
    const tournaments = await this.prisma.tournament.findMany({
      where: { organizerId },
      orderBy: { updatedAt: "desc" },
    })
    return tournaments.map(mapTournament)
  }

  async listByStatus(status: TournamentOperation["status"]) {
    const tournaments = await this.prisma.tournament.findMany({
      where: { status },
      orderBy: { updatedAt: "asc" },
      include: {
        organizer: { select: { displayName: true } },
      },
    })
    return tournaments.map(mapTournament)
  }

  async updateWithVersion(
    id: string,
    version: number,
    changes: Partial<TournamentOperation>,
  ) {
    return updateAndReloadTournament(
      this.prisma,
      id,
      version,
      mapTournamentChanges(changes),
    )
  }

  async appendReview(
    input: Parameters<TournamentOperationsRepository["appendReview"]>[0],
  ) {
    await this.prisma.tournamentReview.create({ data: input })
  }

  async reviewWithVersion(
    input: TournamentReviewTransition,
  ): Promise<TournamentOperation> {
    return this.prisma.$transaction(async (transaction) => {
      const update = await transaction.tournament.updateMany({
        where: {
          id: input.tournamentId,
          version: input.version,
          status: input.sourceStatus,
        },
        data: {
          status: input.status,
          version: { increment: 1 },
        },
      })
      if (update.count !== 1) throw new Error("CONFLICT")

      await transaction.tournamentReview.create({
        data: {
          tournamentId: input.tournamentId,
          reviewerId: input.reviewerId,
          decision: input.decision,
          note: input.note,
        },
      })

      const tournament = await transaction.tournament.findUnique({
        where: { id: input.tournamentId },
      })
      if (!tournament) throw new Error("NOT_FOUND")
      return mapTournament(tournament)
    })
  }
}

async function updateAndReloadTournament(
  client: TournamentTransactionClient,
  id: string,
  version: number,
  data: Prisma.TournamentUpdateManyMutationInput,
) {
  const update = await client.tournament.updateMany({
    where: { id, version },
    data: {
      ...data,
      version: { increment: 1 },
    },
  })
  if (update.count !== 1) throw new Error("CONFLICT")

  const tournament = await client.tournament.findUnique({ where: { id } })
  if (!tournament) throw new Error("NOT_FOUND")
  return mapTournament(tournament)
}

function mapTournamentChanges(
  changes: Partial<TournamentOperation>,
): Prisma.TournamentUpdateManyMutationInput {
  const data: Prisma.TournamentUpdateManyMutationInput = {}

  if (changes.title !== undefined) data.title = changes.title
  if (changes.description !== undefined) data.description = changes.description
  if (changes.rules !== undefined) data.rules = changes.rules
  if (changes.province !== undefined) data.province = changes.province
  if (changes.venue !== undefined) data.venue = changes.venue
  if (changes.format !== undefined) data.format = changes.format
  if (changes.ageGroup !== undefined) data.ageGroup = changes.ageGroup
  if (changes.startsAt !== undefined) data.startsAt = new Date(changes.startsAt)
  if (changes.endsAt !== undefined) data.endsAt = new Date(changes.endsAt)
  if (changes.registrationDeadline !== undefined) {
    data.registrationDeadline = new Date(changes.registrationDeadline)
  }
  if (changes.capacity !== undefined) data.capacity = changes.capacity
  if (changes.status !== undefined) data.status = changes.status

  return data
}

function mapTournament(
  tournament: Tournament & { organizer?: { displayName: string } },
): TournamentOperation {
  return {
    id: tournament.id,
    title: tournament.title,
    description: tournament.description,
    rules: tournament.rules,
    province: tournament.province,
    venue: tournament.venue,
    format: tournament.format,
    ageGroup: tournament.ageGroup,
    startsAt: tournament.startsAt.toISOString(),
    endsAt: tournament.endsAt.toISOString(),
    registrationDeadline: tournament.registrationDeadline.toISOString(),
    capacity: tournament.capacity,
    organizerId: tournament.organizerId,
    organizerName: tournament.organizer?.displayName,
    status: tournament.status,
    version: tournament.version,
    createdAt: tournament.createdAt.toISOString(),
    updatedAt: tournament.updatedAt.toISOString(),
  }
}
