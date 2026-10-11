import { afterEach, describe, expect, it, vi } from "vitest"

import {
  handleApplyToTournament,
  handleCancelRegistration,
  handleDecideRegistration,
  handleWithdrawRegistration,
} from "@/features/registrations/presentation/registration-handler"
import { TournamentGovernancePolicyError } from "@/features/tournament-operations/domain/tournament-governance-policy"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")

interface TestDiagnostics {
  createCorrelationId: () => string
  logger: { error: (event: unknown) => void }
}

function request(body: unknown) {
  return new Request("http://localhost/api/organizer/registrations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("organizer registration route handlers", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns 401 when deciding without an actor", async () => {
    const response = await handleDecideRegistration(
      "tournament-1",
      "registration-1",
      request({ decision: "APPROVE", note: "", version: 0 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => null) },
        decide: vi.fn(),
      },
    )

    expect(response.status).toBe(401)
  })

  it("returns 422 when withdrawal has no trimmed reason", async () => {
    const withdraw = vi.fn()
    const response = await handleWithdrawRegistration(
      "tournament-1",
      "registration-1",
      request({ reason: "  ", version: 1 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        withdraw,
      },
    )

    expect(response.status).toBe(422)
    expect(withdraw).not.toHaveBeenCalled()
  })

  it("maps malformed JSON from a real Request to 422 without diagnostics", async () => {
    const decide = vi.fn()
    const createCorrelationId = vi.fn(() => "unused-correlation-id")
    const logger = { error: vi.fn() }
    const malformedRequest = new Request(
      "http://localhost/api/organizer/registrations",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: '{"decision":',
      },
    )

    const response = await handleDecideRegistration(
      "tournament-1",
      "registration-1",
      malformedRequest,
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        decide,
        createCorrelationId,
        logger,
      },
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      message: "ข้อมูลการสมัครไม่ถูกต้อง",
    })
    expect(decide).not.toHaveBeenCalled()
    expect(createCorrelationId).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  })

  it("maps non-syntax request body failures to safe diagnostics", async () => {
    const decide = vi.fn()
    const createCorrelationId = vi.fn(() => "transport-correlation")
    const logger = { error: vi.fn() }
    const transportRequest = request({
      decision: "REJECT",
      note: "private request payload",
      version: 0,
    })
    vi.spyOn(transportRequest, "json").mockRejectedValue(
      new TypeError("private transport detail"),
    )

    const response = await handleDecideRegistration(
      "tournament-1",
      "registration-1",
      transportRequest,
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        decide,
        createCorrelationId,
        logger,
      },
    )
    const responseBody = await response.json()

    expect(response.status).toBe(500)
    expect(responseBody).toEqual({
      message: "ไม่สามารถจัดการการสมัครได้",
      correlationId: "transport-correlation",
    })
    expect(decide).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith({
      operation: "registration.decide",
      correlationId: "transport-correlation",
      errorType: "Error",
    })
    const publicDiagnostics = JSON.stringify({
      responseBody,
      logs: logger.error.mock.calls,
    })
    expect(publicDiagnostics).not.toContain("private transport detail")
    expect(publicDiagnostics).not.toContain("private request payload")
  })

  it("maps a full tournament approval to 409", async () => {
    const createCorrelationId = vi.fn(() => "unused-correlation-id")
    const logger = { error: vi.fn() }
    const response = await handleDecideRegistration(
      "tournament-1",
      "registration-1",
      request({ decision: "APPROVE", note: "", version: 0 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        decide: vi.fn(async () => {
          throw new Error("TOURNAMENT_CAPACITY_REACHED")
        }),
        createCorrelationId,
        logger,
      },
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      message: "จำนวนทีมที่อนุมัติเต็มความจุการแข่งขันแล้ว",
    })
    expect(createCorrelationId).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  })

  it("maps blocked governance to a typed Thai 409 without diagnostics", async () => {
    const createCorrelationId = vi.fn(() => "unused-correlation-id")
    const logger = { error: vi.fn() }
    const response = await handleApplyToTournament(
      "tournament-1",
      request({ teamId: "team-1" }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        apply: vi.fn(async () => {
          throw new TournamentGovernancePolicyError(["TOURNAMENT_SUSPENDED"])
        }),
        createCorrelationId,
        logger,
      },
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      message: "รายการแข่งขันถูกระงับหรือถูกนำออก กรุณาตรวจสอบสถานะล่าสุด",
      issues: ["TOURNAMENT_SUSPENDED"],
    })
    expect(createCorrelationId).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  })

  it("maps organizer ownership failures to 403", async () => {
    const response = await handleDecideRegistration(
      "tournament-1",
      "registration-1",
      request({ decision: "REJECT", note: "Not eligible", version: 0 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        decide: vi.fn(async () => {
          throw new Error("FORBIDDEN")
        }),
      },
    )

    expect(response.status).toBe(403)
  })

  it.each([
    {
      operation: "registration.decide",
      correlationId: "correlation-decision",
      invoke: (diagnostics: TestDiagnostics) =>
        handleDecideRegistration(
          "tournament-1",
          "registration-1",
          request({
            decision: "REJECT",
            note: "private decision payload",
            version: 0,
          }),
          {
            actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
            decide: vi.fn(async () => {
              throw new Error("database password was exposed")
            }),
            ...diagnostics,
          },
        ),
    },
    {
      operation: "registration.withdraw",
      correlationId: "correlation-withdrawal",
      invoke: (diagnostics: TestDiagnostics) =>
        handleWithdrawRegistration(
          "tournament-1",
          "registration-1",
          request({ reason: "private withdrawal payload", version: 1 }),
          {
            actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
            withdraw: vi.fn(async () => {
              throw new Error("database password was exposed")
            }),
            ...diagnostics,
          },
        ),
    },
  ])(
    "returns and logs safe diagnostics for an unexpected $operation failure",
    async ({ operation, correlationId, invoke }) => {
      const createCorrelationId = vi.fn(() => correlationId)
      const logger = { error: vi.fn() }

      const response = await invoke({ createCorrelationId, logger })
      const responseBody = await response.json()

      expect(response.status).toBe(500)
      expect(responseBody).toEqual({
        message: "ไม่สามารถจัดการการสมัครได้",
        correlationId,
      })
      expect(logger.error).toHaveBeenCalledWith({
        operation,
        correlationId,
        errorType: "Error",
      })
      const publicDiagnostics = JSON.stringify({
        responseBody,
        logs: logger.error.mock.calls,
      })
      expect(publicDiagnostics).not.toContain("database password was exposed")
      expect(publicDiagnostics).not.toContain("private decision payload")
      expect(publicDiagnostics).not.toContain("private withdrawal payload")
    },
  )

  it.each([
    {
      operation: "registration.apply",
      correlationId: "actor-correlation-apply",
      invoke: (diagnostics: TestDiagnostics) =>
        handleApplyToTournament(
          "tournament-1",
          request({ teamId: "private-team-id" }),
          {
            actorProvider: {
              getCurrentActor: vi.fn(async () => {
                throw new Error("FORBIDDEN")
              }),
            },
            apply: vi.fn(),
            ...diagnostics,
          },
        ),
    },
    {
      operation: "registration.cancel",
      correlationId: "actor-correlation-cancel",
      invoke: (diagnostics: TestDiagnostics) =>
        handleCancelRegistration(
          "registration-1",
          request({ version: 1 }),
          {
            actorProvider: {
              getCurrentActor: vi.fn(async () => {
                throw new Error("FORBIDDEN")
              }),
            },
            cancel: vi.fn(),
            ...diagnostics,
          },
        ),
    },
    {
      operation: "registration.decide",
      correlationId: "actor-correlation-decide",
      invoke: (diagnostics: {
        createCorrelationId: () => string
        logger: { error: (event: unknown) => void }
      }) =>
        handleDecideRegistration(
          "tournament-1",
          "registration-1",
          request({
            decision: "REJECT",
            note: "private decision payload",
            version: 0,
          }),
          {
            actorProvider: {
              getCurrentActor: vi.fn(async () => {
                throw new Error("FORBIDDEN")
              }),
            },
            decide: vi.fn(),
            ...diagnostics,
          },
        ),
    },
    {
      operation: "registration.withdraw",
      correlationId: "actor-correlation-withdraw",
      invoke: (diagnostics: {
        createCorrelationId: () => string
        logger: { error: (event: unknown) => void }
      }) =>
        handleWithdrawRegistration(
          "tournament-1",
          "registration-1",
          request({ reason: "private withdrawal payload", version: 1 }),
          {
            actorProvider: {
              getCurrentActor: vi.fn(async () => {
                throw new Error("FORBIDDEN")
              }),
            },
            withdraw: vi.fn(),
            ...diagnostics,
          },
        ),
    },
  ])(
    "contains actor-provider failures at the $operation boundary even when they resemble a domain error",
    async ({ operation, correlationId, invoke }) => {
      const logger = { error: vi.fn() }

      const response = await invoke({
        createCorrelationId: () => correlationId,
        logger,
      })
      const responseBody = await response.json()

      expect(response.status).toBe(500)
      expect(responseBody).toEqual({
        message: "ไม่สามารถจัดการการสมัครได้",
        correlationId,
      })
      expect(logger.error).toHaveBeenCalledWith({
        operation,
        correlationId,
        errorType: "Error",
      })
      expect(JSON.stringify({ responseBody, logs: logger.error.mock.calls })).not.toContain(
        "private",
      )
    },
  )

  it("falls back to a random UUID when the injected ID factory fails", async () => {
    const logger = { error: vi.fn() }
    const response = await handleDecideRegistration(
      "tournament-1",
      "registration-1",
      request({ decision: "APPROVE", note: "", version: 0 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        decide: vi.fn(async () => {
          throw new Error("private database detail")
        }),
        createCorrelationId: () => {
          throw new Error("private ID provider detail")
        },
        logger,
      },
    )
    const responseBody = (await response.json()) as {
      message: string
      correlationId: string
    }

    expect(response.status).toBe(500)
    expect(responseBody.correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
    expect(logger.error).toHaveBeenCalledWith({
      operation: "registration.decide",
      correlationId: responseBody.correlationId,
      errorType: "Error",
    })
    expect(JSON.stringify({ responseBody, logs: logger.error.mock.calls })).not.toContain(
      "private",
    )
  })

  it("returns the safe response and falls back to safe logging when the injected logger fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const response = await handleWithdrawRegistration(
      "tournament-1",
      "registration-1",
      request({ reason: "private withdrawal payload", version: 1 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        withdraw: vi.fn(async () => {
          throw new Error("private database detail")
        }),
        createCorrelationId: () => "logger-fallback-correlation",
        logger: {
          error: () => {
            throw new Error("private logger detail")
          },
        },
      },
    )
    const responseBody = await response.json()

    expect(response.status).toBe(500)
    expect(responseBody).toEqual({
      message: "ไม่สามารถจัดการการสมัครได้",
      correlationId: "logger-fallback-correlation",
    })
    expect(consoleError).toHaveBeenCalledWith({
      operation: "registration.withdraw",
      correlationId: "logger-fallback-correlation",
      errorType: "Error",
    })
    expect(JSON.stringify({ responseBody, logs: consoleError.mock.calls })).not.toContain(
      "private",
    )
  })
})
