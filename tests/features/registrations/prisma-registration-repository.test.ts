import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaRegistrationRepository } from "@/features/registrations/infrastructure/prisma-registration-repository"

function serializationConflict() {
  return Object.assign(new Error("write conflict"), { code: "P2034" })
}

describe("PrismaRegistrationRepository transactions", () => {
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
})
