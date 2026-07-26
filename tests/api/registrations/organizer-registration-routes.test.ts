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
    const response = await handleDecideRegistration(
      "tournament-1",
      "registration-1",
      request({ decision: "APPROVE", note: "", version: 0 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => organizer) },
        decide: vi.fn(async () => {
          throw new Error("TOURNAMENT_CAPACITY_REACHED")
        }),
      },
    )

    expect(response.status).toBe(409)
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
})
