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

function createPrismaMock() {
  return {
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
    },
    auditLog: { create: vi.fn() },
  }
}

describe("PrismaTeamRepository", () => {
  it("reactivates a historical membership instead of inserting a duplicate", async () => {
    const prisma = createPrismaMock()
    prisma.teamMember.findUnique.mockResolvedValue(memberRow)
    prisma.teamMember.update.mockResolvedValue({
      ...memberRow,
      role: "COACH",
      isActive: true,
      deactivatedAt: null,
    })
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    const member = await repository.addMember({
      teamId: "team-1",
      userId: "player-1",
      role: "COACH",
    })

    expect(prisma.teamMember.update).toHaveBeenCalledWith({
      where: { id: "membership-1" },
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
