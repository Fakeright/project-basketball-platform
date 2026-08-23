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
  it("returns 401 before parsing an unauthenticated request", async () => {
    const { repository, tournament } = await createRepository()

    const response = await handleTournamentGovernance(
      malformedRequest(),
      tournament.id,
      dependencies(null, repository),
    )

    expect(response.status).toBe(401)
  })

  it.each(["existing-tournament", "missing-tournament"])(
    "returns 403 before parsing or looking up an %s for a non-admin actor",
    async (resource) => {
    const { repository, tournament } = await createRepository()
    const findGovernanceContext = vi.spyOn(
      repository,
      "findGovernanceContext",
    )
    const tournamentId =
      resource === "existing-tournament" ? tournament.id : "missing-tournament"

    const response = await handleTournamentGovernance(
      malformedRequest(),
      tournamentId,
      dependencies(organizer, repository),
    )

    expect(response.status).toBe(403)
    expect(findGovernanceContext).not.toHaveBeenCalled()
    },
  )

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
      message: "สถานะรายการแข่งขันไม่รองรับคำสั่งนี้ กรุณาตรวจสอบสถานะล่าสุด",
      issues: ["GOVERNANCE_STATUS_INVALID", "TOURNAMENT_STATUS_INVALID"],
    })
  })

  it("returns 422 with an actionable message when permanent-delete confirmation does not match", async () => {
    const { repository, tournament } = await createRepository()

    const response = await handleTournamentGovernance(
      commandRequest({
        action: "PERMANENT_DELETE",
        version: tournament.version,
        confirmationTitle: "ชื่อรายการอื่น",
      }),
      tournament.id,
      dependencies(admin, repository),
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      message: "ชื่อยืนยันไม่ตรงกับชื่อรายการแข่งขัน",
      issues: ["CONFIRMATION_TITLE_MISMATCH"],
    })
  })

  it("returns 422 with dependency issues when permanent delete is not safe", async () => {
    const { repository, tournament } = await createRepository()
    const context = await repository.findGovernanceContext(tournament.id)
    if (!context) throw new Error("test tournament governance context missing")
    vi.spyOn(repository, "findGovernanceContext").mockResolvedValueOnce({
      ...context,
      registrationCount: 1,
      mediaAssetCount: 1,
    })
    const permanentlyDelete = vi.spyOn(
      repository,
      "permanentlyDeleteWithVersion",
    )

    const response = await handleTournamentGovernance(
      commandRequest({
        action: "PERMANENT_DELETE",
        version: tournament.version,
        confirmationTitle: tournament.title,
      }),
      tournament.id,
      dependencies(admin, repository),
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      message:
        "รายการแข่งขันยังมีข้อมูลสัมพันธ์ กรุณานำข้อมูลออกก่อนลบถาวร",
      issues: [
        "TOURNAMENT_HAS_REGISTRATIONS",
        "TOURNAMENT_HAS_MEDIA_ASSETS",
      ],
    })
    expect(permanentlyDelete).not.toHaveBeenCalled()
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

function malformedRequest() {
  return new Request(
    "http://localhost/api/admin/tournaments/tournament-1/governance",
    { method: "POST", body: "{" },
  )
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
