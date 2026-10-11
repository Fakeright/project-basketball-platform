import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  developmentCookieMode: false,
}))

vi.mock(
  "@/features/identity/infrastructure/next-cookie-current-actor-provider",
  () => ({
    isDevelopmentCookieSessionMode: () => mocks.developmentCookieMode,
  }),
)

import { POST } from "@/app/api/dev/session/route"

describe("POST /api/dev/session", () => {
  beforeEach(() => {
    mocks.developmentCookieMode = false
  })

  it("returns 404 when development cookie session mode is inactive", async () => {
    const request = new Request("http://localhost/api/dev/session", {
      body: new URLSearchParams({ actorId: "admin-1" }),
      method: "POST",
    })

    const response = await POST(request)

    expect(response.status).toBe(404)
  })
})
