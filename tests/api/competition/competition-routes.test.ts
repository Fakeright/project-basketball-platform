import { describe, expect, it, vi } from "vitest"

import {
  handleGenerateBracket,
  handleLockBracketEntries,
  handlePublishBracket,
  handleScheduleMatch,
  handleRecordMatchScore,
  handleConfirmMatchResult,
  handleCorrectMatchResult,
} from "@/features/competition/presentation/competition-handler"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")

function request(body: unknown) {
  return new Request("http://localhost/api/organizer/tournaments/tournament-1/bracket/entries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("competition route handlers", () => {
  it("returns 401 when locking entries without an actor", async () => {
    const lockEntries = vi.fn()
    const response = await handleLockBracketEntries(
      "tournament-1",
      request({ expectedVersion: 2 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => null) },
        lockEntries,
      },
    )

    expect(response.status).toBe(401)
    expect(lockEntries).not.toHaveBeenCalled()
  })

  it.each([
    { name: "malformed JSON", body: '{"expectedVersion":' },
    { name: "a negative version", body: JSON.stringify({ expectedVersion: -1 }) },
    { name: "a fractional version", body: JSON.stringify({ expectedVersion: 1.5 }) },
  ])("returns 422 for $name", async ({ body }) => {
    const lockEntries = vi.fn()
    const response = await handleLockBracketEntries(
      "tournament-1",
      new Request("http://localhost/api/competition", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        lockEntries,
      },
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      message: "ข้อมูลการล็อกรายชื่อทีมไม่ถูกต้อง",
    })
    expect(lockEntries).not.toHaveBeenCalled()
  })

  it("returns the locked workspace", async () => {
    const workspace = {
      id: "bracket-1",
      tournamentId: "tournament-1",
      version: 0,
      entries: [{ teamId: "team-1", teamNameSnapshot: "Bangkok Five" }],
    }
    const lockEntries = vi.fn(async () => workspace)
    const response = await handleLockBracketEntries(
      "tournament-1",
      request({ expectedVersion: 2 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        lockEntries,
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ workspace })
    expect(lockEntries).toHaveBeenCalledWith(
      { tournamentId: "tournament-1", expectedVersion: 2 },
      organizer,
    )
  })

  it.each([
    ["NOT_FOUND", 404, "ไม่พบรายการแข่งขัน"],
    ["CONFLICT", 409, "ข้อมูลรายการแข่งขันมีการเปลี่ยนแปลง กรุณาลองใหม่"],
    ["BRACKET_STRUCTURE_LOCKED", 409, "ไม่สามารถแก้ไขสายการแข่งขันหลังเริ่มแข่งขันแล้ว"],
    ["BRACKET_ENTRY_LOCK_UNAVAILABLE", 422, "สถานะรายการแข่งขันยังไม่พร้อมล็อกรายชื่อทีม"],
    ["BRACKET_ENTRY_COUNT_INVALID", 422, "จำนวนทีมที่อนุมัติไม่พร้อมสำหรับสร้างสายการแข่งขัน"],
  ])("maps %s to %i", async (code, status, message) => {
    const response = await handleLockBracketEntries(
      "tournament-1",
      request({ expectedVersion: 2 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        lockEntries: vi.fn(async () => {
          throw new Error(code)
        }),
      },
    )

    expect(response.status).toBe(status)
    await expect(response.json()).resolves.toEqual({ message })
  })

  it("returns safe diagnostics for an unexpected failure", async () => {
    const logger = { error: vi.fn() }
    const response = await handleLockBracketEntries(
      "tournament-1",
      request({ expectedVersion: 2 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        lockEntries: vi.fn(async () => {
          throw new Error("private database detail")
        }),
        createCorrelationId: () => "competition-correlation",
        logger,
      },
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      message: "ไม่สามารถดำเนินการได้ในขณะนี้",
      correlationId: "competition-correlation",
    })
    expect(logger.error).toHaveBeenCalledWith({
      operation: "competition.entries.lock",
      correlationId: "competition-correlation",
      errorType: "Error",
    })
    expect(JSON.stringify({ body, logs: logger.error.mock.calls })).not.toContain(
      "private database detail",
    )
  })
})

