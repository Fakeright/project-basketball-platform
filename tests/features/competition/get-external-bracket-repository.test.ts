import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const { getPrismaClient } = vi.hoisted(() => {
  const client = { externalBracketRevision: {} }
  return {
    getPrismaClient: vi.fn(() => client),
  }
})

vi.mock("@/lib/server/prisma", () => ({ getPrismaClient }))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
  getPrismaClient.mockClear()
})

describe("getExternalBracketRepository", () => {
  it("uses Prisma when DATABASE_URL is configured", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://configured")
    vi.stubEnv("NODE_ENV", "development")
    const { getExternalBracketRepository } = await import(
      "@/features/competition/infrastructure/get-external-bracket-repository"
    )

    const repository = getExternalBracketRepository()

    expect(repository.constructor.name).toBe("PrismaExternalBracketRepository")
    expect(getPrismaClient).toHaveBeenCalledOnce()
  })

  it("uses development persistence only without DATABASE_URL outside production", async () => {
    vi.stubEnv("DATABASE_URL", "")
    vi.stubEnv("NODE_ENV", "development")
    const { getExternalBracketRepository } = await import(
      "@/features/competition/infrastructure/get-external-bracket-repository"
    )

    const repository = getExternalBracketRepository()

    expect(repository.constructor.name).toBe(
      "DevelopmentExternalBracketRepository",
    )
    expect(getPrismaClient).not.toHaveBeenCalled()
  })

  it("rejects a missing database in production", async () => {
    vi.stubEnv("DATABASE_URL", "")
    vi.stubEnv("NODE_ENV", "production")
    const { getExternalBracketRepository } = await import(
      "@/features/competition/infrastructure/get-external-bracket-repository"
    )

    expect(() => getExternalBracketRepository()).toThrow(
      "DATABASE_URL_NOT_CONFIGURED",
    )
  })
})
