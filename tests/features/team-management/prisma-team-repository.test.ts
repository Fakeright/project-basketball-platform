import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaTeamRepository } from "@/features/team-management/infrastructure/prisma-team-repository"

const memberRow = {
  id: "membership-1",
  teamId: "team-1",
  userId: "player-1",
  role: "PLAYER" as const,
  isActive: false,
  deactivatedAt: new Date("2026-07-26T00:00:00.000Z"),
  createdAt: new Date("2026-07-25T00:00:00.000Z"),
}

const teamRow = {
  id: "team-1",
  name: "Bangkok Ballers",
  provinceCode: "10",
  province: { nameTh: "กรุงเทพมหานคร" },
  ownerId: "manager-1",
}

function createPrismaMock() {
  const prisma = {
    team: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    user: { findUnique: vi.fn() },
    teamMember: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: { create: vi.fn() },
  }
  return {
    ...prisma,
    $transaction: vi.fn(async (operation) => operation(prisma)),
  }
}

describe("PrismaTeamRepository", () => {
  it("reactivates a historical membership instead of inserting a duplicate", async () => {
    const prisma = createPrismaMock()
    prisma.teamMember.findUnique
      .mockResolvedValueOnce(memberRow)
      .mockResolvedValueOnce({
        ...memberRow,
        role: "COACH",
        isActive: true,
        deactivatedAt: null,
      })
    prisma.teamMember.updateMany.mockResolvedValue({ count: 1 })
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    const member = await repository.addMember({
      teamId: "team-1",
      userId: "player-1",
      role: "COACH",
    })

    expect(prisma.teamMember.updateMany).toHaveBeenCalledWith({
      where: { id: "membership-1", teamId: "team-1", userId: "player-1", isActive: false },
      data: { role: "COACH", isActive: true, deactivatedAt: null },
    })
    expect(prisma.teamMember.create).not.toHaveBeenCalled()
    expect(member).toMatchObject({ id: "membership-1", role: "COACH", isActive: true })
  })

  it("rejects adding a member that is already active", async () => {
    const prisma = createPrismaMock()
    prisma.teamMember.findUnique.mockResolvedValue({ ...memberRow, isActive: true, deactivatedAt: null })
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(
      repository.addMember({ teamId: "team-1", userId: "player-1", role: "PLAYER" }),
    ).rejects.toThrow("MEMBER_ALREADY_ACTIVE")
  })

  it("returns a conflict to the loser when concurrent reactivation requests race", async () => {
    const prisma = createPrismaMock()
    prisma.teamMember.findUnique.mockResolvedValue(memberRow)
    prisma.teamMember.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 })
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    const results = await Promise.allSettled([
      repository.addMember({ teamId: "team-1", userId: "player-1", role: "PLAYER" }),
      repository.addMember({ teamId: "team-1", userId: "player-1", role: "PLAYER" }),
    ])

    expect(results.map((result) => result.status)).toEqual(["fulfilled", "rejected"])
    expect(results[1]).toMatchObject({ reason: expect.objectContaining({ message: "MEMBER_ALREADY_ACTIVE" }) })
    expect(prisma.teamMember.updateMany).toHaveBeenCalledTimes(2)
  })

  it("rolls back a team update when its audit write fails inside a transaction", async () => {
    const prisma = createPrismaMock()
    let persistedTeam = { ...teamRow }
    prisma.team.update.mockImplementation(async ({ data }) => {
      persistedTeam = { ...persistedTeam, ...data }
      return persistedTeam
    })
    prisma.auditLog.create.mockRejectedValue(new Error("AUDIT_FAILED"))
    prisma.$transaction.mockImplementation(async (operation) => {
      const before = persistedTeam
      try {
        return await operation(prisma)
      } catch (error) {
        persistedTeam = before
        throw error
      }
    })
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(
      repository.inTransaction(async (transaction) => {
        const updated = await transaction.update("team-1", {
          name: "Changed",
          provinceCode: "10",
        })
        await transaction.appendAuditEvent({
          actorId: "manager-1",
          action: "team.updated",
          entityId: "team-1",
          before: teamRow,
          after: updated,
        })
      }),
    ).rejects.toThrow("AUDIT_FAILED")

    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(persistedTeam).toEqual(teamRow)
  })

  it("records team audit events with before and after values", async () => {
    const prisma = createPrismaMock()
    prisma.auditLog.create.mockResolvedValue({})
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await repository.appendAuditEvent({
      actorId: "manager-1",
      action: "team.updated",
      entityId: "team-1",
      before: { name: "Before" },
      after: { name: "After" },
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: "manager-1",
        action: "team.updated",
        entityType: "Team",
        entityId: "team-1",
        beforeJson: { name: "Before" },
        afterJson: { name: "After" },
      },
    })
  })
})
