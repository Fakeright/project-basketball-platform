import { NextRequest, NextResponse } from "next/server"
import { describe, expect, it, vi } from "vitest"

import { AuthDependencyUnavailableError } from "@/features/identity/presentation/auth-handler"
import { handleProxyRequest } from "@/proxy"

describe("root Proxy auth boundary", () => {
  it("safe-logs dependency outage and returns a generic correlated 503", async () => {
    const logger = { error: vi.fn() }
    const request = new NextRequest("https://courtside.example/team")

    const response = await handleProxyRequest(request, {
      resolveConfiguration: () => ({
        url: "https://project.supabase.co",
        publishableKey: "publishable",
      }),
      refreshSession: async () => {
        throw new AuthDependencyUnavailableError(
          "provider secret detail",
        )
      },
      createCorrelationId: () => "correlation-1",
      logger,
    })

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      message: "ระบบยืนยันตัวตนไม่พร้อมใช้งานในขณะนี้",
      correlationId: "correlation-1",
    })
    expect(logger.error).toHaveBeenCalledWith({
      operation: "auth.proxy.refresh",
      correlationId: "correlation-1",
      errorType: "AuthDependencyUnavailableError",
    })
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(
      "provider secret detail",
    )
  })

  it("passes through explicit development fallback without refreshing", async () => {
    const refreshSession = vi.fn()
    const response = await handleProxyRequest(
      new NextRequest("http://localhost/team"),
      {
        resolveConfiguration: () => null,
        refreshSession,
        createCorrelationId: () => "unused",
        logger: { error: vi.fn() },
      },
    )

    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(200)
    expect(refreshSession).not.toHaveBeenCalled()
  })
})
