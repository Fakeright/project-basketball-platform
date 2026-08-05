import { describe, expect, it, vi } from "vitest"

import { saveTournamentHandler } from "@/features/admin/presentation/save-tournament-handler"
import { submitTournamentHandler } from "@/features/admin/presentation/submit-tournament-handler"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"
import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")

const validTournament = {
  title: "Chiang Rai Cup",
  description: "การแข่งขันระดับชุมชน",
  provinceCode: "57",
  venue: "สนามกีฬากลาง",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  startsAt: "2026-12-10T09:00:00+07:00",
  endsAt: "2026-12-11T18:00:00+07:00",
  registrationDeadline: "2026-12-01T23:59:00+07:00",
  capacity: 16,
  rules: "ใช้กติกามาตรฐาน",
}

describe("submitTournamentHandler", () => {
  it("submits an owned organizer draft", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await repository.create({
      ...validTournament,
      organizerId: "organizer-1",
    })

    const response = await submitTournamentHandler({
      actor: organizer,
      id: tournament.id,
      repository,
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      tournament: { status: "SUBMITTED" },
    })
  })

  it("rejects an organizer submitting another organizer's draft", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await repository.create({
      ...validTournament,
      organizerId: "organizer-2",
    })

    const response = await submitTournamentHandler({
      actor: organizer,
      id: tournament.id,
      repository,
    })

    expect(response.status).toBe(403)
  })
})

describe("saveTournamentHandler", () => {
  it("returns 422 when required draft data is missing", async () => {
    const response = await saveTournamentHandler({
      actor: organizer,
      request: new Request("http://localhost/api/admin/tournaments", {
        method: "POST",
        body: JSON.stringify({ title: "Incomplete Cup" }),
      }),
      repository: new InMemoryTournamentOperationsRepository(),
    })

    expect(response.status).toBe(422)
  })

  it("returns 422 with an actionable message for an odd capacity", async () => {
    const response = await saveTournamentHandler({
      actor: organizer,
      request: new Request("http://localhost/api/admin/tournaments", {
        method: "POST",
        body: JSON.stringify({ ...validTournament, capacity: 7 }),
      }),
      repository: new InMemoryTournamentOperationsRepository(),
    })

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      message: "จำนวนทีมต้องเป็นเลขคู่ตั้งแต่ 6 ถึง 32 ทีม",
    })
  })

  it("returns 422 for an unsupported age group", async () => {
    const response = await saveTournamentHandler({
      actor: organizer,
      request: new Request("http://localhost/api/admin/tournaments", {
        method: "POST",
        body: JSON.stringify({ ...validTournament, ageGroup: "U20" }),
      }),
      repository: new InMemoryTournamentOperationsRepository(),
    })

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      message: "กรุณาเลือกรุ่นอายุจากรายการ",
    })
  })

  it("returns 409 when an editor saves a stale version", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await repository.create({
      ...validTournament,
      organizerId: "organizer-1",
    })
    await repository.updateWithVersion(tournament.id, 0, {
      title: "Updated elsewhere",
    })

    const response = await saveTournamentHandler({
      actor: organizer,
      id: tournament.id,
      request: new Request(
        `http://localhost/api/admin/tournaments/${tournament.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ ...validTournament, version: 0 }),
        },
      ),
      repository,
    })

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      message: "ข้อมูลถูกแก้ไขจากอีกหน้าต่าง กรุณาโหลดใหม่",
    })
  })

  it("maps a body transport failure to a safe correlated 500", async () => {
    const logger = { error: vi.fn() }
    const request = {
      json: vi.fn(async () => {
        throw new Error("database password in transport detail")
      }),
    } as unknown as Request

    const response = await saveTournamentHandler({
      actor: organizer,
      request,
      repository: new InMemoryTournamentOperationsRepository(),
      createCorrelationId: () => "save-correlation",
      logger,
    })

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      message: "ไม่สามารถดำเนินการได้ในขณะนี้",
      correlationId: "save-correlation",
    })
    expect(logger.error).toHaveBeenCalledWith({
      operation: "tournament.save",
      correlationId: "save-correlation",
      errorType: "Error",
    })
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(
      "database password",
    )
  })
})

describe("unexpected submit failure", () => {
  it("returns a safe correlated 500", async () => {
    const logger = { error: vi.fn() }
    const repository = {
      findById: vi.fn(async () => {
        throw new Error("private database detail")
      }),
    } as unknown as TournamentOperationsRepository

    const response = await submitTournamentHandler({
      actor: organizer,
      id: "tournament-1",
      repository,
      createCorrelationId: () => "submit-correlation",
      logger,
    })

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      correlationId: "submit-correlation",
    })
    expect(logger.error).toHaveBeenCalledWith({
      operation: "tournament.submit",
      correlationId: "submit-correlation",
      errorType: "Error",
    })
  })
})
