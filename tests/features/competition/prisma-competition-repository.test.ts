import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { generateSingleEliminationBracket } from "@/features/competition/domain/bracket-generator"
import { PrismaCompetitionRepository } from "@/features/competition/infrastructure/prisma-competition-repository"

function createPrismaMock() {
  const prisma = {
    bracket: { create: vi.fn() },
    bracketEntry: { createMany: vi.fn() },
    bracketRound: { createMany: vi.fn() },
    match: { createMany: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(
      async (operation: (client: typeof prisma) => Promise<unknown>) =>
        operation(prisma),
    ),
  }
  return prisma
}

describe("PrismaCompetitionRepository", () => {
  it("persists entries, rounds, linked matches, and an audit event atomically", async () => {
    const prisma = createPrismaMock()
    prisma.bracket.create.mockResolvedValue({ id: "bracket-1", version: 0 })
    prisma.bracketEntry.createMany.mockResolvedValue({ count: 2 })
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
      generationMethod: "SEEDED",
      entries,
      plan,
      actorId: "organizer-1",
      adminOverride: false,
      at: "2026-08-19T05:00:00.000Z",
    })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.bracketEntry.createMany).toHaveBeenCalledWith({
      data: entries.map((entry) => expect.objectContaining(entry)),
    })
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
})
