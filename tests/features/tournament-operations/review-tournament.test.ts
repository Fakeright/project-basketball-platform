import { describe, expect, it, vi } from "vitest"

import { createTournament } from "@/features/tournament-operations/application/create-tournament"
import { reviewTournament } from "@/features/tournament-operations/application/review-tournament"
import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const admin = createTestActor("admin-1", "PLATFORM_ADMIN")
const input = {
  title: "Review Cup", description: "description", rules: "rules", provinceCode: "10", venue: "Arena",
  format: "FIVE_V_FIVE" as const, ageGroup: "Open", startsAt: "2026-11-15T09:00:00+07:00",
  endsAt: "2026-11-16T18:00:00+07:00", registrationDeadline: "2026-11-01T23:59:00+07:00", capacity: 8,
}

describe("reviewTournament", () => {
  it("approves a submitted tournament", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, input, organizer)
    await repository.updateWithVersion(tournament.id, 0, { status: "SUBMITTED" })
    const reviewWithVersion = vi.spyOn(repository, "reviewWithVersion")

    const approved = await reviewTournament(repository, tournament.id, { decision: "APPROVED", note: "ผ่าน", version: 1 }, admin)

    expect(approved.status).toBe("APPROVED")
    expect(reviewWithVersion).toHaveBeenCalledOnce()
    expect(reviewWithVersion).toHaveBeenCalledWith(
      expect.objectContaining({ sourceStatus: "SUBMITTED" }),
    )
    expect(repository.audits.at(-1)?.action).toBe("tournament.reviewed")
  })

  it("rejects a future client version before transitioning", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, input, organizer)
    await repository.updateWithVersion(tournament.id, 0, { status: "SUBMITTED" })
    const reviewWithVersion = vi.spyOn(repository, "reviewWithVersion")

    await expect(
      reviewTournament(repository, tournament.id, { decision: "APPROVED", note: "ผ่าน", version: 2 }, admin),
    ).rejects.toThrow("CONFLICT")
    expect(reviewWithVersion).not.toHaveBeenCalled()
  })

  it("rejects a stale review version", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, input, organizer)
    await repository.updateWithVersion(tournament.id, 0, { status: "SUBMITTED" })

    await expect(
      reviewTournament(repository, tournament.id, { decision: "APPROVED", note: "ผ่าน", version: 0 }, admin),
    ).rejects.toThrow("CONFLICT")
  })

  it("blocks reviewing a suspended tournament before persistence", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, input, organizer)
    await repository.updateWithVersion(tournament.id, 0, {
      status: "SUBMITTED",
      governanceStatus: "SUSPENDED",
    })
    const reviewWithVersion = vi.spyOn(repository, "reviewWithVersion")

    await expect(
      reviewTournament(
        repository,
        tournament.id,
        { decision: "APPROVED", note: "ผ่าน", version: 1 },
        admin,
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(reviewWithVersion).not.toHaveBeenCalled()
  })
})
