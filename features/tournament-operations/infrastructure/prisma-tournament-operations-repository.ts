import { randomUUID } from "node:crypto"

import {
  Prisma,
  type PrismaClient,
} from "@/lib/generated/prisma/client"
import {
  assertTournamentCanComplete,
  assertTournamentCanStart,
} from "@/features/competition/domain/tournament-competition-policy"
import {
  getTournamentGovernanceIssues,
  getTournamentGovernanceReasonIssues,
  TournamentGovernancePolicyError,
  type TournamentGovernanceContext,
} from "@/features/tournament-operations/domain/tournament-governance-policy"
import type {
  TournamentOperation,
  TournamentOperationInput,
} from "@/features/tournament-operations/domain/tournament-operation"

import type {
  TournamentCompetitionTransition,
  TournamentCompetitionOperationContext,
  TournamentLifecycleTransition,
  AdminTournamentFilters,
  TournamentMutationAudit,
  TournamentOperationsRepository,
  TournamentPermanentDelete,
  TournamentReviewTransition,
  TournamentGovernanceTransition,
} from "./tournament-operations-repository"

const tournamentOperationInclude = {
  province: true,
} satisfies Prisma.TournamentInclude

const tournamentCompetitionLifecycleInclude = {
  province: true,
  brackets: {
    where: { status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      id: true,
      status: true,
      entriesLockedAt: true,
      _count: { select: { entries: true } },
      matches: {
        select: {
          id: true,
          purpose: true,
          status: true,
          homeTeamId: true,
          awayTeamId: true,
          winnerTeamId: true,
          result: { select: { id: true } },
        },
      },
    },
  },
} satisfies Prisma.TournamentInclude

const tournamentGovernanceDependencyProjection = {
  _count: {
    select: {
      reviews: true,
      registrations: true,
      brackets: true,
      matches: true,
      mediaAssets: true,
    },
  },
  brackets: {
    where: { status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      status: true,
      entriesLockedAt: true,
      _count: { select: { matches: true } },
    },
  },
} as const

const tournamentGovernanceContextSelect = {
  id: true,
  title: true,
  organizerId: true,
  status: true,
  governanceStatus: true,
  version: true,
  startsAt: true,
  ...tournamentGovernanceDependencyProjection,
} satisfies Prisma.TournamentSelect

const tournamentGovernanceTransactionInclude = {
  province: true,
  ...tournamentGovernanceDependencyProjection,
} satisfies Prisma.TournamentInclude

type TournamentOperationRow = Prisma.TournamentGetPayload<{
  include: typeof tournamentOperationInclude
}> & { organizer?: { displayName: string } }

type TournamentCompetitionLifecycleRow = Prisma.TournamentGetPayload<{
  include: typeof tournamentCompetitionLifecycleInclude
}>

type TournamentGovernanceContextRow = Prisma.TournamentGetPayload<{
  select: typeof tournamentGovernanceContextSelect
}>

