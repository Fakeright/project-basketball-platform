import { describe, expect, it, vi } from "vitest"

import { handleTournamentGovernance } from "@/features/tournament-operations/presentation/tournament-governance-handler"
import type { CurrentActorProvider } from "@/features/identity/domain/actor"
import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const admin = createTestActor("admin-1", "PLATFORM_ADMIN")
const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const now = () => new Date("2026-08-22T10:00:00.000Z")

const tournamentInput = {
  title: "Governance Cup",
  description: "การแข่งขันบาสเกตบอล",
  rules: "กติกามาตรฐาน",
  provinceCode: "10",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  startsAt: "2026-11-15T02:00:00.000Z",
  endsAt: "2026-11-16T11:00:00.000Z",
  registrationDeadline: "2026-11-01T16:59:00.000Z",
  capacity: 16,
  organizerId: organizer.id,
}

describe("POST tournament governance", () => {
  it("returns 401 for an unauthenticated request", async () => {
    const { repository, tournament } = await createRepository()

    const response = await handleTournamentGovernance(
      commandRequest({ action: "SUSPEND", version: tournament.version }),
      tournament.id,
      dependencies(null, repository),
    )

    expect(response.status).toBe(401)
  })

  it("returns 403 for a non-admin actor", async () => {
    const { repository, tournament } = await createRepository()

    const response = await handleTournamentGovernance(
      commandRequest({ action: "SUSPEND", version: tournament.version }),
      tournament.id,
      dependencies(organizer, repository),
    )

    expect(response.status).toBe(403)
  })

  it.each([
    { action: "SUSPEND", version: 0, reason: "" },
    { action: "SUSPEND", version: 0, reason: " ", extra: true },
    { action: "SUSPEND", version: 0, reason: "x".repeat(501) },
    { action: "PERMANENT_DELETE", version: 0, reason: "ลบ" },
  ])("returns 422 for malformed governance input", async (body) => {
    const { repository, tournament } = await createRepository()

    const response = await handleTournamentGovernance(
      commandRequest(body),
      tournament.id,
      dependencies(admin, repository),
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ issues: expect.any(Array) }),
    )
  })

  it("returns 404 for a tournament that does not exist", async () => {
    const { repository } = await createRepository()

    const response = await handleTournamentGovernance(
      commandRequest({ action: "SUSPEND", version: 0 }),
      "missing-tournament",
      dependencies(admin, repository),
    )

    expect(response.status).toBe(404)
  })

  it("returns 409 for a stale command", async () => {
    const { repository, tournament } = await createRepository()
    const current = await repository.updateWithVersion(
      tournament.id,
      tournament.version,
      { title: "Governance Cup updated" },
    )

    const response = await handleTournamentGovernance(
      commandRequest({ action: "SUSPEND", version: tournament.version }),
      tournament.id,
      dependencies(admin, repository),
    )

    expect(response.status).toBe(409)
    expect(current.version).toBe(tournament.version + 1)
  })

  it("returns a typed policy conflict for an invalid governance state", async () => {
    const { repository, tournament } = await createRepository({
      governanceStatus: "SUSPENDED",
    })

    const response = await handleTournamentGovernance(
      commandRequest({ action: "ARCHIVE", version: tournament.version }),
      tournament.id,
      dependencies(admin, repository),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      message: "รายการแข่งขันถูกระงับหรือถูกนำออก กรุณาตรวจสอบสถานะล่าสุด",
      issues: ["GOVERNANCE_STATUS_INVALID", "TOURNAMENT_STATUS_INVALID"],
    })
  })

  it("returns 200 with the transitioned tournament", async () => {
    const { repository, tournament } = await createRepository()

    const response = await handleTournamentGovernance(
      commandRequest({ action: "SUSPEND", version: tournament.version }),
      tournament.id,
      dependencies(admin, repository),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      tournament: expect.objectContaining({ governanceStatus: "SUSPENDED" }),
    })
  })

  it("returns 204 with no response body for a permanent delete", async () => {
    const { repository, tournament } = await createRepository()

    const response = await handleTournamentGovernance(
      commandRequest({
        action: "PERMANENT_DELETE",
        version: tournament.version,
        confirmationTitle: " Governance Cup ",
      }),
      tournament.id,
      dependencies(admin, repository),
    )

    expect(response.status).toBe(204)
    await expect(response.text()).resolves.toBe("")
  })

  it("does not include the governance reason in unexpected failure diagnostics", async () => {
    const { repository, tournament } = await createRepository()
    const logger = { error: vi.fn() }
    vi.spyOn(repository, "findGovernanceContext").mockRejectedValueOnce(
      new Error("private database detail"),
    )

    const response = await handleTournamentGovernance(
      commandRequest({
        action: "SUSPEND",
        version: tournament.version,
        reason: "private governance reason",
      }),
      tournament.id,
      { ...dependencies(admin, repository), logger, createCorrelationId: () => "governance-correlation" },
    )

    expect(response.status).toBe(500)
    expect(logger.error).toHaveBeenCalledWith({
      operation: "tournament.governance",
      correlationId: "governance-correlation",
      errorType: "Error",
    })
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(
      "private governance reason",
    )
  })
})

function commandRequest(
  body: Record<string, unknown>,
) {
  return new Request("http://localhost/api/admin/tournaments/tournament-1/governance", {
    method: "POST",
    body: JSON.stringify({ reason: "ตรวจสอบข้อมูลผู้จัด", ...body }),
  })
}

function dependencies(
  actor: Awaited<ReturnType<CurrentActorProvider["getCurrentActor"]>>,
  repository: InMemoryTournamentOperationsRepository,
) {
  return {
    actorProvider: { getCurrentActor: async () => actor },
    repository,
    now,
  }
}

async function createRepository(
  overrides: { governanceStatus?: "ACTIVE" | "SUSPENDED" } = {},
) {
  const repository = new InMemoryTournamentOperationsRepository()
  let tournament = await repository.create(tournamentInput)
  if (overrides.governanceStatus) {
    tournament = await repository.updateWithVersion(tournament.id, tournament.version, {
      governanceStatus: overrides.governanceStatus,
    })
  }
  return { repository, tournament }
}
