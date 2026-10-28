/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ features/registrations/presentation/registration-handler.ts, features/registrations/domain/player-age-policy.ts โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { describe, expect, it, vi } from "vitest"

import {
  handleApplyToTournament,
  handleCancelRegistration,
} from "@/features/registrations/presentation/registration-handler"
import {
  PlayerAgeIneligibleError,
  TournamentAgeGroupUnsupportedError,
} from "@/features/registrations/domain/player-age-policy"
import { createTestActor } from "@/tests/fixtures/actor"

const teamManager = createTestActor("manager-1", "TEAM_MANAGER_COACH")

function request(method: string, body: unknown) {
  return new Request("http://localhost/api/registrations", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("registration route handlers", () => {
  it("explains a player conflict without exposing another team's details", async () => {
    const response = await handleApplyToTournament(
      "tournament-1",
      request("POST", { teamId: "team-1" }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        apply: vi.fn(async () => { throw new Error("PLAYER_ALREADY_COMPETING") }),
      },
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      message: "มีผู้เล่นในทีมกำลังสมัครหรือแข่งขันในรายการอื่น กรุณารอให้รายการนั้นจบ หรือยกเลิกใบสมัครก่อน",
    })
  })
  it("returns 409 when another team with the same name has applied", async () => {
    const response = await handleApplyToTournament(
      "tournament-1",
      request("POST", { teamId: "team-1" }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        apply: vi.fn(async () => { throw new Error("REGISTRATION_TEAM_NAME_TAKEN") }),
      },
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      message: "มีทีมชื่อนี้สมัครรายการแล้ว กรุณาเปลี่ยนชื่อทีมก่อนสมัคร",
    })
  })

  it("returns 401 when applying without an actor", async () => {
    const response = await handleApplyToTournament("tournament-1", request("POST", { teamId: "team-1" }), {
      actorProvider: { getCurrentActor: vi.fn(async () => null) },
      apply: vi.fn(),
    })

    expect(response.status).toBe(401)
  })

  it("returns 422 when cancellation has an invalid version", async () => {
    const response = await handleCancelRegistration("registration-1", request("DELETE", { version: -1 }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      cancel: vi.fn(),
    })

    expect(response.status).toBe(422)
  })

  it("maps duplicate active attempts to 409", async () => {
    const response = await handleApplyToTournament("tournament-1", request("POST", { teamId: "team-1" }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      apply: vi.fn(async () => { throw new Error("REGISTRATION_ALREADY_ACTIVE") }),
    })

    expect(response.status).toBe(409)
  })

  it("maps a full tournament application to 409", async () => {
    const response = await handleApplyToTournament(
      "tournament-1",
      request("POST", { teamId: "team-1" }),
      {
        actorProvider: {
          getCurrentActor: vi.fn(async () => teamManager),
        },
        apply: vi.fn(async () => {
          throw new Error("TOURNAMENT_CAPACITY_REACHED")
        }),
      },
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      message: "จำนวนทีมที่อนุมัติเต็มความจุการแข่งขันแล้ว",
    })
  })

  it("maps age-ineligible players to 422 without exposing birth dates", async () => {
    const response = await handleApplyToTournament(
      "tournament-1",
      request("POST", { teamId: "team-1" }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        apply: vi.fn(async () => {
          throw new PlayerAgeIneligibleError(["player-2"])
        }),
      },
    )

    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body).toEqual({
      message: "มีผู้เล่นอายุเกินเกณฑ์ของรุ่นการแข่งขัน",
      details: { playerIds: ["player-2"] },
    })
    expect(JSON.stringify(body)).not.toContain("birthDate")
  })

  it("maps an unknown persisted age group to a safe 422 response", async () => {
    const response = await handleApplyToTournament(
      "tournament-1",
      request("POST", { teamId: "team-1" }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        apply: vi.fn(async () => {
          throw new TournamentAgeGroupUnsupportedError()
        }),
      },
    )

    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body).toEqual({
      message: "รุ่นอายุของการแข่งขันไม่รองรับ กรุณาติดต่อผู้จัดการแข่งขัน",
    })
    expect(JSON.stringify(body)).not.toContain("birthDate")
    expect(JSON.stringify(body)).not.toContain("U20")
  })
})
