import { describe, expect, it, vi } from "vitest"

import { TournamentCompetitionPolicyError } from "@/features/competition/domain/tournament-competition-policy"
import { handleTournamentCompetitionLifecycle } from "@/features/tournament-operations/presentation/tournament-competition-lifecycle-handler"
import { TournamentGovernancePolicyError } from "@/features/tournament-operations/domain/tournament-governance-policy"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")

function request(body: unknown) {
  return new Request("http://localhost/api/organizer/tournaments/tournament-1/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

function dependencies(overrides: Record<string, unknown> = {}) {
  return {
    actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
    transition: vi.fn(async () => ({
      id: "tournament-1",
      status: "IN_PROGRESS",
      version: 5,
    })),
    ...overrides,
  }
}

describe("tournament competition lifecycle routes", () => {
  it("returns 401 without a current actor", async () => {
    const transition = vi.fn()
    const response = await handleTournamentCompetitionLifecycle(
      request({ version: 4 }),
      "tournament-1",
      "START",
      dependencies({
        actorProvider: { getCurrentActor: vi.fn(async () => null) },
        transition,
      }),
    )

    expect(response.status).toBe(401)
    expect(transition).not.toHaveBeenCalled()
  })

  it("returns 422 for malformed command data", async () => {
    const transition = vi.fn()
    const response = await handleTournamentCompetitionLifecycle(
      request({ version: -1, reason: "" }),
      "tournament-1",
      "START",
      dependencies({ transition }),
    )

    expect(response.status).toBe(422)
    expect(transition).not.toHaveBeenCalled()
  })

  it("returns structured readiness issues", async () => {
    const response = await handleTournamentCompetitionLifecycle(
      request({ version: 4 }),
      "tournament-1",
      "START",
      dependencies({
        transition: vi.fn(async () => {
          throw new TournamentCompetitionPolicyError([
            "BRACKET_NOT_PUBLISHED",
            "CHAMPIONSHIP_MISSING",
          ])
        }),
      }),
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      message: "ยังไม่สามารถเริ่มการแข่งขันได้",
      issues: ["BRACKET_NOT_PUBLISHED", "CHAMPIONSHIP_MISSING"],
    })
  })

  it("maps blocked governance to a typed Thai 409 response", async () => {
    const response = await handleTournamentCompetitionLifecycle(
      request({ version: 4 }),
      "tournament-1",
      "START",
      dependencies({
        transition: vi.fn(async () => {
          throw new TournamentGovernancePolicyError(["TOURNAMENT_SUSPENDED"])
        }),
      }),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      message: "รายการแข่งขันถูกระงับหรือถูกนำออก กรุณาตรวจสอบสถานะล่าสุด",
      issues: ["TOURNAMENT_SUSPENDED"],
    })
  })

  it("maps an illegal source state and stale version to conflict", async () => {
    const statusResponse = await handleTournamentCompetitionLifecycle(
      request({ version: 4 }),
      "tournament-1",
      "START",
      dependencies({
        transition: vi.fn(async () => {
          throw new TournamentCompetitionPolicyError([
            "TOURNAMENT_STATUS_INVALID",
          ])
        }),
      }),
    )
    const versionResponse = await handleTournamentCompetitionLifecycle(
      request({ version: 4 }),
      "tournament-1",
      "START",
      dependencies({
        transition: vi.fn(async () => {
          throw new Error("CONFLICT")
        }),
      }),
    )

    expect(statusResponse.status).toBe(409)
    expect(versionResponse.status).toBe(409)
  })

  it.each([
    ["NOT_FOUND", 404],
    ["FORBIDDEN", 403],
    ["REASON_REQUIRED", 422],
  ])("maps %s to %i", async (code, status) => {
    const response = await handleTournamentCompetitionLifecycle(
      request({ version: 4 }),
      "tournament-1",
      "COMPLETE",
      dependencies({
        transition: vi.fn(async () => {
          throw new Error(code)
        }),
      }),
    )

    expect(response.status).toBe(status)
  })

  it("passes validated data to the selected transition", async () => {
    const transition = vi.fn(async () => ({
      id: "tournament-1",
      status: "COMPLETED",
      version: 6,
    }))
    const response = await handleTournamentCompetitionLifecycle(
      request({ version: 5, reason: "  ยืนยันแทนผู้จัด  " }),
      "tournament-1",
      "COMPLETE",
      dependencies({ transition }),
    )

    expect(response.status).toBe(200)
    expect(transition).toHaveBeenCalledWith(
      {
        tournamentId: "tournament-1",
        version: 5,
        reason: "ยืนยันแทนผู้จัด",
      },
      organizer,
    )
  })
})