type TournamentGovernanceTransactionRow = Prisma.TournamentGetPayload<{
  include: typeof tournamentGovernanceTransactionInclude
}>

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

  async findGovernanceContext(
    id: string,
  ): Promise<TournamentGovernanceContext | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      select: tournamentGovernanceContextSelect,
    })
    return tournament ? mapGovernanceContext(tournament) : null
  }

  async findCompetitionLifecycleContext(
    id: string,
  ): Promise<TournamentCompetitionOperationContext | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: tournamentCompetitionLifecycleInclude,
    })
    return tournament ? mapCompetitionLifecycleContext(tournament) : null
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

  async transitionCompetitionWithVersion(
    input: TournamentCompetitionTransition,
  ): Promise<TournamentOperation> {
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.tournament.findUnique({
        where: { id: input.tournamentId },
        include: tournamentCompetitionLifecycleInclude,
      })
      if (!current) throw new Error("NOT_FOUND")

      const context = mapCompetitionLifecycleContext(current)
      if (input.status === "IN_PROGRESS") {
        assertTournamentCanStart(context)
      } else {
        assertTournamentCanComplete(context)
      }

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
      const before = mapTournament(current)
      const after = mapTournament(tournament)
      await appendTournamentAudit(transaction, {
        actorId: input.actorId,
        action: input.action,
        adminOverride: input.adminOverride,
        reason: input.reason,
        tournamentId: input.tournamentId,
        before,
        after,
      })
      return after
    })
  }

  async governWithVersion(
    input: TournamentGovernanceTransition,
  ): Promise<TournamentOperation> {
    return runSerializableTransaction(this.prisma, async (transaction) => {
      const current = await transaction.tournament.findUnique({
        where: { id: input.tournamentId },
        include: tournamentGovernanceTransactionInclude,
      })
      if (!current) throw new Error("NOT_FOUND")

      const reason = input.reason.trim()
      assertGovernancePolicy(
        input.action,
        mapGovernanceContext(current),
        input.at,
        reason,
      )
      const target = governanceTarget(input.action, input.sourceStatus)

      const update = await transaction.tournament.updateMany({
        where: {
          id: input.tournamentId,
          version: input.expectedVersion,
          status: input.sourceStatus,
          governanceStatus: input.sourceGovernanceStatus,
        },
        data: {
          status: target.status,
          governanceStatus: target.governanceStatus,
          ...(updatesGovernanceMetadata(input.action)
            ? {
                governanceReason: reason,
                governanceUpdatedAt: new Date(input.at),
              }
            : {}),
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
        action: governanceAuditAction(input.action),
        adminOverride: true,
        tournamentId: input.tournamentId,
        before: mapTournament(current),
        after,
        reason,
      })
      return after
    })
  }

  async permanentlyDeleteWithVersion(
    input: TournamentPermanentDelete,
  ): Promise<void> {
    await runSerializableTransaction(this.prisma, async (transaction) => {
      const current = await transaction.tournament.findUnique({
        where: { id: input.tournamentId },
        include: tournamentGovernanceTransactionInclude,
      })
      if (!current) throw new Error("NOT_FOUND")
      if (current.version !== input.expectedVersion) throw new Error("CONFLICT")

      const reason = input.reason.trim()
      assertGovernancePolicy(
        "PERMANENT_DELETE",
        mapGovernanceContext(current),
        input.at,
        reason,
        input.confirmationTitle,
      )

      const before = mapTournament(current)
      const tombstone = {
        deleted: true,
        title: current.title,
        status: current.status,
        governanceStatus: current.governanceStatus,
        version: current.version,
        deletedAt: input.at,
      }
      await appendTournamentAudit(transaction, {
        actorId: input.actorId,
        action: "tournament.deleted",
        adminOverride: true,
        tournamentId: input.tournamentId,
        before,
        after: tombstone,
        reason,
      })

      const deletion = await transaction.tournament.deleteMany({
        where: { id: input.tournamentId, version: input.expectedVersion },
      })
      if (deletion.count !== 1) throw new Error("CONFLICT")
    })
  }
}

async function runSerializableTransaction<T>(
  prisma: PrismaClient,
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(operation, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })
  } catch (error) {
    if (isPrismaSerializationConflict(error)) throw new Error("CONFLICT")
    throw error
  }
}

function assertGovernancePolicy(
  action: TournamentGovernanceTransition["action"] | "PERMANENT_DELETE",
  context: TournamentGovernanceContext,
  at: string,
  reason: string,
  confirmationTitle?: string,
) {
  const issues = [
    ...getTournamentGovernanceReasonIssues(reason),
    ...getTournamentGovernanceIssues(
      action,
      context,
      new Date(at),
      confirmationTitle,
    ),
  ]
  if (issues.length > 0) throw new TournamentGovernancePolicyError(issues)
}

function updatesGovernanceMetadata(
  action: TournamentGovernanceTransition["action"],
) {
  return action === "SUSPEND" || action === "RESUME" || action === "REMOVE"
}