describe("bracket generation route handler", () => {
  it("validates a complete generation payload", async () => {
    const generate = vi.fn()
    const response = await handleGenerateBracket(
      "tournament-1",
      request({ method: "SEEDED", expectedVersion: 2, seeds: [] }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        generate,
      },
    )

    expect(response.status).toBe(422)
    expect(generate).not.toHaveBeenCalled()
  })

  it("returns a generated random draft", async () => {
    const bracket = { id: "bracket-1", tournamentId: "tournament-1", version: 3 }
    const generate = vi.fn(async () => bracket)
    const response = await handleGenerateBracket(
      "tournament-1",
      request({ method: "RANDOM", expectedVersion: 2, redraw: false }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        generate,
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ bracket })
    expect(generate).toHaveBeenCalledWith(
      {
        tournamentId: "tournament-1",
        method: "RANDOM",
        expectedVersion: 2,
        redraw: false,
      },
      organizer,
    )
  })

  it.each([
    ["BRACKET_SEED_INVALID", 422, "กรุณากำหนด Seed ให้ครบและไม่ซ้ำกัน"],
    ["BRACKET_RANDOM_INVALID", 422, "ไม่สามารถสุ่มลำดับทีมได้"],
    ["CONFLICT", 409, "ข้อมูลสายการแข่งขันมีการเปลี่ยนแปลง กรุณาลองใหม่"],
  ])("maps generation error %s", async (code, status, message) => {
    const response = await handleGenerateBracket(
      "tournament-1",
      request({ method: "RANDOM", expectedVersion: 2, redraw: false }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        generate: vi.fn(async () => {
          throw new Error(code)
        }),
      },
    )

    expect(response.status).toBe(status)
    await expect(response.json()).resolves.toEqual({ message })
  })
})

