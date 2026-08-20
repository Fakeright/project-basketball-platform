import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/prisma-tournament-operations-repository"

const tournamentRow = {
  id: "tournament-1",
  slug: "review-cup",
  title: "Review Cup",
  description: "Tournament description",
  rules: "Tournament rules",
  provinceCode: "10",
  province: { nameTh: "กรุงเทพมหานคร" },
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  startsAt: new Date("2026-11-15T02:00:00.000Z"),
  endsAt: new Date("2026-11-16T11:00:00.000Z"),
  registrationDeadline: new Date("2026-11-01T16:59:00.000Z"),
  capacity: 16,
  status: "SUBMITTED" as const,
  version: 2,
  organizerId: "organizer-1",
  createdAt: new Date("2026-07-26T01:00:00.000Z"),
  updatedAt: new Date("2026-07-26T02:00:00.000Z"),
}

function createPrismaMock() {
  const prisma = {
    tournament: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    tournamentReview: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (operation: (client: unknown) => unknown) =>
      operation(prisma),
    ),
  }

  return prisma
}

describe("PrismaTournamentOperationsRepository", () => {
  it("rechecks competition readiness before transitioning in the transaction", async () => {
    const prisma = createPrismaMock()
    prisma.tournament.findUnique.mockResolvedValue({
      ...tournamentRow,
      status: "IN_PROGRESS",
      version: 5,
      brackets: [
        {
          id: "bracket-1",
          status: "PUBLISHED",
          entriesLockedAt: new Date("2026-08-20T09:00:00.000Z"),
          _count: { entries: 4 },
          matches: [
            {
              id: "final",
              purpose: "CHAMPIONSHIP",
              status: "IN_PROGRESS",
              homeTeamId: "team-1",
              awayTeamId: "team-2",
              winnerTeamId: null,
              result: null,
            },
          ],
        },
      ],
    })
    const repository = new PrismaTournamentOperationsRepository(
      prisma as unknown as PrismaClient,
    )

    await expect(
      repository.transitionCompetitionWithVersion({
        tournamentId: "tournament-1",
        version: 5,
        sourceStatus: "IN_PROGRESS",
        status: "COMPLETED",
        actorId: "organizer-1",
        action: "tournament.completed",
        adminOverride: false,
        reason: null,
        at: "2026-08-20T10:00:00.000Z",
      }),
    ).rejects.toMatchObject({
      issues: expect.arrayContaining(["MATCH_RESULT_PENDING"]),
    })
    expect(prisma.tournament.updateMany).not.toHaveBeenCalled()
    expect(prisma.auditLog.create).not.toHaveBeenCalled()
  })

  it("completes a ready competition and audits the override reason atomically", async () => {
    const prisma = createPrismaMock()
    prisma.tournament.findUnique
      .mockResolvedValueOnce({
        ...tournamentRow,
        status: "IN_PROGRESS",
        version: 5,
        brackets: [
          {
            id: "bracket-1",
            status: "PUBLISHED",
            entriesLockedAt: new Date("2026-08-20T09:00:00.000Z"),
            _count: { entries: 4 },
            matches: [
              {
                id: "final",
                purpose: "CHAMPIONSHIP",
                status: "COMPLETED",
                homeTeamId: "team-1",
                awayTeamId: "team-2",
                winnerTeamId: "team-1",
                result: { id: "result-1" },
              },
            ],
          },
        ],
      })
      .mockResolvedValueOnce({
        ...tournamentRow,
        status: "COMPLETED",
        version: 6,
      })
    prisma.tournament.updateMany.mockResolvedValue({ count: 1 })
    const repository = new PrismaTournamentOperationsRepository(
      prisma as unknown as PrismaClient,
    )

    const completed = await repository.transitionCompetitionWithVersion({
      tournamentId: "tournament-1",
      version: 5,
      sourceStatus: "IN_PROGRESS",
      status: "COMPLETED",
      actorId: "admin-1",
      action: "tournament.completed",
      adminOverride: true,
      reason: "ยืนยันผลจากเอกสารการแข่งขัน",
      at: "2026-08-20T10:00:00.000Z",
    })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.tournament.updateMany).toHaveBeenCalledWith({
      where: {
        id: "tournament-1",
        version: 5,
        status: "IN_PROGRESS",
      },
      data: { status: "COMPLETED", version: { increment: 1 } },
    })
    expect(prisma.auditLog.create).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({
        action: "tournament.completed",
        afterJson: expect.objectContaining({
          transitionReason: "ยืนยันผลจากเอกสารการแข่งขัน",
        }),
      }),
    })
    expect(prisma.auditLog.create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({ action: "tournament.admin_override" }),
    })
    expect(completed).toMatchObject({ status: "COMPLETED", version: 6 })
  })

  it("searches all tournaments for platform administration", async () => {
    const prisma = createPrismaMock()
    prisma.tournament.findMany.mockResolvedValue([
      { ...tournamentRow, organizer: { displayName: "Organizer One" } },
    ])
    const repository = new PrismaTournamentOperationsRepository(
      prisma as unknown as PrismaClient,
    )

    const tournaments = await repository.listForAdmin({
      query: "court",
      status: "SUBMITTED",
    })

    expect(prisma.tournament.findMany).toHaveBeenCalledWith({
      where: {
        status: "SUBMITTED",
        OR: [
          { title: { contains: "court", mode: "insensitive" } },
          { organizer: { displayName: { contains: "court", mode: "insensitive" } } },
          { province: { nameTh: { contains: "court", mode: "insensitive" } } },
          { province: { nameEn: { contains: "court", mode: "insensitive" } } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        organizer: { select: { displayName: true } },
        province: true,
      },
    })
    expect(tournaments[0]?.organizerName).toBe("Organizer One")
  })

  it("maps Prisma dates and increments the tournament version atomically", async () => {
    const prisma = createPrismaMock()
    prisma.tournament.updateMany.mockResolvedValue({ count: 1 })
    prisma.tournament.findUnique.mockResolvedValue({
      ...tournamentRow,
      title: "Updated",
      version: 3,
    })
    const repository = new PrismaTournamentOperationsRepository(
      prisma as unknown as PrismaClient,
    )

    const updated = await repository.updateWithVersion("tournament-1", 2, {
      title: "Updated",
      startsAt: "2026-11-20T09:00:00+07:00",
    }, {
      actorId: "organizer-1",
      action: "tournament.updated",
      adminOverride: false,
    })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.tournament.updateMany).toHaveBeenCalledWith({
      where: { id: "tournament-1", version: 2 },
      data: {
        title: "Updated",
        startsAt: new Date("2026-11-20T02:00:00.000Z"),
        version: { increment: 1 },
      },
    })
    expect(updated).toEqual(
      expect.objectContaining({
        version: 3,
        startsAt: "2026-11-15T02:00:00.000Z",
        createdAt: "2026-07-26T01:00:00.000Z",
      }),
    )
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "organizer-1",
        action: "tournament.updated",
        beforeJson: expect.anything(),
        afterJson: expect.anything(),
      }),
    })
  })

  it("rejects a stale update after loading only the audit snapshot", async () => {
    const prisma = createPrismaMock()
    prisma.tournament.findUnique.mockResolvedValue(tournamentRow)
    prisma.tournament.updateMany.mockResolvedValue({ count: 0 })
    const repository = new PrismaTournamentOperationsRepository(
      prisma as unknown as PrismaClient,
    )

    await expect(
      repository.updateWithVersion(
        "tournament-1",
        1,
        { title: "Stale" },
        {
          actorId: "organizer-1",
          action: "tournament.updated",
          adminOverride: false,
        },
      ),
    ).rejects.toThrow("CONFLICT")
    expect(prisma.tournament.findUnique).toHaveBeenCalledOnce()
    expect(prisma.auditLog.create).not.toHaveBeenCalled()
  })

  it("writes the review and state transition in one transaction", async () => {
    const prisma = createPrismaMock()
    prisma.tournament.updateMany.mockResolvedValue({ count: 1 })
    prisma.tournament.findUnique.mockResolvedValue({
      ...tournamentRow,
      status: "APPROVED",
      version: 3,
    })
    prisma.tournamentReview.create.mockResolvedValue({})
    const repository = new PrismaTournamentOperationsRepository(
      prisma as unknown as PrismaClient,
    )

    const reviewed = await repository.reviewWithVersion({
      tournamentId: "tournament-1",
      version: 2,
      sourceStatus: "SUBMITTED",
      status: "APPROVED",
      reviewerId: "admin-1",
      decision: "APPROVED",
      note: "Approved",
    })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.tournament.updateMany).toHaveBeenCalledWith({
      where: { id: "tournament-1", version: 2, status: "SUBMITTED" },
      data: { status: "APPROVED", version: { increment: 1 } },
    })
    expect(prisma.tournamentReview.create).toHaveBeenCalledWith({
      data: {
        tournamentId: "tournament-1",
        reviewerId: "admin-1",
        decision: "APPROVED",
        note: "Approved",
      },
    })
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "admin-1",
        action: "tournament.reviewed",
        beforeJson: expect.anything(),
        afterJson: expect.anything(),
      }),
    })
    expect(reviewed.version).toBe(3)
  })

  it("writes a distinct override audit in the lifecycle transaction", async () => {
    const prisma = createPrismaMock()
    prisma.tournament.findUnique
      .mockResolvedValueOnce({
        ...tournamentRow,
        status: "APPROVED",
      })
      .mockResolvedValueOnce({
        ...tournamentRow,
        status: "PUBLISHED",
        version: 3,
      })
    prisma.tournament.updateMany.mockResolvedValue({ count: 1 })
    const repository = new PrismaTournamentOperationsRepository(
      prisma as unknown as PrismaClient,
    )

    await repository.transitionWithVersion({
      tournamentId: "tournament-1",
      version: 2,
      sourceStatus: "APPROVED",
      status: "PUBLISHED",
      actorId: "admin-1",
      action: "tournament.published",
      adminOverride: true,
    })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.auditLog.create).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({ action: "tournament.published" }),
    })
    expect(prisma.auditLog.create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({ action: "tournament.admin_override" }),
    })
  })

  it("lists submitted tournaments in update order for the admin queue", async () => {
    const prisma = createPrismaMock()
    prisma.tournament.findMany.mockResolvedValue([
      {
        ...tournamentRow,
        organizer: { displayName: "Bangkok Hoops" },
      },
    ])
    const repository = new PrismaTournamentOperationsRepository(
      prisma as unknown as PrismaClient,
    )

    const tournaments = await repository.listByStatus("SUBMITTED")

    expect(prisma.tournament.findMany).toHaveBeenCalledWith({
      where: { status: "SUBMITTED" },
      orderBy: { updatedAt: "asc" },
      include: {
        organizer: { select: { displayName: true } },
        province: true,
      },
    })
    expect(tournaments[0]?.updatedAt).toBe("2026-07-26T02:00:00.000Z")
    expect(tournaments[0]?.organizerName).toBe("Bangkok Hoops")
  })
})
