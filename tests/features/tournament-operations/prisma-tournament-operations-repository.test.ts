import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/prisma-tournament-operations-repository"

const tournamentRow = {
  id: "tournament-1",
  slug: "review-cup",
  title: "Review Cup",
  description: "Tournament description",
  rules: "Tournament rules",
  province: "Bangkok",
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
    $transaction: vi.fn(async (operation: (client: unknown) => unknown) =>
      operation(prisma),
    ),
  }

  return prisma
}

describe("PrismaTournamentOperationsRepository", () => {
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
    })

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
  })

  it("rejects a stale update without reloading the tournament", async () => {
    const prisma = createPrismaMock()
    prisma.tournament.updateMany.mockResolvedValue({ count: 0 })
    const repository = new PrismaTournamentOperationsRepository(
      prisma as unknown as PrismaClient,
    )

    await expect(
      repository.updateWithVersion("tournament-1", 1, { title: "Stale" }),
    ).rejects.toThrow("CONFLICT")
    expect(prisma.tournament.findUnique).not.toHaveBeenCalled()
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
      status: "APPROVED",
      reviewerId: "admin-1",
      decision: "APPROVED",
      note: "Approved",
    })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.tournament.updateMany).toHaveBeenCalledWith({
      where: { id: "tournament-1", version: 2 },
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
    expect(reviewed.version).toBe(3)
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
      },
    })
    expect(tournaments[0]?.updatedAt).toBe("2026-07-26T02:00:00.000Z")
    expect(tournaments[0]?.organizerName).toBe("Bangkok Hoops")
  })
})
