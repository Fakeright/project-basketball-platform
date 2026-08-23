import { randomUUID } from "node:crypto"

import { Prisma } from "@/lib/generated/prisma/client"
import type {
  ExternalBracketRevision as PrismaExternalBracketRevision,
  MediaAsset,
  PrismaClient,
} from "@/lib/generated/prisma/client"
import type {
  CommitExternalRevisionInput,
  ExternalBracketRepository,
  ExternalBracketRevision,
  ExternalBracketWorkspace,
  PublishExternalRevisionInput,
  RetireExternalRevisionInput,
  SelectBracketModeInput,
} from "@/features/competition/application/ports/external-bracket-repository"

const revisionInclude = {
  mediaAsset: true,
  createdBy: { select: { displayName: true } },
} satisfies Prisma.ExternalBracketRevisionInclude

type ExternalRevisionRow = PrismaExternalBracketRevision & {
  mediaAsset: MediaAsset
  createdBy: { displayName: string }
}

export class PrismaExternalBracketRepository
  implements ExternalBracketRepository
{
  constructor(
    private readonly prisma: PrismaClient,
    private readonly createId: () => string = randomUUID,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async findModeSelectionContext(tournamentId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        organizerId: true,
        governanceStatus: true,
        brackets: {
          where: { status: { not: "ARCHIVED" } },
          take: 1,
          select: {
            id: true,
            version: true,
            status: true,
            mode: true,
            matches: {
              where: {
                OR: [
                  { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
                  { result: { isNot: null } },
                ],
              },
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
      tournamentGovernanceStatus: tournament.governanceStatus,
      bracketId: bracket.id,
      bracketVersion: bracket.version,
      bracketStatus: bracket.status,
      bracketMode: bracket.mode,
      hasStartedMatch: bracket.matches.length > 0,
    }
  }

  selectMode(input: SelectBracketModeInput) {
    return this.prisma.$transaction(async (transaction) => {
      await lockBracket(transaction, input.bracketId, input.tournamentId)
      const bracket = await transaction.bracket.findFirst({
        where: { id: input.bracketId, tournamentId: input.tournamentId },
        select: {
          mode: true,
          status: true,
          matches: {
            where: {
              OR: [
                { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
                { result: { isNot: null } },
              ],
            },
            select: { id: true },
          },
        },
      })
      if (!bracket) throw new Error("NOT_FOUND")
      if (bracket.status !== "DRAFT" || bracket.matches.length > 0) {
        throw new Error("BRACKET_MODE_LOCKED")
      }

      await transaction.match.deleteMany({ where: { bracketId: input.bracketId } })
      await transaction.bracketRound.deleteMany({ where: { bracketId: input.bracketId } })
      const updated = await transaction.bracket.updateMany({
        where: {
          id: input.bracketId,
          tournamentId: input.tournamentId,
          status: "DRAFT",
          version: input.expectedVersion,
        },
        data: {
          mode: input.targetMode,
          generationMethod: null,
          drawToken: null,
          version: { increment: 1 },
        },
      })
      if (updated.count !== 1) throw new Error("CONFLICT")

      await transaction.auditLog.create({
        data: {
          actorId: input.actorId,
          tournamentId: input.tournamentId,
          action: "BRACKET_MODE_CHANGED",
          entityType: "Bracket",
          entityId: input.bracketId,
          beforeJson: toJsonValue({ mode: bracket.mode, version: input.expectedVersion }),
          afterJson: toJsonValue({
            mode: input.targetMode,
            version: input.expectedVersion + 1,
            reason: input.reason,
            adminOverride: input.adminOverride,
          }),
          createdAt: new Date(input.at),
        },
      })
      return {
        bracketId: input.bracketId,
        bracketVersion: input.expectedVersion + 1,
        bracketMode: input.targetMode,
      }
    })
  }

  async commitUploadedRevision(input: CommitExternalRevisionInput) {
    if (
      input.asset.tournamentId !== input.tournamentId ||
      input.asset.kind !== "BRACKET_DOCUMENT"
    ) {
      throw new Error("INVALID_EXTERNAL_BRACKET_ASSET")
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.prisma.$transaction(async (transaction) => {
          await lockBracket(transaction, input.bracketId, input.tournamentId)
          await assertExternalBracket(transaction, input)

          const updated = await transaction.bracket.updateMany({
            where: bracketVersionWhere(input),
            data: { version: { increment: 1 } },
          })
          if (updated.count !== 1) throw new Error("CONFLICT")

          const aggregate = await transaction.externalBracketRevision.aggregate({
            where: { bracketId: input.bracketId },
            _max: { revision: true },
          })
          const revision = (aggregate._max.revision ?? 0) + 1
          const createdAt = this.now()

          const asset = await transaction.mediaAsset.create({ data: input.asset })
          const created = await transaction.externalBracketRevision.create({
            data: {
              id: this.createId(),
              bracketId: input.bracketId,
              mediaAssetId: asset.id,
              revision,
              createdById: input.actorId,
              createdAt,
            },
            include: revisionInclude,
          })
          await transaction.auditLog.create({
            data: {
              actorId: input.actorId,
              tournamentId: input.tournamentId,
              action: "EXTERNAL_BRACKET_REVISION_UPLOADED",
              entityType: "ExternalBracketRevision",
              entityId: created.id,
              afterJson: toJsonValue({
                bracketId: input.bracketId,
                revision,
                mediaAssetId: asset.id,
                adminOverride: input.adminOverride,
                reason: input.reason,
              }),
            },
          })
          return mapRevision(created)
        })
      } catch (error) {
        if (isPrismaUniqueError(error) && attempt === 0) continue
        if (isPrismaUniqueError(error)) throw new Error("CONFLICT")
        throw error
      }
    }
    throw new Error("CONFLICT")
  }

  publishRevision(input: PublishExternalRevisionInput) {
    return this.prisma.$transaction(async (transaction) => {
      await lockBracket(transaction, input.bracketId, input.tournamentId)
      const selected = await transaction.externalBracketRevision.findFirst({
        where: {
          id: input.revisionId,
          bracketId: input.bracketId,
          status: "DRAFT",
          mediaAsset: { deletedAt: null },
        },
        include: revisionInclude,
      })
      if (!selected) throw new Error("EXTERNAL_BRACKET_REVISION_NOT_PUBLISHABLE")

      const current = await transaction.externalBracketRevision.findFirst({
        where: { bracketId: input.bracketId, status: "PUBLISHED" },
        include: revisionInclude,
      })
      const publishedAt = this.now()
      const updated = await transaction.bracket.updateMany({
        where: bracketVersionWhere(input),
        data: {
          status: "PUBLISHED",
          publishedAt,
          version: { increment: 1 },
        },
      })
      if (updated.count !== 1) throw new Error("CONFLICT")

      if (current) {
        const retired = await transaction.externalBracketRevision.updateMany({
          where: {
            id: current.id,
            bracketId: input.bracketId,
            status: "PUBLISHED",
          },
          data: { status: "RETIRED", retiredAt: publishedAt },
        })
        if (retired.count !== 1) throw new Error("CONFLICT")
      }
      const published = await transaction.externalBracketRevision.updateMany({
        where: {
          id: selected.id,
          bracketId: input.bracketId,
          status: "DRAFT",
        },
        data: { status: "PUBLISHED", publishedAt },
      })
      if (published.count !== 1) throw new Error("CONFLICT")

      await transaction.auditLog.create({
        data: {
          actorId: input.actorId,
          tournamentId: input.tournamentId,
          action: "EXTERNAL_BRACKET_REVISION_PUBLISHED",
          entityType: "ExternalBracketRevision",
          entityId: selected.id,
          beforeJson: toJsonValue({
            publishedRevisionId: current?.id ?? null,
          }),
          afterJson: toJsonValue({
            publishedRevisionId: selected.id,
            reason: input.reason,
            adminOverride: input.adminOverride,
          }),
        },
      })
      return loadWorkspace(transaction, input.bracketId, input.expectedVersion + 1)
    })
  }

  retireRevision(input: RetireExternalRevisionInput) {
    return this.prisma.$transaction(async (transaction) => {
      await lockBracket(transaction, input.bracketId, input.tournamentId)
      const selected = await transaction.externalBracketRevision.findFirst({
        where: {
          id: input.revisionId,
          bracketId: input.bracketId,
          status: "DRAFT",
        },
        include: revisionInclude,
      })
      if (!selected) throw new Error("EXTERNAL_BRACKET_REVISION_NOT_RETIRABLE")

      const updated = await transaction.bracket.updateMany({
        where: bracketVersionWhere(input),
        data: { version: { increment: 1 } },
      })
      if (updated.count !== 1) throw new Error("CONFLICT")

      const retiredAt = this.now()
      const retired = await transaction.externalBracketRevision.updateMany({
        where: {
          id: selected.id,
          bracketId: input.bracketId,
          status: "DRAFT",
        },
        data: { status: "RETIRED", retiredAt },
      })
      if (retired.count !== 1) throw new Error("CONFLICT")

      const result = mapRevision({
        ...selected,
        status: "RETIRED",
        retiredAt,
      })
      await transaction.auditLog.create({
        data: {
          actorId: input.actorId,
          tournamentId: input.tournamentId,
          action: "EXTERNAL_BRACKET_REVISION_RETIRED",
          entityType: "ExternalBracketRevision",
          entityId: selected.id,
          beforeJson: toJsonValue(mapRevision(selected)),
          afterJson: toJsonValue({
            ...result,
            reason: input.reason,
            adminOverride: input.adminOverride,
          }),
        },
      })
      return result
    })
  }

  async findWorkspace(tournamentId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        title: true,
        organizerId: true,
        governanceStatus: true,
        brackets: {
          where: { mode: "EXTERNAL_DOCUMENT", status: { not: "ARCHIVED" } },
          take: 1,
          select: {
            id: true,
            version: true,
            mode: true,
            status: true,
            matches: {
              where: { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
              select: {
                id: true,
                result: { select: { confirmedAt: true } },
              },
            },
            externalRevisions: {
              orderBy: { revision: "desc" },
              include: revisionInclude,
            },
          },
        },
      },
    })
    const bracket = tournament?.brackets[0]
    if (!tournament || !bracket || bracket.mode !== "EXTERNAL_DOCUMENT") return null
    const revisions = bracket.externalRevisions.map(mapRevision)
    return {
      tournamentId: tournament.id,
      tournamentTitle: tournament.title,
      organizerId: tournament.organizerId,
      tournamentGovernanceStatus: tournament.governanceStatus,
      bracketId: bracket.id,
      bracketVersion: bracket.version,
      bracketStatus: bracket.status,
      bracketMode: bracket.mode,
      hasStartedMatch: bracket.matches.length > 0,
      latestConfirmedResultAt: latestConfirmedResultAt(bracket.matches),
      revisions,
      publishedRevision:
        revisions.find((revision) => revision.status === "PUBLISHED") ?? null,
    }
  }

  async findPublicByTournamentSlug(slug: string) {
    const tournament = await this.prisma.tournament.findFirst({
      where: {
        slug,
        governanceStatus: "ACTIVE",
        status: {
          in: ["PUBLISHED", "REGISTRATION_CLOSED", "IN_PROGRESS", "COMPLETED"],
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        brackets: {
          where: { mode: "EXTERNAL_DOCUMENT", status: "PUBLISHED" },
          take: 1,
          select: {
            id: true,
            externalRevisions: {
              where: {
                status: "PUBLISHED",
                mediaAsset: { deletedAt: null },
              },
              take: 1,
              include: revisionInclude,
            },
          },
        },
      },
    })
    const bracket = tournament?.brackets[0]
    const revision = bracket?.externalRevisions[0]
    if (!tournament || !bracket || !revision) return null
    return {
      tournamentId: tournament.id,
      tournamentTitle: tournament.title,
      tournamentSlug: tournament.slug,
      bracketId: bracket.id,
      revision: mapRevision(revision),
    }
  }
}

async function lockBracket(
  transaction: Prisma.TransactionClient,
  bracketId: string,
  tournamentId: string,
) {
  const rows = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id"
    FROM "Bracket"
    WHERE "id" = ${bracketId} AND "tournamentId" = ${tournamentId}
    FOR UPDATE
  `)
  if (rows.length !== 1) throw new Error("NOT_FOUND")
}

async function assertExternalBracket(
  transaction: Prisma.TransactionClient,
  input: { bracketId: string; tournamentId: string },
) {
  const bracket = await transaction.bracket.findFirst({
    where: { id: input.bracketId, tournamentId: input.tournamentId },
    select: { mode: true, status: true },
  })
  if (!bracket || bracket.status === "ARCHIVED") throw new Error("NOT_FOUND")
  if (bracket.mode !== "EXTERNAL_DOCUMENT") {
    throw new Error("BRACKET_MODE_NOT_EXTERNAL")
  }
}

function bracketVersionWhere(input: {
  bracketId: string
  tournamentId: string
  expectedVersion: number
}) {
  return {
    id: input.bracketId,
    tournamentId: input.tournamentId,
    mode: "EXTERNAL_DOCUMENT" as const,
    status: { not: "ARCHIVED" as const },
    version: input.expectedVersion,
  }
}

async function loadWorkspace(
  transaction: Prisma.TransactionClient,
  bracketId: string,
  bracketVersion: number,
): Promise<ExternalBracketWorkspace> {
  const rows = await transaction.externalBracketRevision.findMany({
    where: { bracketId },
    orderBy: { revision: "desc" },
    include: revisionInclude,
  })
  const revisions = rows.map(mapRevision)
  return {
    bracketId,
    bracketVersion,
    revisions,
    publishedRevision:
      revisions.find((revision) => revision.status === "PUBLISHED") ?? null,
  }
}

function mapRevision(row: ExternalRevisionRow): ExternalBracketRevision {
  return {
    id: row.id,
    bracketId: row.bracketId,
    revision: row.revision,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    retiredAt: row.retiredAt?.toISOString() ?? null,
    createdById: row.createdById,
    createdByName: row.createdBy.displayName,
    createdAt: row.createdAt.toISOString(),
    mediaAsset: {
      id: row.mediaAsset.id,
      tournamentId: row.mediaAsset.tournamentId,
      kind: row.mediaAsset.kind,
      bucket: row.mediaAsset.bucket,
      objectPath: row.mediaAsset.objectPath,
      fileName: row.mediaAsset.fileName,
      contentType: row.mediaAsset.contentType,
      byteSize: row.mediaAsset.byteSize,
      createdById: row.mediaAsset.createdById,
      createdAt: row.mediaAsset.createdAt.toISOString(),
      deletedAt: row.mediaAsset.deletedAt?.toISOString() ?? null,
    },
  }
}

function latestConfirmedResultAt(
  matches: Array<{ result?: { confirmedAt: Date } | null }>,
) {
  const timestamps = matches.flatMap((match) =>
    match.result ? [match.result.confirmedAt.getTime()] : [],
  )
  return timestamps.length
    ? new Date(Math.max(...timestamps)).toISOString()
    : null
}

function isPrismaUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}
