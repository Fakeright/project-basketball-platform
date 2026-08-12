import { describe, expect, it, vi } from "vitest"

import {
  handleAddTeamPlayers,
  handleCreateTeam,
  handleDeactivateTeamPlayer,
  handleRemoveOrDeactivateTeam,
  handleUpdateTeamPlayer,
  handleUpdateTeam,
} from "@/features/team-management/presentation/team-handler"
import type {
  TeamMutationRepository,
  TeamRepository,
} from "@/features/team-management/application/ports/team-repository"
import { removeOrDeactivateTeam } from "@/features/team-management/application/remove-or-deactivate-team"
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
const createdTeam = {
  id: "team-1",
  name: "Bangkok Ballers",
  provinceCode: "10",
  province: "กรุงเทพมหานคร",
  ownerId: teamManager.id,
  format: "THREE_V_THREE" as const,
  isActive: true,
  deactivatedAt: null,
  version: 0,
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
      jsonRequest({
        name: "Trang Hoops",
        provinceCode: "Trang",
        format: "FIVE_V_FIVE",
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        create: vi.fn(),
      },
    )

    expect(response.status).toBe(422)
  })

  it("returns 404 when a manager updates an inaccessible team", async () => {
    const response = await handleUpdateTeam(
      "team-2",
      jsonRequest({
        name: "Updated",
        provinceCode: "10",
        format: "FIVE_V_FIVE",
        expectedVersion: 0,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        update: vi.fn(async () => {
          throw new Error("NOT_FOUND")
        }),
      },
    )

    expect(response.status).toBe(404)
  })

  it("requires a team format when creating a team", async () => {
    const create = vi.fn()
    const response = await handleCreateTeam(
      jsonRequest({ name: "Bangkok Ballers", provinceCode: "10" }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        create,
      },
    )

    expect(response.status).toBe(422)
    expect(create).not.toHaveBeenCalled()
  })

  it("maps a forbidden team creation to 403", async () => {
    const response = await handleCreateTeam(
      jsonRequest({
        name: "Bangkok Ballers",
        provinceCode: "10",
        format: "THREE_V_THREE",
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        create: vi.fn(async () => {
          throw new Error("FORBIDDEN")
        }),
      },
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      message: "คุณไม่มีสิทธิ์จัดการทีมนี้",
    })
  })

  it("creates a team with a validated initial roster and returns both resources", async () => {
    const create = vi.fn(async () => ({ team: createdTeam, players: [storedPlayer] }))
    const response = await handleCreateTeam(
      jsonRequest({
        name: "Bangkok Ballers",
        provinceCode: "10",
        format: "THREE_V_THREE",
        players: [validPlayer],
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        create,
      },
    )

    expect(response.status).toBe(201)
    expect(create).toHaveBeenCalledWith(
      {
        name: "Bangkok Ballers",
        provinceCode: "10",
        format: "THREE_V_THREE",
        players: [validPlayer],
      },
      teamManager,
    )
    await expect(response.json()).resolves.toEqual({
      team: createdTeam,
      players: [storedPlayer],
    })
  })

  it.each([
    { label: "omitted", body: {} },
    { label: "empty", body: { players: [] } },
  ])("defaults an $label initial roster to an empty list", async ({ body }) => {
    const create = vi.fn(async () => ({ team: createdTeam, players: [] }))
    const response = await handleCreateTeam(
      jsonRequest({
        name: "Bangkok Ballers",
        provinceCode: "10",
        format: "THREE_V_THREE",
        ...body,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        create,
      },
    )

    expect(response.status).toBe(201)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ players: [] }),
      teamManager,
    )
    await expect(response.json()).resolves.toEqual({ team: createdTeam, players: [] })
  })

  it("returns 422 for malformed team creation JSON", async () => {
    const request = new Request("http://localhost/api/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    })
    const response = await handleCreateTeam(request, {
      actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
      create: vi.fn(),
    })

    expect(response.status).toBe(422)
  })

  it("returns 422 when an initial roster exceeds 30 rows", async () => {
    const create = vi.fn()
    const response = await handleCreateTeam(
      jsonRequest({
        name: "Bangkok Ballers",
        provinceCode: "10",
        format: "THREE_V_THREE",
        players: Array.from({ length: 31 }, (_, index) => ({
          ...validPlayer,
          firstName: `Player ${index}`,
          jerseyNumber: index + 1,
        })),
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        create,
      },
    )

    expect(response.status).toBe(422)
    expect(create).not.toHaveBeenCalled()
  })

  it("returns indexed 422 issues for an invalid initial player", async () => {
    const response = await handleCreateTeam(
      jsonRequest({
        name: "Bangkok Ballers",
        provinceCode: "10",
        format: "THREE_V_THREE",
        players: [{ ...validPlayer, firstName: "" }],
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        create: vi.fn(),
      },
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({
      issues: [expect.objectContaining({ row: 0, field: "firstName" })],
    })
  })

  it.each(["PLAYER_ALREADY_EXISTS", "JERSEY_ALREADY_IN_USE"])(
    "maps %s during team creation to 409",
    async (code) => {
      const response = await handleCreateTeam(
        jsonRequest({
          name: "Bangkok Ballers",
          provinceCode: "10",
          format: "THREE_V_THREE",
          players: [validPlayer],
        }),
        {
          actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
          create: vi.fn(async () => {
            throw new Error(code)
          }),
        },
      )

      expect(response.status).toBe(409)
    },
  )

  it("keeps player PII out of unexpected team creation diagnostics", async () => {
    const logger = { error: vi.fn() }
    const privatePlayerDetail = `${validPlayer.firstName} ${validPlayer.phone}`
    const response = await handleCreateTeam(
      jsonRequest({
        name: "Bangkok Ballers",
        provinceCode: "10",
        format: "THREE_V_THREE",
        players: [validPlayer],
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        create: vi.fn(async () => {
          throw new Error(privatePlayerDetail)
        }),
        createCorrelationId: () => "team-player-correlation",
        logger,
      },
    )

    expect(response.status).toBe(500)
    expect(JSON.stringify(await response.json())).not.toContain(privatePlayerDetail)
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(privatePlayerDetail)
  })

  it("passes format and expected version through a team update", async () => {
    const updatedTeam = {
      id: "team-1",
      name: "Updated",
      provinceCode: "10",
      province: "กรุงเทพมหานคร",
      ownerId: teamManager.id,
      format: "THREE_V_THREE" as const,
      isActive: true,
      deactivatedAt: null,
      version: 3,
    }
    const update = vi.fn(async () => updatedTeam)
    const response = await handleUpdateTeam(
      "team-1",
      jsonRequest({
        name: "Updated",
        provinceCode: "10",
        format: "THREE_V_THREE",
        expectedVersion: 2,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        update,
      },
    )

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(
      {
        teamId: "team-1",
        name: "Updated",
        provinceCode: "10",
        format: "THREE_V_THREE",
        expectedVersion: 2,
      },
      teamManager,
    )
  })

  it.each([
    {
      code: "CONFLICT",
      message: "ข้อมูลทีมมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง",
    },
    {
      code: "TEAM_FORMAT_CHANGE_BLOCKED",
      message:
        "ไม่สามารถเปลี่ยนรูปแบบทีมได้ กรุณายกเลิกหรือรอให้ใบสมัครสิ้นสุดก่อนลองอีกครั้ง",
    },
  ])(
    "maps $code team update failures to actionable 409 responses",
    async ({ code, message }) => {
      const response = await handleUpdateTeam(
        "team-1",
        jsonRequest({
          name: "Updated",
          provinceCode: "10",
          format: "THREE_V_THREE",
          expectedVersion: 2,
        }),
        {
          actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
          update: vi.fn(async () => {
            throw new Error(code)
          }),
        },
      )

      expect(response.status).toBe(409)
      await expect(response.json()).resolves.toEqual({ message })
    },
  )

  it("returns DEACTIVATED without deleting legacy rows when no registration exists", async () => {
    const team = {
      id: "team-legacy",
      name: "Legacy Ballers",
      provinceCode: "10",
      province: "Bangkok",
      ownerId: teamManager.id,
      format: "FIVE_V_FIVE" as const,
      isActive: true,
      deactivatedAt: null,
      version: 2,
    }
    const deleteTeam = vi.fn(async () => undefined)
    const appendAuditEvent = vi.fn(async () => undefined)
    const mutations = {
      getRemovalContextForUpdate: vi.fn(async () => ({
        team,
        registrationStatuses: [],
        totalLegacyMemberCount: 1,
      })),
      deleteTeam,
      deactivateTeam: vi.fn(async (_teamId, expectedVersion, at) => ({
        ...team,
        isActive: false,
        deactivatedAt: at,
        version: expectedVersion + 1,
      })),
      appendAuditEvent,
    } as unknown as TeamMutationRepository
    const teams = {
      inTransaction: vi.fn(async (operation) => operation(mutations)),
    } as unknown as TeamRepository

    const response = await handleRemoveOrDeactivateTeam(
      team.id,
      jsonRequest({ confirmationName: team.name, expectedVersion: team.version }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        remove: (input, actor) => removeOrDeactivateTeam(input, actor, { teams }),
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      outcome: "DEACTIVATED",
    })
    expect(deleteTeam).not.toHaveBeenCalled()
    expect(appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "team.deactivated" }),
    )
  })

  it("maps an inactive team update to a safe 409 response", async () => {
    const response = await handleUpdateTeam(
      "team-1",
      jsonRequest({
        name: "Updated",
        provinceCode: "10",
        format: "FIVE_V_FIVE",
        expectedVersion: 2,
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        update: vi.fn(async () => {
          throw new Error("TEAM_INACTIVE")
        }),
      },
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({ message: "ทีมนี้ปิดใช้งานแล้ว" })
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

  it("returns actionable field issues for an invalid player update", async () => {
    const response = await handleUpdateTeamPlayer(
      "team-1",
      "player-1",
      jsonRequest({
        ...validPlayer,
        nickname: "น".repeat(41),
        birthDate: "2999-01-01",
      }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        updatePlayer: vi.fn(),
      },
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({
      message: "ข้อมูลผู้เล่นไม่ถูกต้อง",
      issues: expect.arrayContaining([
        { field: "nickname", message: "ชื่อเล่นต้องไม่เกิน 40 ตัวอักษร" },
        { field: "birthDate", message: "วันเกิดต้องไม่เป็นวันที่ในอนาคต" },
      ]),
    })
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

  it.each([
    ["DELETED", "ลบทีมถาวรแล้ว"],
    ["DEACTIVATED", "ปิดใช้งานทีมแล้วและเก็บประวัติการแข่งขันไว้"],
  ] as const)(
    "returns the server-selected %s team removal outcome",
    async (outcome, message) => {
      const remove = vi.fn(async () => ({ outcome }))
      const response = await handleRemoveOrDeactivateTeam(
        "team-1",
        jsonRequest({ confirmationName: "Bangkok Ballers", expectedVersion: 2 }),
        {
          actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
          remove,
        },
      )

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({ outcome, message })
      expect(remove).toHaveBeenCalledWith(
        {
          teamId: "team-1",
          confirmationName: "Bangkok Ballers",
          expectedVersion: 2,
          at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        },
        teamManager,
      )
    },
  )

  it("returns 422 for an invalid team removal body", async () => {
    const remove = vi.fn()
    const response = await handleRemoveOrDeactivateTeam(
      "team-1",
      jsonRequest({ confirmationName: "Bangkok Ballers", expectedVersion: -1 }),
      {
        actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
        remove,
      },
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      message: "ข้อมูลยืนยันการลบทีมไม่ถูกต้อง",
    })
    expect(remove).not.toHaveBeenCalled()
  })

  it.each([
    [
      "TEAM_NAME_CONFIRMATION_MISMATCH",
      422,
      "ชื่อทีมที่ยืนยันไม่ตรงกัน กรุณาพิมพ์ชื่อทีมให้ตรงทุกตัวอักษร",
    ],
    [
      "TEAM_REMOVAL_BLOCKED",
      409,
      "ไม่สามารถลบหรือปิดใช้งานทีมได้ กรุณายกเลิกหรือถอนใบสมัครที่รอดำเนินการหรืออนุมัติแล้วก่อน",
    ],
    [
      "CONFLICT",
      409,
      "ข้อมูลทีมมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง",
    ],
  ] as const)(
    "maps %s to an actionable team removal response",
    async (code, status, message) => {
      const response = await handleRemoveOrDeactivateTeam(
        "team-1",
        jsonRequest({ confirmationName: "Bangkok Ballers", expectedVersion: 2 }),
        {
          actorProvider: { getCurrentActor: vi.fn(async () => teamManager) },
          remove: vi.fn(async () => {
            throw new Error(code)
          }),
        },
      )

      expect(response.status).toBe(status)
      await expect(response.json()).resolves.toEqual({ message })
    },
  )
})
