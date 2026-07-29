import { describe, expect, it, vi } from "vitest"

import { handleTournamentLifecycleRequest } from "@/features/admin/presentation/tournament-lifecycle-handler"
import type { CurrentActorProvider } from "@/features/identity/domain/actor"
import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const anotherOrganizer = createTestActor(
  "organizer-2",
  "TOURNAMENT_ORGANIZER",
)

const validTournament = {
  title: "Lifecycle Cup",
  description: "การแข่งขันระดับชุมชน",
  provinceCode: "10",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  startsAt: "2026-12-10T02:00:00.000Z",
  endsAt: "2026-12-11T11:00:00.000Z",
  registrationDeadline: "2026-12-01T16:59:00.000Z",
  capacity: 16,
  rules: "ใช้กติกามาตรฐาน",
  organizerId: "organizer-1",
}

function actorProvider(
  actor: Awaited<ReturnType<CurrentActorProvider["getCurrentActor"]>>,
): CurrentActorProvider {
  return { getCurrentActor: async () => actor }
}

async function approvedRepository() {
  const repository = new InMemoryTournamentOperationsRepository()
  const draft = await repository.create(validTournament)
  const submitted = await repository.updateWithVersion(draft.id, draft.version, {
    status: "SUBMITTED",
  })
  const approved = await repository.reviewWithVersion({
    tournamentId: submitted.id,
    version: submitted.version,
    sourceStatus: "SUBMITTED",
    status: "APPROVED",
    reviewerId: "admin-1",
    decision: "APPROVED",
    note: "",
  })
  return { repository, approved }
}

describe("tournament lifecycle handler", () => {
  it("publishes an approved tournament owned by the organizer", async () => {
    const { repository, approved } = await approvedRepository()

    const response = await handleTournamentLifecycleRequest(
      new Request("http://localhost/api/publish", {
        method: "POST",
        body: JSON.stringify({ version: approved.version }),
      }),
      approved.id,
      "PUBLISH",
      {
        actorProvider: actorProvider(organizer),
        repository,
        now: () => new Date("2026-11-01T00:00:00.000Z"),
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      tournament: { status: "PUBLISHED" },
    })
    expect(repository.audits.at(-1)?.action).toBe("tournament.published")
  })

  it("hides another organizer's tournament", async () => {
    const { repository, approved } = await approvedRepository()

    const response = await handleTournamentLifecycleRequest(
      new Request("http://localhost/api/publish", {
        method: "POST",
        body: JSON.stringify({ version: approved.version }),
      }),
      approved.id,
      "PUBLISH",
      {
        actorProvider: actorProvider(anotherOrganizer),
        repository,
        now: () => new Date("2026-11-01T00:00:00.000Z"),
      },
    )

    expect(response.status).toBe(404)
  })

  it("returns a recoverable conflict for a stale version", async () => {
    const { repository, approved } = await approvedRepository()

    const response = await handleTournamentLifecycleRequest(
      new Request("http://localhost/api/publish", {
        method: "POST",
        body: JSON.stringify({ version: approved.version - 1 }),
      }),
      approved.id,
      "PUBLISH",
      {
        actorProvider: actorProvider(organizer),
        repository,
        now: () => new Date("2026-11-01T00:00:00.000Z"),
      },
    )

    expect(response.status).toBe(409)
  })

  it("returns a safe correlated 500 for an unexpected repository failure", async () => {
    const { repository, approved } = await approvedRepository()
    vi.spyOn(repository, "findById").mockRejectedValueOnce(
      new Error("private lifecycle detail"),
    )
    const logger = { error: vi.fn() }

    const response = await handleTournamentLifecycleRequest(
      new Request("http://localhost/api/publish", {
        method: "POST",
        body: JSON.stringify({ version: approved.version }),
      }),
      approved.id,
      "PUBLISH",
      {
        actorProvider: actorProvider(organizer),
        repository,
        now: () => new Date("2026-11-01T00:00:00.000Z"),
        createCorrelationId: () => "lifecycle-correlation",
        logger,
      },
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      correlationId: "lifecycle-correlation",
    })
    expect(logger.error).toHaveBeenCalledWith({
      operation: "tournament.lifecycle",
      correlationId: "lifecycle-correlation",
      errorType: "Error",
    })
  })
})
