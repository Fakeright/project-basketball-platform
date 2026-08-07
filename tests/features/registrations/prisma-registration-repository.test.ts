import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaRegistrationRepository } from "@/features/registrations/infrastructure/prisma-registration-repository"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"

function serializationConflict() {
  return Object.assign(new Error("write conflict"), { code: "P2034" })
}

const pendingRegistration: TournamentRegistration = {
  id: "registration-1",
  tournamentId: "tournament-1",
  teamId: "team-1",
  status: "PENDING",
  decisionNote: null,
  decidedAt: null,
  cancelledAt: null,
  withdrawnAt: null,
  version: 0,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
}

const teamRow = {
  id: "team-1",
  name: "Bangkok Hoops",
  provinceCode: "10",
  province: { nameTh: "Bangkok" },
  ownerId: "manager-1",
  format: "THREE_V_THREE" as const,
  isActive: false,
  deactivatedAt: new Date("2026-10-03T00:00:00.000Z"),
  version: 4,
}

function registrationRow(
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN",
  version: number,
) {
  return {
    id: pendingRegistration.id,
    tournamentId: pendingRegistration.tournamentId,
    teamId: pendingRegistration.teamId,
    status,
    decisionNote: status === "PENDING" ? null : "Reviewed",
    decidedAt: status === "PENDING" ? null : new Date("2026-10-02T00:00:00.000Z"),
    cancelledAt: null,
    withdrawnAt:
      status === "WITHDRAWN" ? new Date("2026-10-03T00:00:00.000Z") : null,
    version,
    createdAt: new Date(pendingRegistration.createdAt),
    updatedAt: new Date("2026-10-02T00:00:00.000Z"),
  }
}

function repositoryWithTransactionClient(client: object) {
  const transaction = vi.fn(
    async (operation: (transactionClient: never) => Promise<unknown>) =>
      operation(client as never),
  )
  return {
    repository: new PrismaRegistrationRepository({
      $transaction: transaction,
    } as unknown as PrismaClient),
    transaction,
  }
}

