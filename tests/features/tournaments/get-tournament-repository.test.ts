import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const { getPrismaClient } = vi.hoisted(() => {
  const client = { tournament: {} }
  return {
    prismaClient: client,
    getPrismaClient: vi.fn(() => client),
  }
})

vi.mock("@/lib/server/prisma", () => ({
  getPrismaClient,
}))

vi.mock(
  "@/features/tournament-media/infrastructure/supabase-object-storage",
  () => ({
    SupabaseObjectStorage: class SupabaseObjectStorage {},
  }),
)

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
  getPrismaClient.mockClear()
})

describe("getTournamentRepository", () => {
  it("uses Prisma whenever DATABASE_URL is configured", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://configured")
    vi.stubEnv("NODE_ENV", "development")
    const { getTournamentRepository } = await import(
      "@/features/tournaments/infrastructure/get-tournament-repository"
    )

    const repository = getTournamentRepository()

    expect(repository.constructor.name).toBe("PrismaTournamentRepository")
    expect(getPrismaClient).toHaveBeenCalledOnce()
  })

  it("uses explicit mock data only for local development without DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "")
    vi.stubEnv("NODE_ENV", "development")
    const { getTournamentRepository } = await import(
      "@/features/tournaments/infrastructure/get-tournament-repository"
    )

    const repository = getTournamentRepository()

    expect(repository.constructor.name).toBe("MockTournamentRepository")
    expect(getPrismaClient).not.toHaveBeenCalled()
  })

  it("rejects missing database configuration in production", async () => {
    vi.stubEnv("DATABASE_URL", "")
    vi.stubEnv("NODE_ENV", "production")
    const { getTournamentRepository } = await import(
      "@/features/tournaments/infrastructure/get-tournament-repository"
    )

    expect(() => getTournamentRepository()).toThrow(
      "DATABASE_URL_NOT_CONFIGURED",
    )
  })
})
