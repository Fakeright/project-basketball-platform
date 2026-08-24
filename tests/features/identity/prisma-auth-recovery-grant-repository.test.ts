import { describe, expect, it, vi } from "vitest"

import { PrismaAuthRecoveryGrantRepository } from "@/features/identity/infrastructure/prisma-auth-recovery-grant-repository"

describe("Prisma Auth recovery grant repository", () => {
  it("stores only the nonce hash and lifecycle fields", async () => {
    const create = vi.fn(async () => ({ id: "grant-1" }))
    const repository = new PrismaAuthRecoveryGrantRepository({
      authRecoveryGrant: {
        create,
        updateMany: vi.fn(),
      },
    })
    const input = {
      nonceHash: "sha256-nonce-hash",
      userId: "user-1",
      expiresAt: new Date("2026-07-29T12:10:00.000Z"),
    }

    await repository.create(input)

    expect(create).toHaveBeenCalledWith({ data: input })
  })

  it("atomically consumes only a matching unexpired and unconsumed grant", async () => {
    const updateMany = vi
      .fn()
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 })
    const repository = new PrismaAuthRecoveryGrantRepository({
      authRecoveryGrant: {
        create: vi.fn(),
        updateMany,
      },
    })
    const now = new Date("2026-07-29T12:05:00.000Z")
    const input = {
      nonceHash: "sha256-nonce-hash",
      userId: "user-1",
      now,
    }

    const results = await Promise.all([
      repository.consume(input),
      repository.consume(input),
    ])

    expect(results.filter(Boolean)).toHaveLength(1)
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        nonceHash: "sha256-nonce-hash",
        userId: "user-1",
        consumedAt: null,
        expiresAt: { gte: now },
      },
      data: { consumedAt: now },
    })
  })
})
