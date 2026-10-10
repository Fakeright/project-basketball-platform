import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaExternalBracketRepository } from "@/features/competition/infrastructure/prisma-external-bracket-repository"

const now = new Date("2026-08-19T13:00:00.000Z")

const mediaRow = {
  id: "asset-2",
  tournamentId: "tournament-1",
  kind: "BRACKET_DOCUMENT" as const,
  bucket: "tournament-brackets",
  objectPath: "tournaments/tournament-1/bracket/revisions/asset-2.pdf",
  fileName: "bracket-v2.pdf",
  contentType: "application/pdf",
  byteSize: 2_048,
  createdById: "organizer-1",
  createdAt: now,
  deletedAt: null,
}

const revisionRow = {
  id: "revision-2",
  bracketId: "bracket-1",
  mediaAssetId: mediaRow.id,
  revision: 2,
  status: "DRAFT" as const,
  publishedAt: null,
  retiredAt: null,
  createdById: "organizer-1",
  createdAt: now,
  mediaAsset: mediaRow,
  createdBy: { displayName: "Organizer One" },
}

function createPrismaMock() {
  let bracketVersion = 3
  const transaction = {
    $queryRaw: vi.fn().mockResolvedValue([
      {
        id: "tournament-1",
        governanceStatus: "ACTIVE",
      },
    ]),
    bracket: {
      findFirst: vi.fn().mockImplementation(async () => ({
        id: "bracket-1",
        tournamentId: "tournament-1",
        version: bracketVersion,
        mode: "EXTERNAL_DOCUMENT",
        status: "DRAFT",
      })),
      updateMany: vi.fn().mockImplementation(async ({ where }: { where: { version: number } }) => {
        if (where.version !== bracketVersion) return { count: 0 }
        bracketVersion += 1
        return { count: 1 }
      }),
    },
    match: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
    bracketRound: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    mediaAsset: { create: vi.fn().mockResolvedValue(mediaRow) },
    externalBracketRevision: {
      aggregate: vi.fn().mockResolvedValue({ _max: { revision: 1 } }),
      create: vi.fn().mockResolvedValue(revisionRow),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([revisionRow]),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    tournament: { findFirst: vi.fn(), findUnique: vi.fn() },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  }
  const prisma = {
    ...transaction,
    $transaction: vi.fn(
      async (operation: (client: typeof transaction) => Promise<unknown>) =>
        operation(transaction),
    ),
  }
  return { prisma, transaction }
}

function repository(prisma: ReturnType<typeof createPrismaMock>["prisma"]) {
  return new PrismaExternalBracketRepository(
    prisma as unknown as PrismaClient,
    () => "revision-2",
    () => now,
  )
}

const uploadInput = {
  tournamentId: "tournament-1",
  bracketId: "bracket-1",
  expectedVersion: 3,
  asset: {
    id: mediaRow.id,
    tournamentId: mediaRow.tournamentId,
    kind: mediaRow.kind,
    bucket: mediaRow.bucket,
    objectPath: mediaRow.objectPath,
    fileName: mediaRow.fileName,
    contentType: mediaRow.contentType,
    byteSize: mediaRow.byteSize,
    createdById: mediaRow.createdById,
  },
  actorId: "organizer-1",
  adminOverride: false,
  reason: null,
}

describe("PrismaExternalBracketRepository", () => {
  it.each([
    {
      operation: "select bracket mode",
      run: (adapter: PrismaExternalBracketRepository) =>
        adapter.selectMode({
          tournamentId: "tournament-1",
          bracketId: "bracket-1",
          targetMode: "EXTERNAL_DOCUMENT",
          expectedVersion: 3,
          actorId: "organizer-1",
          adminOverride: false,
          reason: null,
          at: now.toISOString(),
        }),
    },
    {
      operation: "commit an uploaded revision",
      run: (adapter: PrismaExternalBracketRepository) =>
        adapter.commitUploadedRevision(uploadInput),
    },
    {
      operation: "publish a revision",
      run: (adapter: PrismaExternalBracketRepository) =>
        adapter.publishRevision({
          tournamentId: "tournament-1",
          bracketId: "bracket-1",
          revisionId: "revision-2",
          expectedVersion: 3,
          actorId: "organizer-1",
          adminOverride: false,
          reason: null,
        }),
    },
    {
      operation: "retire a revision",
      run: (adapter: PrismaExternalBracketRepository) =>
        adapter.retireRevision({
          tournamentId: "tournament-1",
          bracketId: "bracket-1",
          revisionId: "revision-2",
          expectedVersion: 3,
          actorId: "organizer-1",
          adminOverride: false,
          reason: null,
        }),
    },
  ])(
    "locks and rechecks tournament governance before attempting to $operation",
    async ({ run }) => {
      const { prisma, transaction } = createPrismaMock()
      transaction.$queryRaw.mockResolvedValueOnce([
        { id: "tournament-1", governanceStatus: "SUSPENDED" },
      ])

      await expect(run(repository(prisma))).rejects.toMatchObject({
        issues: ["TOURNAMENT_SUSPENDED"],
      })

      expect(transaction.$queryRaw).toHaveBeenCalledOnce()
      const [lockQuery] = transaction.$queryRaw.mock.calls[0]
      expect(lockQuery.text).toContain('FROM "Tournament"')
      expect(lockQuery.text).toMatch(/\bFOR\s+UPDATE\b/i)
      expect(transaction.bracket.updateMany).not.toHaveBeenCalled()
      expect(transaction.match.deleteMany).not.toHaveBeenCalled()
      expect(transaction.bracketRound.deleteMany).not.toHaveBeenCalled()
      expect(transaction.mediaAsset.create).not.toHaveBeenCalled()
      expect(transaction.externalBracketRevision.create).not.toHaveBeenCalled()
      expect(
        transaction.externalBracketRevision.updateMany,
      ).not.toHaveBeenCalled()
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    },
  )

  it("changes mode with a version guard and clears generated draft structure atomically", async () => {
    const { prisma, transaction } = createPrismaMock()
    transaction.bracket.findFirst.mockResolvedValueOnce({
      id: "bracket-1",
      tournamentId: "tournament-1",
      version: 3,
      mode: "SYSTEM_GENERATED",
      status: "DRAFT",
      matches: [],
    })

    const result = await repository(prisma).selectMode({
      tournamentId: "tournament-1",
      bracketId: "bracket-1",
      targetMode: "EXTERNAL_DOCUMENT",
      expectedVersion: 3,
      actorId: "organizer-1",
      adminOverride: false,
      reason: null,
      at: now.toISOString(),
    })

    expect(transaction.match.deleteMany).toHaveBeenCalledWith({
      where: { bracketId: "bracket-1" },
    })
    expect(transaction.bracketRound.deleteMany).toHaveBeenCalledWith({
      where: { bracketId: "bracket-1" },
    })
    expect(transaction.bracket.updateMany).toHaveBeenCalledWith({
      where: {
        id: "bracket-1",
        tournamentId: "tournament-1",
        status: "DRAFT",
        version: 3,
      },
      data: {
        mode: "EXTERNAL_DOCUMENT",
        generationMethod: null,
        drawToken: null,
        version: { increment: 1 },
      },
    })
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "BRACKET_MODE_CHANGED",
        beforeJson: expect.objectContaining({ mode: "SYSTEM_GENERATED" }),
        afterJson: expect.objectContaining({ mode: "EXTERNAL_DOCUMENT" }),
      }),
    })
    expect(result).toEqual({
      bracketId: "bracket-1",
      bracketVersion: 4,
      bracketMode: "EXTERNAL_DOCUMENT",
    })
  })

  it("locks the bracket and commits the next revision, media metadata, and audit atomically", async () => {
    const { prisma, transaction } = createPrismaMock()

    const created = await repository(prisma).commitUploadedRevision(uploadInput)

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(transaction.$queryRaw).toHaveBeenCalledTimes(2)
    expect(transaction.$queryRaw.mock.calls[0][0].text).toContain(
      'FROM "Tournament"',
    )
    expect(transaction.$queryRaw.mock.calls[1][0].text).toContain(
      'FROM "Bracket"',
    )
    expect(transaction.bracket.updateMany).toHaveBeenCalledWith({
      where: {
        id: "bracket-1",
        tournamentId: "tournament-1",
        mode: "EXTERNAL_DOCUMENT",
        status: { not: "ARCHIVED" },
        version: 3,
      },
      data: { version: { increment: 1 } },
    })
    expect(transaction.externalBracketRevision.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: "revision-2",
        revision: 2,
        mediaAssetId: "asset-2",
      }),
      include: expect.anything(),
    })
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "EXTERNAL_BRACKET_REVISION_UPLOADED",
        entityType: "ExternalBracketRevision",
        afterJson: expect.objectContaining({
          revision: 2,
          mediaAssetId: "asset-2",
          adminOverride: false,
        }),
      }),
    })
    expect(created).toMatchObject({ id: "revision-2", revision: 2 })
  })

  it("allows only one concurrent upload using the same expected version", async () => {
    const { prisma } = createPrismaMock()
    const adapter = repository(prisma)

    const results = await Promise.allSettled([
      adapter.commitUploadedRevision(uploadInput),
      adapter.commitUploadedRevision(uploadInput),
    ])

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1)
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1)
    await expect(
      Promise.reject(
        results.find((result) => result.status === "rejected")?.reason,
      ),
    ).rejects.toThrow("CONFLICT")
  })

  it("retires the current publication and publishes one selected draft", async () => {
    const { prisma, transaction } = createPrismaMock()
    const published = {
      ...revisionRow,
      id: "revision-1",
      revision: 1,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-08-18T13:00:00.000Z"),
    }
    transaction.externalBracketRevision.findFirst
      .mockResolvedValueOnce(revisionRow)
      .mockResolvedValueOnce(published)
    transaction.externalBracketRevision.findMany.mockResolvedValue([
      { ...published, status: "RETIRED", retiredAt: now },
      { ...revisionRow, status: "PUBLISHED", publishedAt: now },
    ])

    const workspace = await repository(prisma).publishRevision({
      tournamentId: "tournament-1",
      bracketId: "bracket-1",
      revisionId: "revision-2",
      expectedVersion: 3,
      actorId: "organizer-1",
      adminOverride: false,
      reason: null,
    })

    expect(transaction.externalBracketRevision.updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: "revision-1", bracketId: "bracket-1", status: "PUBLISHED" },
      data: { status: "RETIRED", retiredAt: now },
    })
    expect(transaction.externalBracketRevision.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: "revision-2", bracketId: "bracket-1", status: "DRAFT" },
      data: { status: "PUBLISHED", publishedAt: now },
    })
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "EXTERNAL_BRACKET_REVISION_PUBLISHED",
        beforeJson: expect.objectContaining({ publishedRevisionId: "revision-1" }),
        afterJson: expect.objectContaining({ publishedRevisionId: "revision-2" }),
      }),
    })
    expect(workspace.publishedRevision?.id).toBe("revision-2")
    expect(workspace.bracketVersion).toBe(4)
  })

  it("rejects a stale publication before changing revision statuses", async () => {
    const { prisma, transaction } = createPrismaMock()
    transaction.externalBracketRevision.findFirst
      .mockResolvedValueOnce(revisionRow)
      .mockResolvedValueOnce(null)
    transaction.bracket.updateMany.mockResolvedValue({ count: 0 })

    await expect(
      repository(prisma).publishRevision({
        tournamentId: "tournament-1",
        bracketId: "bracket-1",
        revisionId: "revision-2",
        expectedVersion: 9,
        actorId: "organizer-1",
        adminOverride: false,
        reason: null,
      }),
    ).rejects.toThrow("CONFLICT")
    expect(transaction.externalBracketRevision.updateMany).not.toHaveBeenCalled()
    expect(transaction.auditLog.create).not.toHaveBeenCalled()
  })

  it("refuses to retire a published revision", async () => {
    const { prisma, transaction } = createPrismaMock()
    transaction.externalBracketRevision.findFirst.mockResolvedValue(null)

    await expect(
      repository(prisma).retireRevision({
        tournamentId: "tournament-1",
        bracketId: "bracket-1",
        revisionId: "revision-1",
        expectedVersion: 3,
        actorId: "organizer-1",
        adminOverride: false,
        reason: null,
      }),
    ).rejects.toThrow("EXTERNAL_BRACKET_REVISION_NOT_RETIRABLE")
    expect(transaction.bracket.updateMany).not.toHaveBeenCalled()
  })

  it("maps organizer and public revision views with ISO timestamps", async () => {
    const { prisma, transaction } = createPrismaMock()
    transaction.tournament.findUnique.mockResolvedValue({
      id: "tournament-1",
      title: "External Cup",
      organizerId: "organizer-1",
      governanceStatus: "SUSPENDED",
      brackets: [{
        id: "bracket-1",
        version: 4,
        mode: "EXTERNAL_DOCUMENT",
        status: "PUBLISHED",
        matches: [{ id: "match-1" }],
        externalRevisions: [
          { ...revisionRow, status: "PUBLISHED", publishedAt: now },
        ],
      }],
    })
    transaction.tournament.findFirst.mockResolvedValue({
      id: "tournament-1",
      title: "External Cup",
      slug: "external-cup",
      brackets: [{
        id: "bracket-1",
        externalRevisions: [
          { ...revisionRow, status: "PUBLISHED", publishedAt: now },
        ],
      }],
    })
    const adapter = repository(prisma)

    const workspace = await adapter.findWorkspace("tournament-1")
    const publicRevision = await adapter.findPublicByTournamentSlug("external-cup")

    expect(workspace).toMatchObject({
      organizerId: "organizer-1",
      tournamentGovernanceStatus: "SUSPENDED",
      bracketVersion: 4,
      hasStartedMatch: true,
    })
    expect(workspace?.revisions[0].createdAt).toBe(now.toISOString())
    expect(publicRevision).toMatchObject({
      tournamentSlug: "external-cup",
      revision: { id: "revision-2", publishedAt: now.toISOString() },
    })
    expect(transaction.tournament.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ governanceStatus: "ACTIVE" }),
      }),
    )
  })

  it.each([
    ["ACTIVE", true],
    ["SUSPENDED", false],
    ["REMOVED", false],
  ] as const)(
    "keeps an archived published bracket public when governance is %s",
    async (governanceStatus, expectedVisible) => {
      const { prisma, transaction } = createPrismaMock()
      const archivedTournament = {
        id: "tournament-1",
        title: "Archived Cup",
        slug: "archived-cup",
        status: "ARCHIVED",
        governanceStatus,
        brackets: [
          {
            id: "bracket-1",
            externalRevisions: [
              { ...revisionRow, status: "PUBLISHED", publishedAt: now },
            ],
          },
        ],
      }
      transaction.tournament.findFirst.mockImplementation(
        async ({ where }: {
          where: {
            governanceStatus: string
            status: { in: string[] }
          }
        }) =>
          where.governanceStatus === archivedTournament.governanceStatus &&
          where.status.in.includes(archivedTournament.status)
            ? archivedTournament
            : null,
      )

      const result = await repository(prisma).findPublicByTournamentSlug(
        "archived-cup",
      )

      expect(result !== null).toBe(expectedVisible)
      expect(transaction.tournament.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            governanceStatus: "ACTIVE",
            status: {
              in: [
                "PUBLISHED",
                "REGISTRATION_CLOSED",
                "IN_PROGRESS",
                "COMPLETED",
                "ARCHIVED",
              ],
            },
          }),
        }),
      )
    },
  )
})
