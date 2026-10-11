import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaTeamRepository } from "@/features/team-management/infrastructure/prisma-team-repository"

const teamRow = {
  id: "team-1",
  name: "Bangkok Ballers",
  provinceCode: "10",
  province: { nameTh: "กรุงเทพมหานคร" },
  ownerId: "manager-1",
  format: "THREE_V_THREE" as const,
  isActive: false,
  deactivatedAt: new Date("2026-07-26T00:00:00.000Z"),
  version: 2,
}

const playerRow = {
  id: "player-1",
  teamId: "team-1",
  firstName: "One",
  lastName: "Player",
  nickname: null,
  birthDate: new Date("2010-02-03T00:00:00.000Z"),
  jerseyNumber: 4,
  position: "PG" as const,
  phone: null,
  isActive: true,
  deactivatedAt: null,
  createdAt: new Date("2026-07-25T00:00:00.000Z"),
  updatedAt: new Date("2026-07-26T00:00:00.000Z"),
}

const playerDraft = {
  firstName: "One",
  lastName: "Player",
  nickname: null,
  birthDate: "2010-02-03",
  jerseyNumber: 4,
  position: "PG" as const,
  phone: null,
}

function createPrismaMock() {
  const prisma = {
    $queryRaw: vi.fn(),
    team: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    registration: { findFirst: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() },
    teamMember: { count: vi.fn(), groupBy: vi.fn() },
    teamPlayer: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
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
  it("reports legacy reconciliation counts and registration statuses without selecting PII", async () => {
    const prisma = createPrismaMock()
    prisma.teamMember.groupBy.mockResolvedValue([
      { teamId: "team-1", role: "PLAYER", isActive: true, _count: { _all: 2 } },
      { teamId: "team-1", role: "COACH", isActive: true, _count: { _all: 1 } },
    ])
    prisma.team.findMany.mockResolvedValue([teamRow])
    prisma.teamPlayer.groupBy.mockResolvedValue([
      { teamId: "team-1", _count: { _all: 1 } },
    ])
    prisma.registration.groupBy.mockResolvedValue([
      { teamId: "team-1", status: "REJECTED", _count: { _all: 1 } },
      { teamId: "team-1", status: "WITHDRAWN", _count: { _all: 2 } },
    ])
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)
    const compatibilityRepository = repository as unknown as {
      listLegacyReconciliationContexts(teamId?: string): Promise<unknown>
    }

    expect(typeof compatibilityRepository.listLegacyReconciliationContexts).toBe("function")
    await expect(
      compatibilityRepository.listLegacyReconciliationContexts("team-1"),
    ).resolves.toEqual([
      {
        teamId: "team-1",
        format: "THREE_V_THREE",
        activeLegacyPlayerCount: 2,
        activeLegacyCoachCount: 1,
        inactiveLegacyPlayerCount: 0,
        inactiveLegacyCoachCount: 0,
        totalLegacyMemberCount: 3,
        activeTeamPlayerCount: 1,
        registrationHistoryCount: 3,
        registrationStatusCounts: {
          PENDING: 0,
          APPROVED: 0,
          REJECTED: 1,
          CANCELLED: 0,
          WITHDRAWN: 2,
        },
      },
    ])
    expect(prisma.teamMember.groupBy).toHaveBeenCalledWith({
      by: ["teamId", "role", "isActive"],
      where: { teamId: "team-1" },
      _count: { _all: true },
      orderBy: [{ teamId: "asc" }, { role: "asc" }, { isActive: "desc" }],
    })
    expect(prisma.team.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["team-1"] } },
      select: { id: true, format: true },
      orderBy: { id: "asc" },
    })
    expect(prisma.teamPlayer.groupBy).toHaveBeenCalledWith({
      by: ["teamId"],
      where: { teamId: { in: ["team-1"] }, isActive: true },
      _count: { _all: true },
    })
    expect(prisma.registration.groupBy).toHaveBeenCalledWith({
      by: ["teamId", "status"],
      where: { teamId: { in: ["team-1"] } },
      _count: { _all: true },
    })
  })

  it("includes teams with inactive-only legacy member history", async () => {
    const prisma = createPrismaMock()
    prisma.teamMember.groupBy.mockResolvedValue([
      { teamId: "team-1", role: "PLAYER", isActive: false, _count: { _all: 2 } },
      { teamId: "team-1", role: "COACH", isActive: false, _count: { _all: 1 } },
    ])
    prisma.team.findMany.mockResolvedValue([teamRow])
    prisma.teamPlayer.groupBy.mockResolvedValue([])
    prisma.registration.groupBy.mockResolvedValue([])
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(repository.listLegacyReconciliationContexts()).resolves.toEqual([
      {
        teamId: "team-1",
        format: "THREE_V_THREE",
        activeLegacyPlayerCount: 0,
        activeLegacyCoachCount: 0,
        inactiveLegacyPlayerCount: 2,
        inactiveLegacyCoachCount: 1,
        totalLegacyMemberCount: 3,
        activeTeamPlayerCount: 0,
        registrationHistoryCount: 0,
        registrationStatusCounts: {
          PENDING: 0,
          APPROVED: 0,
          REJECTED: 0,
          CANCELLED: 0,
          WITHDRAWN: 0,
        },
      },
    ])
    expect(prisma.teamMember.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    )
  })

  it("locks the team row before reading the update snapshot", async () => {
    const prisma = createPrismaMock()
    prisma.$queryRaw.mockResolvedValue([{ id: "team-1" }])
    prisma.team.findUnique.mockResolvedValue(teamRow)
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    const lockedTeam = await repository.inTransaction((teams) =>
      teams.findByIdForUpdate("team-1"),
    )

    expect(prisma.$queryRaw).toHaveBeenCalledOnce()
    expect(prisma.$queryRaw.mock.calls[0][0].text).toContain('FROM "Team"')
    expect(prisma.$queryRaw.mock.calls[0][0].text).toMatch(/\bFOR\s+UPDATE\b/i)
    expect(prisma.team.findUnique).toHaveBeenCalledWith({
      where: { id: "team-1" },
      include: { province: true },
    })
    expect(lockedTeam).toMatchObject({ id: "team-1", version: 2 })
  })

  it("loads registration statuses with the locked team removal snapshot", async () => {
    const prisma = createPrismaMock()
    prisma.$queryRaw.mockResolvedValue([{ id: "team-1" }])
    prisma.team.findUnique.mockResolvedValue(teamRow)
    prisma.registration.findMany.mockResolvedValue([
      { status: "REJECTED" },
      { status: "WITHDRAWN" },
    ])
    prisma.teamMember.count.mockResolvedValue(2)
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(
      repository.inTransaction((teams) =>
        teams.getRemovalContextForUpdate("team-1"),
      ),
    ).resolves.toEqual({
      team: {
        id: "team-1",
        name: "Bangkok Ballers",
        provinceCode: "10",
        province: teamRow.province.nameTh,
        ownerId: "manager-1",
        format: "THREE_V_THREE",
        isActive: false,
        deactivatedAt: "2026-07-26T00:00:00.000Z",
        version: 2,
      },
      registrationStatuses: ["REJECTED", "WITHDRAWN"],
      totalLegacyMemberCount: 2,
    })
    expect(prisma.$queryRaw).toHaveBeenCalledOnce()
    expect(prisma.$queryRaw.mock.calls[0][0].text).toMatch(/FOR\s+UPDATE/i)
    expect(prisma.registration.findMany).toHaveBeenCalledWith({
      where: { teamId: "team-1" },
      select: { status: true },
    })
    expect(prisma.teamMember.count).toHaveBeenCalledWith({
      where: { teamId: "team-1" },
    })
    expect(prisma.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      prisma.teamMember.count.mock.invocationCallOrder[0],
    )
  })

  it("permanently deletes a team inside the transaction repository", async () => {
    const prisma = createPrismaMock()
    prisma.team.delete.mockResolvedValue(teamRow)
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await repository.inTransaction((teams) => teams.deleteTeam("team-1"))

    expect(prisma.team.delete).toHaveBeenCalledWith({ where: { id: "team-1" } })
  })

  it("deactivates a team at the expected version and increments it", async () => {
    const prisma = createPrismaMock()
    const at = "2026-08-09T12:00:00.000Z"
    prisma.team.updateMany.mockResolvedValue({ count: 1 })
    prisma.team.findUnique.mockResolvedValue({
      ...teamRow,
      isActive: false,
      deactivatedAt: new Date(at),
      version: 3,
    })
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(
      repository.deactivateTeam("team-1", 2, at),
    ).resolves.toMatchObject({
      isActive: false,
      deactivatedAt: at,
      version: 3,
    })
    expect(prisma.team.updateMany).toHaveBeenCalledWith({
      where: { id: "team-1", version: 2, isActive: true },
      data: {
        isActive: false,
        deactivatedAt: new Date(at),
        version: { increment: 1 },
      },
    })
  })

  it("maps active players with date-only birth dates", async () => {
    const prisma = createPrismaMock()
    prisma.teamPlayer.findMany.mockResolvedValue([playerRow])
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(repository.listActivePlayers("team-1")).resolves.toEqual([
      {
        id: "player-1",
        teamId: "team-1",
        firstName: "One",
        lastName: "Player",
        nickname: null,
        birthDate: "2010-02-03",
        jerseyNumber: 4,
        position: "PG",
        phone: null,
        isActive: true,
        deactivatedAt: null,
        createdAt: "2026-07-25T00:00:00.000Z",
        updatedAt: "2026-07-26T00:00:00.000Z",
      },
    ])
  })

  it("lists active and inactive TeamPlayer history from all owned teams", async () => {
    const prisma = createPrismaMock()
    const inactivePlayerRow = {
      ...playerRow,
      id: "player-2",
      teamId: "team-inactive",
      isActive: false,
      deactivatedAt: new Date("2026-07-27T00:00:00.000Z"),
      updatedAt: new Date("2026-07-28T00:00:00.000Z"),
      team: { name: "Archived Team" },
    }
    prisma.teamPlayer.findMany.mockResolvedValue([
      inactivePlayerRow,
      { ...playerRow, team: { name: "Bangkok Ballers" } },
    ])
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(repository.listPlayerHistoryByOwner("manager-1")).resolves.toEqual([
      {
        id: "player-2",
        teamId: "team-inactive",
        firstName: "One",
        lastName: "Player",
        nickname: null,
        birthDate: "2010-02-03",
        jerseyNumber: 4,
        position: "PG",
        phone: null,
        isActive: false,
        deactivatedAt: "2026-07-27T00:00:00.000Z",
        createdAt: "2026-07-25T00:00:00.000Z",
        updatedAt: "2026-07-28T00:00:00.000Z",
        teamName: "Archived Team",
      },
      {
        id: "player-1",
        teamId: "team-1",
        firstName: "One",
        lastName: "Player",
        nickname: null,
        birthDate: "2010-02-03",
        jerseyNumber: 4,
        position: "PG",
        phone: null,
        isActive: true,
        deactivatedAt: null,
        createdAt: "2026-07-25T00:00:00.000Z",
        updatedAt: "2026-07-26T00:00:00.000Z",
        teamName: "Bangkok Ballers",
      },
    ])
    expect(prisma.teamPlayer.findMany).toHaveBeenCalledWith({
      where: { team: { ownerId: "manager-1" } },
      include: { team: { select: { name: true } } },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    })
    expect(prisma.teamMember.count).not.toHaveBeenCalled()
    expect(prisma.teamMember.groupBy).not.toHaveBeenCalled()
  })

  it("reads TeamPlayers through the transaction repository after locking Team", async () => {
    const prisma = createPrismaMock()
    prisma.$queryRaw.mockResolvedValue([{ id: "team-1" }])
    prisma.team.findUnique.mockResolvedValue(teamRow)
    prisma.teamPlayer.findMany.mockResolvedValue([playerRow])
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await repository.inTransaction(async (teams) => {
      await teams.findByIdForUpdate("team-1")
      await teams.listActivePlayers("team-1")
    })

    expect(prisma.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      prisma.teamPlayer.findMany.mock.invocationCallOrder[0],
    )
    expect(prisma.teamPlayer.findMany).toHaveBeenCalledWith({
      where: { teamId: "team-1", isActive: true },
      orderBy: { createdAt: "asc" },
    })
  })

  it("finds matching player identities regardless of active status", async () => {
    const prisma = createPrismaMock()
    const inactivePlayer = {
      ...playerRow,
      isActive: false,
      deactivatedAt: new Date("2026-07-26T00:00:00.000Z"),
    }
    prisma.teamPlayer.findMany.mockResolvedValue([inactivePlayer])
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(
      repository.findExistingPlayersByIdentities("team-1", [playerDraft]),
    ).resolves.toMatchObject([{ id: "player-1", isActive: false }])
    expect(prisma.teamPlayer.findMany).toHaveBeenCalledWith({
      where: {
        teamId: "team-1",
        OR: [
          {
            firstName: "One",
            lastName: "Player",
            birthDate: new Date("2010-02-03"),
          },
        ],
      },
      orderBy: { createdAt: "asc" },
    })
  })

  it("reactivates an inactive duplicate player instead of inserting another row", async () => {
    const prisma = createPrismaMock()
    prisma.teamPlayer.findUnique
      .mockResolvedValueOnce({ ...playerRow, isActive: false, deactivatedAt: new Date("2026-07-26T00:00:00.000Z") })
      .mockResolvedValueOnce({ ...playerRow, updatedAt: new Date("2026-08-07T00:00:00.000Z") })
    prisma.teamPlayer.updateMany.mockResolvedValue({ count: 1 })
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(repository.addPlayers("team-1", [playerDraft])).resolves.toMatchObject({
      0: { id: "player-1", isActive: true, deactivatedAt: null },
    })
    expect(prisma.teamPlayer.updateMany).toHaveBeenCalledWith({
      where: { id: "player-1", teamId: "team-1", isActive: false },
      data: {
        nickname: null,
        jerseyNumber: 4,
        position: "PG",
        phone: null,
        isActive: true,
        deactivatedAt: null,
      },
    })
    expect(prisma.teamPlayer.create).not.toHaveBeenCalled()
  })

  it("maps player identity and active jersey unique failures", async () => {
    const identityPrisma = createPrismaMock()
    identityPrisma.teamPlayer.findUnique.mockResolvedValue({ ...playerRow, isActive: true })
    const identityRepository = new PrismaTeamRepository(identityPrisma as unknown as PrismaClient)

    await expect(identityRepository.addPlayers("team-1", [playerDraft])).rejects.toThrow(
      "PLAYER_ALREADY_EXISTS",
    )

    const jerseyPrisma = createPrismaMock()
    jerseyPrisma.teamPlayer.findUnique.mockResolvedValue(null)
    jerseyPrisma.teamPlayer.create.mockRejectedValue({
      code: "P2002",
      meta: { target: ["teamId", "jerseyNumber"] },
    })
    const jerseyRepository = new PrismaTeamRepository(jerseyPrisma as unknown as PrismaClient)

    await expect(jerseyRepository.addPlayers("team-1", [playerDraft])).rejects.toThrow(
      "JERSEY_ALREADY_IN_USE",
    )
  })

  it("does not persist the first player when the second insert fails in a transaction", async () => {
    const prisma = createPrismaMock()
    const persisted: typeof playerRow[] = []
    prisma.teamPlayer.findUnique.mockResolvedValue(null)
    prisma.teamPlayer.create.mockImplementation(async ({ data }) => {
      if (data.firstName === "Two") {
        throw { code: "P2002", meta: { target: ["teamId", "jerseyNumber"] } }
      }
      const created = { ...playerRow, ...data, id: "player-new" }
      persisted.push(created)
      return created
    })
    prisma.$transaction.mockImplementation(async (operation) => {
      const before = [...persisted]
      try {
        return await operation(prisma)
      } catch (error) {
        persisted.splice(0, persisted.length, ...before)
        throw error
      }
    })
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(
      repository.inTransaction((transaction) =>
        transaction.addPlayers("team-1", [
          playerDraft,
          { ...playerDraft, firstName: "Two", jerseyNumber: 8 },
        ]),
      ),
    ).rejects.toThrow("JERSEY_ALREADY_IN_USE")

    expect(persisted).toEqual([])
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it("maps team compatibility fields for team reads", async () => {
    const prisma = createPrismaMock()
    prisma.team.findUnique.mockResolvedValue(teamRow)
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(repository.findById("team-1")).resolves.toEqual({
      id: "team-1",
      name: "Bangkok Ballers",
      provinceCode: "10",
      province: teamRow.province.nameTh,
      ownerId: "manager-1",
      format: "THREE_V_THREE",
      isActive: false,
      deactivatedAt: "2026-07-26T00:00:00.000Z",
      version: 2,
    })
  })

  it("updates a team only at the expected version and increments it", async () => {
    const prisma = createPrismaMock()
    prisma.team.updateMany.mockResolvedValue({ count: 1 })
    prisma.team.findUnique.mockResolvedValue({ ...teamRow, version: 3 })
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(
      repository.update("team-1", {
        name: "Changed",
        provinceCode: "10",
        format: "FIVE_V_FIVE",
        expectedVersion: 2,
      }),
    ).resolves.toMatchObject({ name: "Bangkok Ballers", version: 3 })
    expect(prisma.team.updateMany).toHaveBeenCalledWith({
      where: { id: "team-1", version: 2 },
      data: {
        name: "Changed",
        provinceCode: "10",
        format: "FIVE_V_FIVE",
        version: { increment: 1 },
      },
    })
  })

  it("returns a conflict for a stale team update", async () => {
    const prisma = createPrismaMock()
    prisma.team.updateMany.mockResolvedValue({ count: 0 })
    const repository = new PrismaTeamRepository(prisma as unknown as PrismaClient)

    await expect(
      repository.update("team-1", {
        name: "Changed",
        provinceCode: "10",
        format: "FIVE_V_FIVE",
        expectedVersion: 1,
      }),
    ).rejects.toThrow("CONFLICT")
    expect(prisma.team.findUnique).not.toHaveBeenCalled()
  })

  it("rolls back a team update when its audit write fails inside a transaction", async () => {
    const prisma = createPrismaMock()
    let persistedTeam = { ...teamRow }
    prisma.team.updateMany.mockImplementation(async ({ data }) => {
      persistedTeam = { ...persistedTeam, ...data, version: persistedTeam.version + 1 }
      return { count: 1 }
    })
    prisma.team.findUnique.mockImplementation(async () => {
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
          format: "THREE_V_THREE",
          expectedVersion: 2,
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
