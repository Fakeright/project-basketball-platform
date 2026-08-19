import { randomUUID } from "node:crypto"

import type {
  Prisma,
  PrismaClient,
} from "@/lib/generated/prisma/client"
import type {
  TournamentOperation,
  TournamentOperationInput,
} from "@/features/tournament-operations/domain/tournament-operation"

import type {
  TournamentLifecycleTransition,
  AdminTournamentFilters,
  TournamentMutationAudit,
  TournamentOperationsRepository,
  TournamentReviewTransition,
} from "./tournament-operations-repository"

const tournamentOperationInclude = {
  province: true,
} satisfies Prisma.TournamentInclude

type TournamentOperationRow = Prisma.TournamentGetPayload<{
  include: typeof tournamentOperationInclude
}> & { organizer?: { displayName: string } }

type TournamentTransactionClient = Pick<
  Prisma.TransactionClient,
  "tournament" | "tournamentReview" | "auditLog"
>

export class PrismaTournamentOperationsRepository
  implements TournamentOperationsRepository
{
  constructor(
    private readonly prisma: PrismaClient,
    private readonly createId: () => string = randomUUID,
  ) {}

  async create(
    input: TournamentOperationInput & { organizerId: string },
    audit: TournamentMutationAudit,
  ): Promise<TournamentOperation> {
    return this.prisma.$transaction(async (transaction) => {
      const tournament = await transaction.tournament.create({
        data: {
          ...input,
          slug: `tournament-${this.createId()}`,
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
          registrationDeadline: new Date(input.registrationDeadline),
        },
        include: tournamentOperationInclude,
      })
      const mapped = mapTournament(tournament)
      await appendTournamentAudit(transaction, {
        ...audit,
        tournamentId: tournament.id,
        before: null,
        after: mapped,
      })
      return mapped
    })
  }

  async findById(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: tournamentOperationInclude,
    })
    return tournament ? mapTournament(tournament) : null
  }

  async listByOrganizer(organizerId: string) {
    const tournaments = await this.prisma.tournament.findMany({
      where: { organizerId },
      orderBy: { updatedAt: "desc" },
      include: tournamentOperationInclude,
    })
    return tournaments.map(mapTournament)
  }

  async listForAdmin(filters: AdminTournamentFilters) {
    const query = filters.query?.trim()
    const textFilter = query
      ? { contains: query, mode: "insensitive" as const }
      : undefined
    const tournaments = await this.prisma.tournament.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(textFilter
          ? {
              OR: [
                { title: textFilter },
                { organizer: { displayName: textFilter } },
                { province: { nameTh: textFilter } },
                { province: { nameEn: textFilter } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        organizer: { select: { displayName: true } },
        province: true,
      },
    })
    return tournaments.map(mapTournament)
  }

  async listByStatus(status: TournamentOperation["status"]) {
    const tournaments = await this.prisma.tournament.findMany({
      where: { status },
      orderBy: { updatedAt: "asc" },
      include: {
        organizer: { select: { displayName: true } },
        province: true,
      },
    })
    return tournaments.map(mapTournament)
  }

  async updateWithVersion(
    id: string,
    version: number,
    changes: Partial<TournamentOperation>,
    audit: TournamentMutationAudit,
  ) {
    return this.prisma.$transaction((transaction) =>
      updateAndReloadTournament(
        transaction,
        id,
        version,
        mapTournamentChanges(changes),
        audit,
      ),
    )
  }

  async reviewWithVersion(
    input: TournamentReviewTransition,
  ): Promise<TournamentOperation> {
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.tournament.findUnique({
        where: { id: input.tournamentId },
        include: tournamentOperationInclude,
      })
      if (!current) throw new Error("NOT_FOUND")

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
        include: tournamentOperationInclude,
      })
      if (!tournament) throw new Error("NOT_FOUND")
      const after = mapTournament(tournament)
      await appendTournamentAudit(transaction, {
        actorId: input.reviewerId,
        action: "tournament.reviewed",
        adminOverride: false,
        tournamentId: input.tournamentId,
        before: mapTournament(current),
        after,
      })
      return after
    })
  }

  async transitionWithVersion(
    input: TournamentLifecycleTransition,
  ): Promise<TournamentOperation> {
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.tournament.findUnique({
        where: { id: input.tournamentId },
        include: tournamentOperationInclude,
      })
      if (!current) throw new Error("NOT_FOUND")

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

      const tournament = await transaction.tournament.findUnique({
        where: { id: input.tournamentId },
        include: tournamentOperationInclude,
      })
      if (!tournament) throw new Error("NOT_FOUND")
      const after = mapTournament(tournament)
      await appendTournamentAudit(transaction, {
        actorId: input.actorId,
        action: input.action,
        adminOverride: input.adminOverride,
        tournamentId: input.tournamentId,
        before: mapTournament(current),
        after,
      })
      return after
    })
  }
}

async function updateAndReloadTournament(
  client: TournamentTransactionClient,
  id: string,
  version: number,
  data: Prisma.TournamentUncheckedUpdateManyInput,
  audit: TournamentMutationAudit,
) {
  const current = await client.tournament.findUnique({
    where: { id },
    include: tournamentOperationInclude,
  })
  if (!current) throw new Error("NOT_FOUND")

  const update = await client.tournament.updateMany({
    where: { id, version },
    data: {
      ...data,
      version: { increment: 1 },
    },
  })
  if (update.count !== 1) throw new Error("CONFLICT")

  const tournament = await client.tournament.findUnique({
    where: { id },
    include: tournamentOperationInclude,
  })
  if (!tournament) throw new Error("NOT_FOUND")
  const after = mapTournament(tournament)
  await appendTournamentAudit(client, {
    ...audit,
    tournamentId: id,
    before: mapTournament(current),
    after,
  })
  return after
}

async function appendTournamentAudit(
  client: Pick<Prisma.TransactionClient, "auditLog">,
  input: TournamentMutationAudit & {
    tournamentId: string
    before: TournamentOperation | null
    after: TournamentOperation
  },
) {
  const auditData = {
    actorId: input.actorId,
    tournamentId: input.tournamentId,
    entityType: "Tournament",
    entityId: input.tournamentId,
    beforeJson: input.before ? toJsonValue(input.before) : undefined,
    afterJson: toJsonValue(input.after),
  }
  await client.auditLog.create({
    data: { ...auditData, action: input.action },
  })
  if (input.adminOverride) {
    await client.auditLog.create({
      data: { ...auditData, action: "tournament.admin_override" },
    })
  }
}

function mapTournamentChanges(
  changes: Partial<TournamentOperation>,
): Prisma.TournamentUncheckedUpdateManyInput {
  const data: Prisma.TournamentUncheckedUpdateManyInput = {}

  if (changes.title !== undefined) data.title = changes.title
  if (changes.description !== undefined) data.description = changes.description
  if (changes.rules !== undefined) data.rules = changes.rules
  if (changes.provinceCode !== undefined) data.provinceCode = changes.provinceCode
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

function mapTournament(tournament: TournamentOperationRow): TournamentOperation {
  return {
    id: tournament.id,
    title: tournament.title,
    description: tournament.description,
    rules: tournament.rules,
    provinceCode: tournament.provinceCode,
    province: tournament.province.nameTh,
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

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}
