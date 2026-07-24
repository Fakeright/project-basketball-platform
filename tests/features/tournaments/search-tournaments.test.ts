import { searchTournaments } from "@/features/tournaments/application/search-tournaments"
import { MockTournamentRepository } from "@/features/tournaments/infrastructure/mock-tournament-repository"
import { expect, test } from "vitest"

const repository = new MockTournamentRepository()

test("returns tournaments in a selected province", async () => {
  await expect(searchTournaments(repository, { province: "Bangkok" })).resolves.toHaveLength(1)
})

test("returns tournaments in a selected format", async () => {
  await expect(searchTournaments(repository, { format: "THREE_V_THREE" })).resolves.toEqual([
    expect.objectContaining({ slug: "north-court-3x3" }),
  ])
})

test("searches tournament text case-insensitively", async () => {
  await expect(searchTournaments(repository, { query: "open" })).resolves.toEqual([
    expect.objectContaining({ slug: "bangkok-open-2026" }),
  ])
})
