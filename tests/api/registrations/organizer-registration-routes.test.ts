import { describe, expect, it, vi } from "vitest"

import {
  handleDecideRegistration,
  handleWithdrawRegistration,
} from "@/features/registrations/presentation/registration-handler"

const organizer = { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" } as const

function request(body: unknown) {
  return new Request("http://localhost/api/organizer/registrations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("organizer registration route handlers", () => {
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
      invoke: (diagnostics: {
        createCorrelationId: () => string
        logger: { error: (event: unknown) => void }
      }) =>
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
})
