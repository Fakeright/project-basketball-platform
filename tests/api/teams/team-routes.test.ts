import { describe, expect, it, vi } from "vitest"

import {
  handleAddTeamPlayers,
  handleAddTeamMember,
  handleCreateTeam,
  handleDeactivateTeamPlayer,
  handleUpdateTeamPlayer,
  handleUpdateTeam,
} from "@/features/team-management/presentation/team-handler"
import { createTestActor } from "@/tests/fixtures/actor"

const anonymous = { getCurrentActor: vi.fn(async () => null) }
const teamManager = createTestActor("manager-1", "TEAM_MANAGER_COACH")
const validPlayer = {
  firstName: "สมชาย",
  lastName: "ใจดี",
  nickname: "ชาย",
  birthDate: "2008-01-01",
  jerseyNumber: 8,
  position: "PG",
  phone: "0812345678",
}
const storedPlayer = {
  id: "player-1",
  teamId: "team-1",
  ...validPlayer,
  isActive: true,
  deactivatedAt: null,
  createdAt: "2026-08-07T00:00:00.000Z",
  updatedAt: "2026-08-07T00:00:00.000Z",
}

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
    const response = await handleCreateTeam(jsonRequest({ name: "A", provinceCode: "" }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      create: vi.fn(),
    })

    expect(response.status).toBe(422)
  })

  it("rejects a free-text province instead of a province code", async () => {
    const response = await handleCreateTeam(
      jsonRequest({ name: "Trang Hoops", provinceCode: "Trang" }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        create: vi.fn(),
      },
    )

    expect(response.status).toBe(422)
  })

  it("returns 404 when a manager updates an inaccessible team", async () => {
    const response = await handleUpdateTeam("team-2", jsonRequest({ name: "Updated", provinceCode: "10" }), {
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

  it("returns 422 before adding a legacy coach roster role", async () => {
    const addMember = vi.fn()
    const response = await handleAddTeamMember("team-1", jsonRequest({ userId: "player-1", role: "COACH" }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      addMember,
    })

    expect(response.status).toBe(422)
    expect(addMember).not.toHaveBeenCalled()
  })

  it("maps a body transport failure to a safe correlated 500", async () => {
    const logger = { error: vi.fn() }
    const request = {
      json: vi.fn(async () => {
        throw new Error("private request detail")
      }),
    } as unknown as Request

    const response = await handleCreateTeam(request, {
      actorProvider: {
        getCurrentActor: vi.fn(async () => teamManager),
      },
      create: vi.fn(),
      createCorrelationId: () => "team-correlation",
      logger,
    })

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      message: "ไม่สามารถดำเนินการได้ในขณะนี้",
      correlationId: "team-correlation",
    })
    expect(logger.error).toHaveBeenCalledWith({
      operation: "team.create",
      correlationId: "team-correlation",
      errorType: "Error",
    })
  })

  it("adds a validated player batch with 201", async () => {
    const players = [storedPlayer]
    const response = await handleAddTeamPlayers(
      "team-1",
      jsonRequest({ players: [validPlayer] }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        addPlayers: vi.fn(async () => players),
      },
    )

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ players })
  })

  it("returns 401 when adding players has no actor", async () => {
    const response = await handleAddTeamPlayers("team-1", jsonRequest({ players: [validPlayer] }), {
      actorProvider: anonymous,
      addPlayers: vi.fn(),
    })

    expect(response.status).toBe(401)
  })

  it("returns 403 when a player batch is forbidden", async () => {
    const response = await handleAddTeamPlayers("team-1", jsonRequest({ players: [validPlayer] }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      addPlayers: vi.fn(async () => {
        throw new Error("FORBIDDEN")
      }),
    })

    expect(response.status).toBe(403)
  })

  it("returns 422 for malformed player batch JSON", async () => {
    const request = new Request("http://localhost/api/teams/team-1/players/batch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    })
    const response = await handleAddTeamPlayers("team-1", request, {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      addPlayers: vi.fn(),
    })

    expect(response.status).toBe(422)
  })

  it("returns 422 when a player batch exceeds 30 rows", async () => {
    const response = await handleAddTeamPlayers(
      "team-1",
      jsonRequest({
        players: Array.from({ length: 31 }, (_, index) => ({
          ...validPlayer,
          firstName: `Player ${index}`,
          jerseyNumber: index + 1,
        })),
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        addPlayers: vi.fn(),
      },
    )

    expect(response.status).toBe(422)
  })

  it("returns indexed field issues for an invalid player row", async () => {
    const response = await handleAddTeamPlayers(
      "team-1",
      jsonRequest({ players: [validPlayer, { ...validPlayer, firstName: "" }] }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        addPlayers: vi.fn(),
      },
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({
      issues: [expect.objectContaining({ row: 1, field: "firstName" })],
    })
  })

  it("returns 409 for a duplicate player", async () => {
    const response = await handleAddTeamPlayers("team-1", jsonRequest({ players: [validPlayer] }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      addPlayers: vi.fn(async () => {
        throw new Error("PLAYER_ALREADY_EXISTS")
      }),
    })

    expect(response.status).toBe(409)
  })

  it("returns 409 when a jersey number is already in use", async () => {
    const response = await handleAddTeamPlayers("team-1", jsonRequest({ players: [validPlayer] }), {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      addPlayers: vi.fn(async () => {
        throw new Error("JERSEY_ALREADY_IN_USE")
      }),
    })

    expect(response.status).toBe(409)
  })

  it("updates a player with 200", async () => {
    const response = await handleUpdateTeamPlayer(
      "team-1",
      "player-1",
      jsonRequest(validPlayer),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        updatePlayer: vi.fn(async () => storedPlayer),
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ player: storedPlayer })
  })

  it("returns 404 when updating a missing player", async () => {
    const response = await handleUpdateTeamPlayer(
      "team-1",
      "missing-player",
      jsonRequest(validPlayer),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        updatePlayer: vi.fn(async () => {
          throw new Error("PLAYER_NOT_FOUND")
        }),
      },
    )

    expect(response.status).toBe(404)
  })

  it("deactivates a player with a server timestamp and 204", async () => {
    const deactivatePlayer = vi.fn(async () => storedPlayer)
    const response = await handleDeactivateTeamPlayer("team-1", "player-1", {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      deactivatePlayer,
    })

    expect(response.status).toBe(204)
    expect(deactivatePlayer).toHaveBeenCalledWith(
      expect.objectContaining({
        teamId: "team-1",
        playerId: "player-1",
        at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      }),
      teamManager,
    )
  })
})