describe("PrismaRegistrationRepository transactions", () => {
  it("maps team compatibility fields for registration reads", async () => {
    const repository = new PrismaRegistrationRepository({
      team: { findUnique: vi.fn(async () => teamRow) },
    } as unknown as PrismaClient)

    await expect(repository.findTeam("team-1")).resolves.toEqual({
      id: "team-1",
      name: "Bangkok Hoops",
      provinceCode: "10",
      province: "Bangkok",
      ownerId: "manager-1",
      format: "THREE_V_THREE",
      isActive: false,
      deactivatedAt: "2026-10-03T00:00:00.000Z",
      version: 4,
    })
  })

  it("retries a serializable registration transaction after a PostgreSQL serialization conflict", async () => {
    let attempts = 0
    const transaction = vi.fn(async (
      operation: (client: never) => Promise<unknown>,
      _options: { isolationLevel?: string },
    ) => {
      expect(_options).toEqual({ isolationLevel: "Serializable" })
      attempts += 1
      if (attempts === 1) throw serializationConflict()
      return operation({} as never)
    })
    const repository = new PrismaRegistrationRepository({
      $transaction: transaction,
    } as unknown as PrismaClient)

    await expect(repository.inTransaction(async () => "created")).resolves.toBe("created")

    expect(transaction).toHaveBeenCalledTimes(2)
    expect(transaction).toHaveBeenLastCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" },
    )
  })

  it("maps exhausted PostgreSQL serialization retries to a recoverable conflict", async () => {
    const transaction = vi.fn(async () => {
      throw serializationConflict()
    })
    const repository = new PrismaRegistrationRepository({
      $transaction: transaction,
    } as unknown as PrismaClient)

    await expect(repository.inTransaction(async () => "created")).rejects.toThrow("CONFLICT")
    expect(transaction).toHaveBeenCalledTimes(3)
  })

  it("locks application eligibility and counts approved teams in the same transaction", async () => {
    const queryRaw = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: "tournament-1",
          format: "FIVE_V_FIVE",
          ageGroup: "U18",
          startsAt: new Date("2026-11-15T02:00:00.000Z"),
          status: "PUBLISHED",
          registrationDeadline: new Date("2026-11-01T00:00:00.000Z"),
          capacity: 8,
        },
      ])
      .mockResolvedValueOnce([])
    const player = {
      id: "team-player-1",
      teamId: "team-1",
      firstName: "Player",
      lastName: "One",
      nickname: null,
      birthDate: new Date("2008-01-01T00:00:00.000Z"),
      jerseyNumber: 1,
      position: "PG" as const,
      phone: null,
      isActive: true,
      deactivatedAt: null,
      createdAt: new Date("2026-08-07T00:00:00.000Z"),
      updatedAt: new Date("2026-08-07T00:00:00.000Z"),
    }
    const count = vi.fn(async () => 7)
    const { repository } = repositoryWithTransactionClient({
      $queryRaw: queryRaw,
      team: { findUnique: vi.fn(async () => teamRow) },
      teamPlayer: { findMany: vi.fn(async () => [player]) },
      registration: { count },
    })

    const context = await repository.inTransaction((registrations) =>
      registrations.getApplicationContext("tournament-1", "team-1"),
    )

    expect(queryRaw).toHaveBeenCalledTimes(2)
    expect(queryRaw.mock.calls[0][0].text).toMatch(/\bFOR\s+UPDATE\b/i)
    expect(queryRaw.mock.calls[1][0].text).toMatch(/\bFOR\s+UPDATE\b/i)
    expect(queryRaw.mock.calls[1][0].text).toContain('FROM "TeamPlayer"')
    expect(context?.roster).toEqual([
      {
        id: "team-player-1",
        teamId: "team-1",
        firstName: "Player",
        lastName: "One",
        nickname: null,
        birthDate: "2008-01-01",
        jerseyNumber: 1,
        position: "PG",
        phone: null,
        isActive: true,
        deactivatedAt: null,
        createdAt: "2026-08-07T00:00:00.000Z",
        updatedAt: "2026-08-07T00:00:00.000Z",
      },
    ])
    expect(count).toHaveBeenCalledWith({
      where: { tournamentId: "tournament-1", status: "APPROVED" },
    })
    expect(context?.tournament).toMatchObject({
      ageGroup: "U18",
      startsAt: "2026-11-15T02:00:00.000Z",
      capacity: 8,
      approvedCount: 7,
    })
  })

  it("summarizes active TeamPlayer rows and the owning manager/coach", async () => {
    const registration = registrationRow("PENDING", 0)
    const findMany = vi.fn(async () => [
      {
        ...registration,
        team: {
          ...teamRow,
          isActive: true,
          deactivatedAt: null,
          players: [
            {
              id: "player-1",
              isActive: true,
            },
            {
              id: "player-2",
              isActive: true,
            },
          ],
        },
      },
    ])
    const repository = new PrismaRegistrationRepository({
      registration: { findMany },
    } as unknown as PrismaClient)

    await expect(repository.listByTournament("tournament-1")).resolves.toEqual([
      expect.objectContaining({
        playerCount: 2,
        managerCoachCount: 1,
      }),
    ])
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          team: {
            include: {
              province: true,
              players: {
                where: { isActive: true },
                select: { id: true },
              },
            },
          },
        },
      }),
    )
  })

  it("writes a distinct admin override audit for application and cancellation", async () => {
    const created = registrationRow("PENDING", 0)
    const cancelled = {
      ...created,
      status: "CANCELLED" as const,
      cancelledAt: new Date("2026-10-02T00:00:00.000Z"),
      version: 1,
    }
    const registration = {
      create: vi.fn(async () => created),
      updateMany: vi.fn(async () => ({ count: 1 })),
      findUnique: vi.fn(async () => cancelled),
    }
    const createAudit = vi.fn(async () => undefined)
    const { repository } = repositoryWithTransactionClient({
      registration,
      auditLog: { create: createAudit },
    })

    await repository.inTransaction((registrations) =>
      registrations.createPending({
        tournamentId: "tournament-1",
        teamId: "team-1",
        actorId: "admin-1",
        adminOverride: true,
      }),
    )
    await repository.inTransaction((registrations) =>
      registrations.cancelWithVersion(
        "registration-1",
        0,
        "admin-1",
        "2026-10-02T00:00:00.000Z",
        true,
      ),
    )

    expect(createAudit.mock.calls.map(([input]) => input.data.action)).toEqual([
      "registration.created",
      "registration.admin_override",
      "registration.cancelled",
      "registration.admin_override",
    ])
  })

  it("locks the tournament and rejects approval deterministically at capacity", async () => {
    const lockTournament = vi.fn(async () => [{ capacity: 1 }])
    const count = vi.fn(async () => 1)
    const updateMany = vi.fn()
    const createAudit = vi.fn()
    const { repository } = repositoryWithTransactionClient({
      $queryRaw: lockTournament,
      registration: { count, updateMany },
      auditLog: { create: createAudit },
    })

    await expect(
      repository.inTransaction((registrations) =>
        registrations.approveWithCapacity({
          before: pendingRegistration,
          version: 0,
          note: "",
          actorId: "organizer-1",
          at: "2026-10-02T00:00:00.000Z",
          adminOverride: false,
        }),
      ),
    ).rejects.toThrow("TOURNAMENT_CAPACITY_REACHED")

    expect(lockTournament).toHaveBeenCalledOnce()
    const [lockQuery] = lockTournament.mock.calls[0]
    expect(lockQuery.text).toMatch(/\bFOR\s+UPDATE\b/i)
    expect(lockQuery.values).toEqual(["tournament-1"])
    expect(count).toHaveBeenCalledWith({
      where: { tournamentId: "tournament-1", status: "APPROVED" },
    })
    expect(updateMany).not.toHaveBeenCalled()
    expect(createAudit).not.toHaveBeenCalled()
  })

  it("conditionally approves a pending version and audits after the capacity lock", async () => {
    const lockTournament = vi.fn(async () => [{ capacity: 2 }])
    const count = vi.fn(async () => 1)
    const updateMany = vi.fn(async () => ({ count: 1 }))
    const findUnique = vi.fn(async () => registrationRow("APPROVED", 1))
    const createAudit = vi.fn(async () => undefined)
    const { repository } = repositoryWithTransactionClient({
      $queryRaw: lockTournament,
      registration: { count, updateMany, findUnique },
      auditLog: { create: createAudit },
    })

    await repository.inTransaction((registrations) =>
      registrations.approveWithCapacity({
        before: pendingRegistration,
        version: 0,
        note: "",
        actorId: "organizer-1",
        at: "2026-10-02T00:00:00.000Z",
        adminOverride: false,
      }),
    )

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "registration-1",
        tournamentId: "tournament-1",
        status: "PENDING",
        version: 0,
      },
      data: {
        status: "APPROVED",
        decisionNote: null,
        decidedAt: new Date("2026-10-02T00:00:00.000Z"),
        version: { increment: 1 },
      },
    })
    expect(createAudit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "organizer-1",
        action: "registration.approved",
        beforeJson: expect.anything(),
        afterJson: expect.anything(),
      }),
    })
    expect(lockTournament.mock.invocationCallOrder[0]).toBeLessThan(
      count.mock.invocationCallOrder[0],
    )
    expect(count.mock.invocationCallOrder[0]).toBeLessThan(
      updateMany.mock.invocationCallOrder[0],
    )
    expect(updateMany.mock.invocationCallOrder[0]).toBeLessThan(
      createAudit.mock.invocationCallOrder[0],
    )
  })

  it.each([
    {
      operation: "rejectWithVersion" as const,
      sourceStatus: "PENDING",
      nextStatus: "REJECTED",
      action: "registration.rejected",
      input: { note: "Not eligible" },
    },
    {
      operation: "withdrawWithVersion" as const,
      sourceStatus: "APPROVED",
      nextStatus: "WITHDRAWN",
      action: "registration.withdrawn",
      input: { reason: "Eligibility issue" },
    },
  ])(
    "updates only the submitted version from $sourceStatus to $nextStatus",
    async ({ operation, sourceStatus, nextStatus, action, input }) => {
      const before = {
        ...pendingRegistration,
        status: sourceStatus as "PENDING" | "APPROVED",
        version: sourceStatus === "APPROVED" ? 1 : 0,
      }
      const updateMany = vi.fn(async () => ({ count: 1 }))
      const findUnique = vi.fn(async () =>
        registrationRow(nextStatus as "REJECTED" | "WITHDRAWN", before.version + 1),
      )
      const createAudit = vi.fn(async () => undefined)
      const { repository } = repositoryWithTransactionClient({
        registration: { updateMany, findUnique },
        auditLog: { create: createAudit },
      })

      await repository.inTransaction((registrations) => {
        const mutationInput = {
          before,
          version: before.version,
          actorId: "organizer-1",
          at: "2026-10-03T00:00:00.000Z",
          adminOverride: false,
        }
        return operation === "rejectWithVersion"
          ? registrations.rejectWithVersion({
              ...mutationInput,
              note: input.note ?? "",
            })
          : registrations.withdrawWithVersion({
              ...mutationInput,
              reason: input.reason ?? "",
            })
      })

      expect(updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "registration-1",
            status: sourceStatus,
            version: before.version,
          },
          data: expect.objectContaining({
            status: nextStatus,
            version: { increment: 1 },
          }),
        }),
      )
      expect(createAudit).toHaveBeenCalledWith({
        data: expect.objectContaining({ action }),
      })
    },
  )

  it("aborts the registration decision when its audit write fails", async () => {
    let persistedStatus = "PENDING"
    const client = {
      $queryRaw: vi.fn(async () => [{ capacity: 2 }]),
      registration: {
        count: vi.fn(async () => 0),
        updateMany: vi.fn(async () => {
          persistedStatus = "APPROVED"
          return { count: 1 }
        }),
        findUnique: vi.fn(async () => registrationRow("APPROVED", 1)),
      },
      auditLog: {
        create: vi.fn(async () => {
          throw new Error("AUDIT_FAILED")
        }),
      },
    }
    const transaction = vi.fn(
      async (operation: (transactionClient: never) => Promise<unknown>) => {
        const before = persistedStatus
        try {
          return await operation(client as never)
        } catch (error) {
          persistedStatus = before
          throw error
        }
      },
    )
    const repository = new PrismaRegistrationRepository({
      $transaction: transaction,
    } as unknown as PrismaClient)

    await expect(
      repository.inTransaction((registrations) =>
        registrations.approveWithCapacity({
          before: pendingRegistration,
          version: 0,
          note: "",
          actorId: "organizer-1",
          at: "2026-10-02T00:00:00.000Z",
          adminOverride: false,
        }),
      ),
    ).rejects.toThrow("AUDIT_FAILED")

    expect(persistedStatus).toBe("PENDING")
  })
})
