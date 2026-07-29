import { describe, expect, it, vi } from "vitest"

import { handleReviewRequest } from "@/features/admin/presentation/review-tournament-handler"
import type { CurrentActorProvider } from "@/features/identity/domain/actor"
import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const admin = createTestActor("admin-1", "PLATFORM_ADMIN")

const validTournament = {
  title: "Review Cup",
  description: "description",
  rules: "rules",
  provinceCode: "10",
  venue: "Arena",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  startsAt: "2026-11-15T09:00:00+07:00",
  endsAt: "2026-11-16T18:00:00+07:00",
  registrationDeadline: "2026-11-01T23:59:00+07:00",
  capacity: 8,
  organizerId: "organizer-1",
}

function actorProvider(
  actor: Awaited<ReturnType<CurrentActorProvider["getCurrentActor"]>>,
): CurrentActorProvider {
  return { getCurrentActor: async () => actor }
}

async function submittedRepository() {
  const repository = new InMemoryTournamentOperationsRepository()
  const tournament = await repository.create(validTournament)
  await repository.updateWithVersion(tournament.id, 0, {
    status: "SUBMITTED",
  })
  return { repository, tournamentId: tournament.id }
}

describe("POST tournament review", () => {
  it("returns 403 when an organizer reviews a tournament", async () => {
    const { repository, tournamentId } = await submittedRepository()
    const request = new Request("http://localhost/api/review", {
      method: "POST",
      body: JSON.stringify({
        decision: "APPROVED",
        note: "",
        version: 1,
      }),
    })

    const response = await handleReviewRequest(request, tournamentId, {
      actorProvider: actorProvider(organizer),
      repository,
    })

    expect(response.status).toBe(403)
  })

  it("returns 422 when a rejection has no reason", async () => {
    const { repository, tournamentId } = await submittedRepository()
    const request = new Request("http://localhost/api/review", {
      method: "POST",
      body: JSON.stringify({
        decision: "REJECTED",
        note: "",
        version: 1,
      }),
    })

    const response = await handleReviewRequest(request, tournamentId, {
      actorProvider: actorProvider(admin),
      repository,
    })

    expect(response.status).toBe(422)
  })

  it("returns a safe correlated 500 for an unexpected repository failure", async () => {
    const { repository, tournamentId } = await submittedRepository()
    vi.spyOn(repository, "findById").mockRejectedValueOnce(
      new Error("private database detail"),
    )
    const logger = { error: vi.fn() }
    const request = new Request("http://localhost/api/review", {
      method: "POST",
      body: JSON.stringify({
        decision: "APPROVED",
        note: "",
        version: 1,
      }),
    })

    const response = await handleReviewRequest(request, tournamentId, {
      actorProvider: actorProvider(admin),
      repository,
      createCorrelationId: () => "review-correlation",
      logger,
    })

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      message: "ไม่สามารถดำเนินการได้ในขณะนี้",
      correlationId: "review-correlation",
    })
    expect(logger.error).toHaveBeenCalledWith({
      operation: "tournament.review",
      correlationId: "review-correlation",
      errorType: "Error",
    })
  })
})
