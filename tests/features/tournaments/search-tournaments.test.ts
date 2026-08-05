import { searchTournaments } from "@/features/tournaments/application/search-tournaments"
import { MockTournamentRepository } from "@/features/tournaments/infrastructure/mock-tournament-repository"
import { expect, test } from "vitest"

const repository = new MockTournamentRepository()

test("returns tournaments in a selected province", async () => {
  await expect(searchTournaments(repository, { provinceCode: "10" })).resolves.toHaveLength(1)
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

test("matches Thai text queries with Thai-locale normalization", async () => {
  await expect(repository.list({ query: "เยาวชนภาคเหนือ" })).resolves.toEqual([
    expect.objectContaining({ slug: "north-court-3x3" }),
  ])
})

test("filters tournaments by age group", async () => {
  await expect(repository.list({ ageGroup: "U16" })).resolves.toEqual([
    expect.objectContaining({ slug: "chonburi-coast-cup" }),
  ])
})

test("does not partially match an age group", async () => {
  await expect(repository.list({ ageGroup: "U1" })).resolves.toEqual([])
})

test("filters tournaments by venue", async () => {
  await expect(repository.list({ venue: "นิมมาน" })).resolves.toEqual([
    expect.objectContaining({ slug: "north-court-3x3" }),
  ])
})

test("filters tournaments by start date", async () => {
  await expect(repository.list({ date: "2026-07-24" })).resolves.toEqual([
    expect.objectContaining({ slug: "chonburi-coast-cup" }),
  ])
})

test("filters tournaments by status", async () => {
  await expect(repository.list({ status: "ONGOING" })).resolves.toEqual([
    expect.objectContaining({ slug: "chonburi-coast-cup" }),
  ])
})

test("combines populated filters with AND semantics", async () => {
  await expect(
    repository.list({
      provinceCode: "20",
      format: "FIVE_V_FIVE",
      ageGroup: "U16",
      venue: "สนามกีฬาชลบุรี",
      date: "2026-07-24",
      status: "ONGOING",
    }),
  ).resolves.toEqual([expect.objectContaining({ slug: "chonburi-coast-cup" })])
})

test("returns matching tournaments newest first", async () => {
  await expect(repository.list({ provinceCode: "50" })).resolves.toEqual([
    expect.objectContaining({ slug: "north-court-3x3" }),
    expect.objectContaining({ slug: "chiang-mai-hoops-classic" }),
    expect.objectContaining({ slug: "lanna-community-cup" }),
  ])
})
