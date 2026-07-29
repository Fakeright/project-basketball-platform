import { describe, expect, it, vi } from "vitest"

import {
  parseJsonRequest,
  unexpectedFailureResponse,
} from "@/features/shared/presentation/safe-http"

describe("safe HTTP diagnostics", () => {
  it("distinguishes malformed JSON from a body transport failure", async () => {
    const malformed = {
      json: vi.fn(async () => {
        throw new SyntaxError("Unexpected token")
      }),
    } as unknown as Request
    const transportFailure = {
      json: vi.fn(async () => {
        throw new Error("stream aborted")
      }),
    } as unknown as Request

    await expect(parseJsonRequest(malformed)).resolves.toEqual({
      ok: false,
    })
    await expect(parseJsonRequest(transportFailure)).rejects.toThrow(
      "stream aborted",
    )
  })

  it("logs only safe diagnostic context and returns a correlation id", async () => {
    const logger = { error: vi.fn() }
    const response = unexpectedFailureResponse(
      new Error("database password must never be logged"),
      "tournament.save",
      {
        createCorrelationId: () => "correlation-1",
        logger,
      },
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      message: "ไม่สามารถดำเนินการได้ในขณะนี้",
      correlationId: "correlation-1",
    })
    expect(logger.error).toHaveBeenCalledWith({
      operation: "tournament.save",
      correlationId: "correlation-1",
      errorType: "Error",
    })
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(
      "database password",
    )
  })
})
