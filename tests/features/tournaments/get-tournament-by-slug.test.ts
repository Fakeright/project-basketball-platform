import { getTournamentBySlug } from "@/features/tournaments/application/get-tournament-by-slug"
import { MockTournamentRepository } from "@/features/tournaments/infrastructure/mock-tournament-repository"
import { expect, test } from "vitest"

const repository = new MockTournamentRepository()

test("returns a tournament by its slug", async () => {
  await expect(getTournamentBySlug(repository, "bangkok-open-2026")).resolves.toMatchObject({
    title: "Bangkok Open 2026",
  })
})

test("returns null when a tournament slug is missing", async () => {
  await expect(getTournamentBySlug(repository, "missing")).resolves.toBeNull()
})