function governanceTarget(
  action: TournamentGovernanceTransition["action"],
  sourceStatus: TournamentGovernanceTransition["sourceStatus"],
) {
  switch (action) {
    case "SUSPEND":
      return { status: sourceStatus, governanceStatus: "SUSPENDED" as const }
    case "RESUME":
      return { status: sourceStatus, governanceStatus: "ACTIVE" as const }
    case "REMOVE":
      return { status: sourceStatus, governanceStatus: "REMOVED" as const }
    case "ARCHIVE":
      return { status: "ARCHIVED" as const, governanceStatus: "ACTIVE" as const }
    case "REOPEN_REGISTRATION":
      return { status: "PUBLISHED" as const, governanceStatus: "ACTIVE" as const }
  }
}

function governanceAuditAction(
  action: TournamentGovernanceTransition["action"],
): TournamentMutationAudit["action"] {
  const auditActionByGovernanceAction = {
    SUSPEND: "tournament.suspended",
    RESUME: "tournament.resumed",
    REMOVE: "tournament.removed",
    ARCHIVE: "tournament.archived",
    REOPEN_REGISTRATION: "tournament.registration_reopened",
  } as const
  return auditActionByGovernanceAction[action]
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
    before: object | null
    after: object
    reason?: string | null
  },
) {
  const afterJson = input.reason
    ? { ...input.after, transitionReason: input.reason }
    : input.after
  const auditData = {
    actorId: input.actorId,
    tournamentId: input.tournamentId,
    entityType: "Tournament",
    entityId: input.tournamentId,
    beforeJson: input.before ? toJsonValue(input.before) : undefined,
    afterJson: toJsonValue(afterJson),
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

function mapCompetitionLifecycleContext(
  tournament: TournamentCompetitionLifecycleRow,
): TournamentCompetitionOperationContext {
  const bracket = tournament.brackets[0]
  return {
    tournamentId: tournament.id,
    organizerId: tournament.organizerId,
    status: tournament.status,
    governanceStatus: tournament.governanceStatus,
    version: tournament.version,
    activeBracket: bracket
      ? {
          id: bracket.id,
          status: bracket.status,
          entriesLockedAt: bracket.entriesLockedAt?.toISOString() ?? null,
          entryCount: bracket._count.entries,
          matches: bracket.matches.map((match) => ({
            id: match.id,
            purpose: match.purpose,
            status: match.status,
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            winnerTeamId: match.winnerTeamId,
            resultConfirmed: Boolean(match.result),
          })),
        }
      : null,
  }
}

function mapGovernanceContext(
  tournament: TournamentGovernanceContextRow | TournamentGovernanceTransactionRow,
): TournamentGovernanceContext {
  const bracket = tournament.brackets[0]
  return {
    tournamentId: tournament.id,
    title: tournament.title,
    organizerId: tournament.organizerId,
    status: tournament.status,
    governanceStatus: tournament.governanceStatus,
    version: tournament.version,
    startsAt: tournament.startsAt.toISOString(),
    reviewCount: tournament._count.reviews,
    registrationCount: tournament._count.registrations,
    bracketCount: tournament._count.brackets,
    matchCount: tournament._count.matches,
    mediaAssetCount: tournament._count.mediaAssets,
    activeBracket: bracket
      ? {
          status: bracket.status,
          entriesLockedAt: bracket.entriesLockedAt?.toISOString() ?? null,
          matchCount: bracket._count.matches,
        }
      : null,
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
    governanceStatus: tournament.governanceStatus,
    governanceReason: tournament.governanceReason,
    governanceUpdatedAt: tournament.governanceUpdatedAt?.toISOString() ?? null,
    version: tournament.version,
    createdAt: tournament.createdAt.toISOString(),
    updatedAt: tournament.updatedAt.toISOString(),
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function isPrismaSerializationConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  )
}
