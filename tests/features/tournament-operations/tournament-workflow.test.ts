import { describe, expect, it } from "vitest"

import { createTournament, submitTournament } from "@/features/tournament-operations/application/create-tournament"
import { reviewTournament } from "@/features/tournament-operations/application/review-tournament"
import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"
import type { Actor } from "@/features/identity/domain/actor"

const organizer: Actor = { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" }
const admin: Actor = { id: "admin-1", role: "PLATFORM_ADMIN" }

const validInput = {
  title: "Bangkok Admin Cup",
  description: "รายการแข่งขันสำหรับการทดสอบ",
  rules: "กติกามาตรฐาน",
  province: "Bangkok",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  startsAt: "2026-11-15T09:00:00+07:00",
  endsAt: "2026-11-16T18:00:00+07:00",
  registrationDeadline: "2026-11-01T23:59:00+07:00",
  capacity: 16,
}

describe("tournament workflow", () => {
  it("creates a draft owned by the organizer", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, validInput, organizer)

    expect(tournament).toMatchObject({ status: "DRAFT", organizerId: organizer.id, version: 0 })
  })

  it("submits a complete draft for review", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, validInput, organizer)

    const submitted = await submitTournament(repository, tournament.id, organizer)

    expect(submitted.status).toBe("SUBMITTED")
  })

  it("requires a note when an admin requests changes", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, validInput, organizer)

    await expect(
      reviewTournament(repository, tournament.id, { decision: "CHANGES_REQUESTED", note: "", version: tournament.version }, admin),
    ).rejects.toThrow("REVIEW_NOTE_REQUIRED")
  })
})
