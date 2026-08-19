import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { generateSingleEliminationBracket } from "@/features/competition/domain/bracket-generator"
import { PrismaCompetitionRepository } from "@/features/competition/infrastructure/prisma-competition-repository"

function createPrismaMock() {
  const prisma = {
    bracket: { create: vi.fn(), updateMany: vi.fn() },
    bracketEntry: { createMany: vi.fn(), update: vi.fn() },
    bracketRound: { createMany: vi.fn(), deleteMany: vi.fn() },
    match: {
      createMany: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    tournament: { findUnique: vi.fn(), updateMany: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(
      async (operation: (client: typeof prisma) => Promise<unknown>) =>
        operation(prisma),
    ),
  }
  return prisma
}

describe("PrismaCompetitionRepository", () => {
  it("schedules a version-checked match and records an audit event", async () => {
    const prisma = createPrismaMock()
    prisma.match.updateMany.mockResolvedValue({ count: 1 })
    prisma.auditLog.create.mockResolvedValue({})
    const repository = new PrismaCompetitionRepository(
      prisma as unknown as PrismaClient,
    )

    const scheduled = await repository.scheduleMatch({
      tournamentId: "tournament-1",
      matchId: "match-1",
      scheduledAt: "2026-11-15T05:00:00.000Z",
      court: "Court A",
      expectedVersion: 1,
      overrideReason: null,
      actorId: "organizer-1",
      adminOverride: false,
      at: "2026-08-19T08:00:00.000Z",
    })

    expect(prisma.match.updateMany).toHaveBeenCalledWith({
      where: { id: "match-1", tournamentId: "tournament-1", version: 1, status: "SCHEDULED" },
      data: {
        scheduledAt: new Date("2026-11-15T05:00:00.000Z"),
        court: "Court A",
        version: { increment: 1 },
      },
    })
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "MATCH_SCHEDULED" }),
    })
    expect(scheduled).toEqual({
      id: "match-1",
      scheduledAt: "2026-11-15T05:00:00.000Z",
      court: "Court A",
      version: 2,
    })
  })

  it("publishes a version-checked draft and records an audit event", async () => {
    const prisma = createPrismaMock()
    prisma.bracket.updateMany.mockResolvedValue({ count: 1 })
    prisma.auditLog.create.mockResolvedValue({})
    const repository = new PrismaCompetitionRepository(
      prisma as unknown as PrismaClient,
    )

    const published = await repository.setPublication({
      tournamentId: "tournament-1",
      bracketId: "bracket-1",
      expectedVersion: 3,
      published: true,
      reason: null,
      actorId: "organizer-1",
      adminOverride: false,
      at: "2026-08-19T07:00:00.000Z",
    })

    expect(prisma.bracket.updateMany).toHaveBeenCalledWith({
      where: {
        id: "bracket-1",
        tournamentId: "tournament-1",
        version: 3,
        status: "DRAFT",
      },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date("2026-08-19T07:00:00.000Z"),
        version: { increment: 1 },
      },
    })
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "BRACKET_PUBLISHED" }),
    })
    expect(published.version).toBe(4)
  })

  it("persists entries, rounds, linked matches, and an audit event atomically", async () => {
    const prisma = createPrismaMock()
    prisma.bracket.updateMany.mockResolvedValue({ count: 1 })
    prisma.bracketEntry.update.mockResolvedValue({})
    prisma.bracketRound.deleteMany.mockResolvedValue({ count: 0 })
    prisma.bracketRound.createMany.mockResolvedValue({ count: 1 })
    prisma.match.createMany.mockResolvedValue({ count: 1 })
    prisma.auditLog.create.mockResolvedValue({})
    const repository = new PrismaCompetitionRepository(
      prisma as unknown as PrismaClient,
      (() => {
        const ids = ["round-1", "match-1"]
        return () => ids.shift() ?? "unexpected-id"
      })(),
    )
    const entries = [
      {
        id: "entry-1",
        bracketId: "bracket-1",
        registrationId: "registration-1",
        teamId: "team-1",
        teamNameSnapshot: "Team One",
        seed: 1,
        drawPosition: 1,
        startRoundSequence: 1,
      },
      {
        id: "entry-2",
        bracketId: "bracket-1",
        registrationId: "registration-2",
        teamId: "team-2",
        teamNameSnapshot: "Team Two",
        seed: 2,
        drawPosition: 2,
        startRoundSequence: 1,
      },
    ]
    const plan = generateSingleEliminationBracket({
      entries: entries.map(({ id, teamId, seed }) => ({
        entryId: id,
        teamId,
        seed,
      })),
    })

    await repository.persistGeneratedPlan({
      tournamentId: "tournament-1",
      bracketId: "bracket-1",
      expectedVersion: 2,
      generationMethod: "SEEDED",
      drawToken: null,
      entries,
      plan,
      actorId: "organizer-1",
      adminOverride: false,
      at: "2026-08-19T05:00:00.000Z",
    })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.bracket.updateMany).toHaveBeenCalledWith({
      where: {
        id: "bracket-1",
        tournamentId: "tournament-1",
        version: 2,
        status: "DRAFT",
        entriesLockedAt: { not: null },
      },
      data: {
        generationMethod: "SEEDED",
        drawToken: null,
        version: { increment: 1 },
      },
    })
    expect(prisma.bracketRound.deleteMany).toHaveBeenCalledWith({
      where: { bracketId: "bracket-1" },
    })
    expect(prisma.bracketEntry.update).toHaveBeenCalledTimes(2)
    expect(prisma.match.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          id: "match-1",
          bracketId: "bracket-1",
          roundId: "round-1",
          homeTeamId: "team-1",
          awayTeamId: "team-2",
          nextMatchId: null,
          nextSlot: null,
        }),
      ],
    })
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "BRACKET_GENERATED",
        tournamentId: "tournament-1",
        entityId: "bracket-1",
      }),
    })
  })

  it("rejects a stale bracket generation without replacing rounds", async () => {
    const prisma = createPrismaMock()
    prisma.bracket.updateMany.mockResolvedValue({ count: 0 })
    const repository = new PrismaCompetitionRepository(
      prisma as unknown as PrismaClient,
    )
    const entries = [
      {
        id: "entry-1",
        bracketId: "bracket-1",
        registrationId: "registration-1",
        teamId: "team-1",
        teamNameSnapshot: "Team One",
        seed: 1,
        drawPosition: 1,
        startRoundSequence: 1,
      },
      {
        id: "entry-2",
        bracketId: "bracket-1",
        registrationId: "registration-2",
        teamId: "team-2",
        teamNameSnapshot: "Team Two",
        seed: 2,
        drawPosition: 2,
        startRoundSequence: 1,
      },
    ]

    await expect(
      repository.persistGeneratedPlan({
        tournamentId: "tournament-1",
        bracketId: "bracket-1",
        expectedVersion: 9,
        generationMethod: "RANDOM",
        drawToken: "draw-token",
        entries,
        plan: generateSingleEliminationBracket({
          entries: entries.map(({ id, teamId, seed }) => ({
            entryId: id,
            teamId,
            seed,
          })),
        }),
        actorId: "organizer-1",
        adminOverride: false,
        at: "2026-08-19T05:00:00.000Z",
      }),
    ).rejects.toThrow("CONFLICT")
    expect(prisma.bracketRound.deleteMany).not.toHaveBeenCalled()
  })

  it("locks approved registration snapshots after a version-checked tournament update", async () => {
    const prisma = createPrismaMock()
    prisma.tournament.findUnique.mockResolvedValue({
      id: "tournament-1",
      organizerId: "organizer-1",
      status: "REGISTRATION_CLOSED",
      capacity: 6,
      version: 3,
      registrations: [
        {
          id: "registration-1",
          teamId: "team-1",
          team: { name: "Team One" },
        },
        {
          id: "registration-2",
          teamId: "team-2",
          team: { name: "Team Two" },
        },
      ],
      brackets: [],
    })
    prisma.tournament.updateMany.mockResolvedValue({ count: 1 })
    prisma.bracket.create.mockResolvedValue({
      id: "bracket-1",
      tournamentId: "tournament-1",
      version: 0,
    })
    prisma.bracketEntry.createMany.mockResolvedValue({ count: 2 })
    prisma.auditLog.create.mockResolvedValue({})
    const repository = new PrismaCompetitionRepository(
      prisma as unknown as PrismaClient,
      (() => {
        const ids = ["entry-1", "entry-2"]
        return () => ids.shift() ?? "unexpected-id"
      })(),
    )

    const locked = await repository.lockEntries({
      tournamentId: "tournament-1",
      expectedVersion: 3,
      actorId: "organizer-1",
      at: "2026-08-19T05:00:00.000Z",
      adminOverride: false,
    })

    expect(prisma.tournament.updateMany).toHaveBeenCalledWith({
      where: {
        id: "tournament-1",
        version: 3,
        status: "REGISTRATION_CLOSED",
      },
      data: { version: { increment: 1 } },
    })
    expect(prisma.bracketEntry.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          registrationId: "registration-1",
          teamId: "team-1",
          teamNameSnapshot: "Team One",
          seed: 1,
        }),
        expect.objectContaining({
          registrationId: "registration-2",
          teamId: "team-2",
          teamNameSnapshot: "Team Two",
          seed: 2,
        }),
      ],
    })
    expect(locked.entries).toHaveLength(2)
  })
})