describe("bracket publication route handler", () => {
  it("publishes with the current version", async () => {
    const bracket = { id: "bracket-1", tournamentId: "tournament-1", version: 4 }
    const publish = vi.fn(async () => bracket)
    const response = await handlePublishBracket(
      "tournament-1",
      request({ expectedVersion: 3 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        publish,
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ bracket })
    expect(publish).toHaveBeenCalledWith(
      { tournamentId: "tournament-1", expectedVersion: 3 },
      organizer,
    )
  })

  it.each([
    ["BRACKET_DRAFT_INCOMPLETE", 422, "สายการแข่งขันยังไม่สมบูรณ์"],
    ["BRACKET_PUBLICATION_UNAVAILABLE", 409, "ไม่สามารถเปลี่ยนสถานะเผยแพร่ได้"],
  ])("maps publication error %s", async (code, status, message) => {
    const response = await handlePublishBracket(
      "tournament-1",
      request({ expectedVersion: 3 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        publish: vi.fn(async () => {
          throw new Error(code)
        }),
      },
    )

    expect(response.status).toBe(status)
    await expect(response.json()).resolves.toEqual({ message })
  })
})

describe("match schedule route handler", () => {
  it("validates and schedules a match", async () => {
    const match = {
      id: "match-1",
      scheduledAt: "2026-11-15T05:00:00.000Z",
      court: "Court A",
      version: 2,
    }
    const schedule = vi.fn(async () => match)
    const response = await handleScheduleMatch(
      "tournament-1",
      "match-1",
      request({
        scheduledAt: "2026-11-15T05:00:00.000Z",
        court: "Court A",
        expectedVersion: 1,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        schedule,
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ match })
    expect(schedule).toHaveBeenCalledWith(
      expect.objectContaining({
        tournamentId: "tournament-1",
        matchId: "match-1",
        court: "Court A",
      }),
      organizer,
    )
  })

  it("rejects an invalid datetime before the use case", async () => {
    const schedule = vi.fn()
    const response = await handleScheduleMatch(
      "tournament-1",
      "match-1",
      request({ scheduledAt: "not-a-date", court: "Court A", expectedVersion: 1 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        schedule,
      },
    )

    expect(response.status).toBe(422)
    expect(schedule).not.toHaveBeenCalled()
  })

  it.each([
    ["MATCH_SCHEDULE_CONFLICT", 409, "สนามนี้มีการแข่งขันในเวลาดังกล่าวแล้ว"],
    ["MATCH_SCHEDULE_OUTSIDE_TOURNAMENT", 422, "เวลาต้องอยู่ในช่วงวันแข่งขัน"],
    ["MATCH_SCHEDULE_LOCKED", 409, "ไม่สามารถแก้ตารางของคู่ที่เริ่มแข่งขันแล้ว"],
  ])("maps schedule error %s", async (code, status, message) => {
    const response = await handleScheduleMatch(
      "tournament-1",
      "match-1",
      request({
        scheduledAt: "2026-11-15T05:00:00.000Z",
        court: "Court A",
        expectedVersion: 1,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        schedule: vi.fn(async () => {
          throw new Error(code)
        }),
      },
    )

    expect(response.status).toBe(status)
    await expect(response.json()).resolves.toEqual({ message })
  })
})

describe("match result route handlers", () => {
  it("requires explicit confirmation and a reason for admin correction", async () => {
    const correct = vi.fn()
    const response = await handleCorrectMatchResult(
      "tournament-1",
      "match-1",
      request({
        homeScore: 68,
        awayScore: 72,
        expectedVersion: 3,
        reason: " ",
        confirm: true,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        correct,
      },
    )

    expect(response.status).toBe(422)
    expect(correct).not.toHaveBeenCalled()
  })

  it("maps a locked downstream correction to conflict", async () => {
    const response = await handleCorrectMatchResult(
      "tournament-1",
      "match-1",
      request({
        homeScore: 68,
        awayScore: 72,
        expectedVersion: 3,
        reason: "คะแนนผิด",
        confirm: true,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        correct: vi.fn(async () => {
          throw new Error("RESULT_CORRECTION_DOWNSTREAM_LOCKED")
        }),
      },
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      message: "ไม่สามารถเปลี่ยนผู้ชนะหลังคู่ถัดไปเริ่มแล้ว",
    })
  })

  it("records a draft score", async () => {
    const match = {
      id: "match-1",
      status: "IN_PROGRESS",
      homeScore: 10,
      awayScore: 10,
      winnerTeamId: null,
      version: 3,
    }
    const record = vi.fn(async () => match)
    const response = await handleRecordMatchScore(
      "tournament-1",
      "match-1",
      request({ homeScore: 10, awayScore: 10, expectedVersion: 2 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        record,
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ match })
  })

  it("requires explicit confirmation", async () => {
    const confirm = vi.fn()
    const response = await handleConfirmMatchResult(
      "tournament-1",
      "match-1",
      request({
        homeScore: 72,
        awayScore: 68,
        expectedVersion: 2,
        confirm: false,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        confirm,
      },
    )

    expect(response.status).toBe(422)
    expect(confirm).not.toHaveBeenCalled()
  })

  it.each([
    ["MATCH_SCORE_INVALID", 422, "คะแนนต้องเป็นจำนวนเต็มไม่ติดลบและห้ามเสมอ"],
    ["MATCH_ADVANCEMENT_CONFLICT", 409, "ช่องทีมในคู่ถัดไปถูกใช้งานแล้ว"],
    ["MATCH_TEAMS_INCOMPLETE", 422, "คู่แข่งขันยังมีทีมไม่ครบ"],
    ["MATCH_RESULT_CONFIRMED", 409, "ผลการแข่งขันนี้ได้รับการยืนยันแล้ว"],
  ])("maps result error %s", async (code, status, message) => {
    const response = await handleConfirmMatchResult(
      "tournament-1",
      "match-1",
      request({
        homeScore: 72,
        awayScore: 68,
        expectedVersion: 2,
        confirm: true,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        confirm: vi.fn(async () => {
          throw new Error(code)
        }),
      },
    )

    expect(response.status).toBe(status)
    await expect(response.json()).resolves.toEqual({ message })
  })
})
