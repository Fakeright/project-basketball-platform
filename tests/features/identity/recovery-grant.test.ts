import { describe, expect, it, vi } from "vitest"

import { HmacRecoveryGrantService } from "@/features/identity/infrastructure/hmac-recovery-grant-service"

function createCookieStore() {
  const values = new Map<string, string>()
  return {
    values,
    get: vi.fn((name: string) => {
      const value = values.get(name)
      return value ? { name, value } : undefined
    }),
    set: vi.fn(
      (
        name: string,
        value: string,
        options: {
          httpOnly?: boolean
          sameSite?: "lax" | "strict" | "none"
          secure?: boolean
          path?: string
          maxAge?: number
        },
      ) => {
        if (options.maxAge === 0) values.delete(name)
        else values.set(name, value)
      },
    ),
  }
}

function createService(
  store: ReturnType<typeof createCookieStore>,
  now: () => number,
  repository = createGrantRepository(),
) {
  return new HmacRecoveryGrantService({
    secret: "test-recovery-secret-that-is-at-least-32-bytes",
    cookieStore: store,
    now,
    secure: false,
    repository,
  })
}

function createGrantRepository() {
  const grants = new Map<
    string,
    { userId: string; expiresAt: Date; consumed: boolean }
  >()
  return {
    grants,
    create: vi.fn(
      async (input: {
        nonceHash: string
        userId: string
        expiresAt: Date
      }) => {
        grants.set(input.nonceHash, {
          userId: input.userId,
          expiresAt: input.expiresAt,
          consumed: false,
        })
      },
    ),
    consume: vi.fn(
      async (input: {
        nonceHash: string
        userId: string
        now: Date
      }) => {
        const grant = grants.get(input.nonceHash)
        if (
          !grant ||
          grant.consumed ||
          grant.userId !== input.userId ||
          grant.expiresAt < input.now
        ) {
          return false
        }
        grant.consumed = true
        return true
      },
    ),
  }
}

describe("HMAC recovery grant", () => {
  it("issues a signed transaction state bound to a normalized email hash", async () => {
    const store = createCookieStore()
    const service = createService(store, () => 1_000_000)

    const state = await service.issueTransactionState(
      " Manager@Example.COM ",
    )
    const transaction =
      await service.verifyTransactionState(state)

    expect(state).not.toContain("manager@example.com")
    expect(transaction).not.toBeNull()
    expect(
      service.matchesTransactionEmail(
        transaction!,
        "manager@example.com",
      ),
    ).toBe(true)
    expect(
      service.matchesTransactionEmail(
        transaction!,
        "other@example.com",
      ),
    ).toBe(false)
  })

  it("rejects forged and expired transaction states", async () => {
    const store = createCookieStore()
    let now = 1_000_000
    const service = createService(store, () => now)
    const state = await service.issueTransactionState(
      "manager@example.com",
    )

    await expect(
      service.verifyTransactionState(`${state.slice(0, -1)}x`),
    ).resolves.toBeNull()
    now += 601_000
    await expect(
      service.verifyTransactionState(state),
    ).resolves.toBeNull()
  })

  it("issues an HttpOnly short-lived grant and consumes it once", async () => {
    const store = createCookieStore()
    const repository = createGrantRepository()
    const service = createService(
      store,
      () => 1_000_000,
      repository,
    )

    await service.issue("auth-user-1")

    expect(store.set).toHaveBeenCalledWith(
      "courtside-recovery",
      expect.not.stringContaining("auth-user-1"),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/api/auth/reset-password",
        maxAge: 600,
      }),
    )
    expect(repository.create).toHaveBeenCalledWith({
      nonceHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      userId: "auth-user-1",
      expiresAt: new Date(1_600_000),
    })
    await expect(service.consume("auth-user-1")).resolves.toBe(true)
    await expect(service.consume("auth-user-1")).resolves.toBe(false)
  })

  it("allows exactly one concurrent consume across separate cookie copies", async () => {
    const repository = createGrantRepository()
    const firstStore = createCookieStore()
    const issuer = createService(
      firstStore,
      () => 1_000_000,
      repository,
    )
    await issuer.issue("user-1")
    const token = firstStore.values.get("courtside-recovery")!
    const secondStore = createCookieStore()
    secondStore.values.set("courtside-recovery", token)

    const results = await Promise.all([
      createService(
        firstStore,
        () => 1_000_001,
        repository,
      ).consume("user-1"),
      createService(
        secondStore,
        () => 1_000_001,
        repository,
      ).consume("user-1"),
    ])

    expect(results.filter(Boolean)).toHaveLength(1)
  })

  it("rejects an expired or differently-bound grant and clears it", async () => {
    const store = createCookieStore()
    let now = 1_000_000
    const service = createService(store, () => now)
    await service.issue("auth-user-1")

    await expect(service.consume("auth-user-2")).resolves.toBe(false)
    await service.issue("auth-user-1")
    now += 601_000

    await expect(service.consume("auth-user-1")).resolves.toBe(false)
    expect(store.values.has("courtside-recovery")).toBe(false)
  })

  it("rejects a tampered signature without exposing or throwing token details", async () => {
    const store = createCookieStore()
    const service = createService(store, () => 1_000_000)
    await service.issue("auth-user-1")
    const token = store.values.get("courtside-recovery")!
    store.values.set("courtside-recovery", `${token.slice(0, -1)}x`)

    await expect(service.consume("auth-user-1")).resolves.toBe(false)
  })
})
