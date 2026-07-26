import { describe, expect, it, vi } from "vitest"

import {
  handleAddTeamMember,
  handleCreateTeam,
  handleUpdateTeam,
} from "@/features/team-management/presentation/team-handler"

const anonymous = { getCurrentActor: vi.fn(async () => null) }
const teamManager = { id: "manager-1", role: "TEAM_MANAGER" } as const

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/teams", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("team route handlers", () => {
  it("returns 401 when team creation has no actor", async () => {
    const response = await handleCreateTeam(jsonRequest({}), {
      actorProvider: anonymous,
      create: vi.fn(),
    })

    expect(response.status).toBe(401)
  })

  it("returns 422 for an invalid team identity", async () => {
    const response = await handleCreateTeam(jsonRequest({ name: "A", province: "" }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      create: vi.fn(),
    })

    expect(response.status).toBe(422)
  })

  it("returns 404 when a manager updates an inaccessible team", async () => {
    const response = await handleUpdateTeam("team-2", jsonRequest({ name: "Updated", province: "Bangkok" }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      update: vi.fn(async () => {
        throw new Error("NOT_FOUND")
      }),
    })

    expect(response.status).toBe(404)
  })

  it("returns 409 for an active duplicate roster member", async () => {
    const response = await handleAddTeamMember("team-1", jsonRequest({ userId: "player-1", role: "PLAYER" }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      addMember: vi.fn(async () => {
        throw new Error("MEMBER_ALREADY_ACTIVE")
      }),
    })

    expect(response.status).toBe(409)
  })

  it("returns 422 when roster role does not match the user role", async () => {
    const response = await handleAddTeamMember("team-1", jsonRequest({ userId: "player-1", role: "COACH" }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      addMember: vi.fn(async () => {
        throw new Error("MEMBER_ROLE_MISMATCH")
      }),
    })

    expect(response.status).toBe(422)
  })
})
