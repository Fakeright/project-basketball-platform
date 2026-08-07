import { describe, expect, it, vi } from "vitest"

import { addTeamPlayers } from "@/features/team-management/application/add-team-players"
import { createTeam } from "@/features/team-management/application/create-team"
import { deactivateTeamPlayer } from "@/features/team-management/application/deactivate-team-player"
import { getOwnedTeamWorkspace } from "@/features/team-management/application/get-owned-team-workspace"
import { listOwnedTeams } from "@/features/team-management/application/list-owned-teams"
import type { TeamRepository } from "@/features/team-management/application/ports/team-repository"
import { updateTeam } from "@/features/team-management/application/update-team"
import { updateTeamPlayer } from "@/features/team-management/application/update-team-player"
import type { TeamPlayer, TeamPlayerDraft } from "@/features/team-management/domain/team"
import { createTestActor } from "@/tests/fixtures/actor"

const teamManager = createTestActor("manager-1", "TEAM_MANAGER_COACH")
const platformAdmin = createTestActor("admin-1", "PLATFORM_ADMIN")

const team = {
  id: "team-1",
  name: "Bangkok Ballers",
  provinceCode: "10",
  province: "กรุงเทพมหานคร",
  ownerId: teamManager.id,
  format: "FIVE_V_FIVE" as const,
  isActive: true,
  deactivatedAt: null,
  version: 0,
}

function draftPlayer(firstName: string, jerseyNumber: number | null): TeamPlayerDraft {
  return {
    firstName,
    lastName: "player",
    nickname: null,
    birthDate: "2010-02-03",
    jerseyNumber,
    position: "PG",
    phone: null,
  }
}

function playerFromDraft(
  input: TeamPlayerDraft,
  overrides: Partial<TeamPlayer> = {},
): TeamPlayer {
  return {
    id: "player-1",
    teamId: team.id,
    ...input,
    isActive: true,
    deactivatedAt: null,
    createdAt: "2026-08-07T00:00:00.000Z",
    updatedAt: "2026-08-07T00:00:00.000Z",
    ...overrides,
  }
}

type TransactionalTeamRepository = TeamRepository

function createRepository(
  overrides: Partial<TransactionalTeamRepository> = {},
): TransactionalTeamRepository {
  const repository: TransactionalTeamRepository = {
    create: vi.fn(async (input) => ({ id: "team-new", ...input })),
    findById: vi.fn(async () => team),
    findByIdForUpdate: vi.fn(async () => team),
    listByOwner: vi.fn(async () => [team]),
    update: vi.fn(async (id, input) => ({ ...team, id, ...input })),
    listActivePlayers: vi.fn(async () => []),
    hasActiveRegistration: vi.fn(async () => false),
    findExistingPlayersByIdentities: vi.fn(async () => []),
    addPlayers: vi.fn(async (teamId, players) =>
      players.map((player, index) =>
        playerFromDraft(player, {
          id: `player-${index + 1}`,
          teamId,
          updatedAt: "2026-08-07T00:00:01.000Z",
        }),
      ),
    ),
    updatePlayer: vi.fn(async (teamId, playerId, input) =>
      playerFromDraft(input, { id: playerId, teamId }),
    ),
    deactivatePlayer: vi.fn(async (teamId, playerId, at) =>
      playerFromDraft(draftPlayer("one", 4), {
        id: playerId,
        teamId,
        isActive: false,
        deactivatedAt: at,
      }),
    ),
    appendAuditEvent: vi.fn(async () => undefined),
    inTransaction: vi.fn(async (operation) => operation(repository)),
    ...overrides,
  }
  return repository
}

describe("team use cases", () => {
  it("adds an owned team's player batch and records one audit event", async () => {
    const repository = createRepository()

    const players = await addTeamPlayers(
      { teamId: team.id, players: [draftPlayer("one", 4), draftPlayer("two", 8)] },
      teamManager,
      { teams: repository },
    )

    expect(players).toHaveLength(2)
    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "team.players_added",
        entityId: team.id,
        after: {
          playerIds: ["player-1", "player-2"],
          reactivatedPlayerIds: [],
          count: 2,
        },
      }),
    )
  })

  it("rejects player batches outside the allowed size", async () => {
    const repository = createRepository()

    await expect(
      addTeamPlayers({ teamId: team.id, players: [] }, teamManager, { teams: repository }),
    ).rejects.toThrow("PLAYER_BATCH_INVALID")
    await expect(
      addTeamPlayers(
        {
          teamId: team.id,
          players: Array.from({ length: 31 }, (_, index) =>
            draftPlayer(`player-${index}`, index + 1),
          ),
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("PLAYER_BATCH_INVALID")
  })

  it("rejects a non-owner from managing a player roster", async () => {
    const repository = createRepository({
      findById: vi.fn(async () => ({ ...team, ownerId: "manager-2" })),
    })

    await expect(
      addTeamPlayers(
        { teamId: team.id, players: [draftPlayer("one", 4)] },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("FORBIDDEN")
  })

  it("rejects player roster changes for an inactive team", async () => {
    const repository = createRepository({
      findById: vi.fn(async () => ({ ...team, isActive: false })),
    })

    await expect(
      addTeamPlayers(
        { teamId: team.id, players: [draftPlayer("one", 4)] },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("TEAM_INACTIVE")
  })

  it("does not classify a fresh player with different timestamps as reactivated", async () => {
    const freshPlayer = playerFromDraft(draftPlayer("one", 4), {
      createdAt: "2026-08-07T00:00:00.000Z",
      updatedAt: "2026-08-07T00:00:01.000Z",
    })
    const repository = createRepository({ addPlayers: vi.fn(async () => [freshPlayer]) })

    await addTeamPlayers(
      { teamId: team.id, players: [draftPlayer("one", 4)] },
      teamManager,
      { teams: repository },
    )

    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        after: expect.objectContaining({ reactivatedPlayerIds: [] }),
      }),
    )
  })

  it("records inactive identity matches as reactivated player ids in the batch audit event", async () => {
    const reactivated = playerFromDraft(draftPlayer("one", 4), {
      id: "player-old",
      createdAt: "2025-08-07T00:00:00.000Z",
      updatedAt: "2026-08-07T00:00:00.000Z",
    })
    const repository = createRepository({
      findExistingPlayersByIdentities: vi.fn(async () => [
        { ...reactivated, isActive: false, deactivatedAt: "2026-08-06T00:00:00.000Z" },
      ]),
      addPlayers: vi.fn(async () => [reactivated]),
    })

    await addTeamPlayers(
      { teamId: team.id, players: [draftPlayer("one", 4)] },
      teamManager,
      { teams: repository },
    )

    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        after: expect.objectContaining({ reactivatedPlayerIds: ["player-old"] }),
      }),
    )
    expect(repository.findExistingPlayersByIdentities).toHaveBeenCalledWith(
      team.id,
      [draftPlayer("one", 4)],
    )
  })

  it("updates an active player and audits the before and after values", async () => {
    const existingPlayer = playerFromDraft(draftPlayer("one", 4))
    const updatedDraft = { ...draftPlayer("one", 9), position: "SG" as const }
    const repository = createRepository({
      listActivePlayers: vi.fn(async () => [existingPlayer]),
      updatePlayer: vi.fn(async (teamId, playerId, input) =>
        playerFromDraft(input, { id: playerId, teamId }),
      ),
    })

    const updated = await updateTeamPlayer(
      { teamId: team.id, playerId: existingPlayer.id, player: updatedDraft },
      teamManager,
      { teams: repository },
    )

    expect(updated.jerseyNumber).toBe(9)
    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "team.player_updated",
        before: existingPlayer,
        after: updated,
      }),
    )
  })

  it("soft-removes an active player and audits the transition", async () => {
    const existingPlayer = playerFromDraft(draftPlayer("one", 4))
    const at = "2026-08-07T12:00:00.000Z"
    const repository = createRepository({
      listActivePlayers: vi.fn(async () => [existingPlayer]),
    })

    const deactivated = await deactivateTeamPlayer(
      { teamId: team.id, playerId: existingPlayer.id, at },
      teamManager,
      { teams: repository },
    )

    expect(deactivated).toMatchObject({ isActive: false, deactivatedAt: at })
    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "team.player_deactivated", before: existingPlayer }),
    )
  })

  it("adds an admin override audit event for player mutations", async () => {
    const repository = createRepository({
      findById: vi.fn(async () => ({ ...team, ownerId: "manager-2" })),
    })

    await addTeamPlayers(
      { teamId: team.id, players: [draftPlayer("one", 4)] },
      platformAdmin,
      { teams: repository },
    )

    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "team.admin_override", entityId: team.id }),
    )
  })

  it("creates a team owned by the team manager and audits the mutation", async () => {
    const repository = createRepository()

    const created = await createTeam(
      {
        name: "Chiang Mai Hoops",
        provinceCode: "50",
        format: "THREE_V_THREE",
      },
      teamManager,
      { teams: repository },
    )

    expect(created.ownerId).toBe(teamManager.id)
    expect(repository.create).toHaveBeenCalledWith({
      name: "Chiang Mai Hoops",
      provinceCode: "50",
      format: "THREE_V_THREE",
      ownerId: teamManager.id,
    })
    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: teamManager.id,
        action: "team.created",
        entityId: created.id,
        after: created,
      }),
    )
  })

  it("hides another manager's team when updating it", async () => {
    const repository = createRepository({
      findByIdForUpdate: vi.fn(async () => ({ ...team, ownerId: "manager-2" })),
    })

    await expect(
      updateTeam(
        {
          teamId: team.id,
          name: "Changed",
          provinceCode: "10",
          format: team.format,
          expectedVersion: team.version,
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("audits an admin override separately from the team update", async () => {
    const repository = createRepository({
      findByIdForUpdate: vi.fn(async () => ({ ...team, ownerId: "manager-2" })),
    })

    await updateTeam(
      {
        teamId: team.id,
        name: "Changed",
        provinceCode: "10",
        format: team.format,
        expectedVersion: team.version,
      },
      platformAdmin,
      { teams: repository },
    )

    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "team.updated", before: expect.anything() }),
    )
    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "team.admin_override", entityId: team.id }),
    )
  })

  it("blocks a format change while the team has an active registration", async () => {
    const repository = createRepository({
      hasActiveRegistration: vi.fn(async () => true),
    })

    await expect(
      updateTeam(
        {
          teamId: team.id,
          name: team.name,
          provinceCode: team.provinceCode,
          format: "THREE_V_THREE",
          expectedVersion: team.version,
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("TEAM_FORMAT_CHANGE_BLOCKED")
    expect(repository.update).not.toHaveBeenCalled()
  })

  it("returns a stale-version conflict before checking active registrations", async () => {
    const hasActiveRegistration = vi.fn(async () => true)
    const repository = createRepository({
      findByIdForUpdate: vi.fn(async () => ({ ...team, version: 2 })),
      hasActiveRegistration,
    })

    await expect(
      updateTeam(
        {
          teamId: team.id,
          name: team.name,
          provinceCode: team.provinceCode,
          format: "THREE_V_THREE",
          expectedVersion: 1,
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("CONFLICT")
    expect(hasActiveRegistration).not.toHaveBeenCalled()
    expect(repository.update).not.toHaveBeenCalled()
  })

  it("updates with the expected version and skips registration reads when format is unchanged", async () => {
    const repository = createRepository({
      findByIdForUpdate: vi.fn(async () => ({ ...team, version: 2 })),
    })

    await updateTeam(
      {
        teamId: team.id,
        name: "Changed",
        provinceCode: team.provinceCode,
        format: team.format,
        expectedVersion: 2,
      },
      teamManager,
      { teams: repository },
    )

    expect(repository.hasActiveRegistration).not.toHaveBeenCalled()
    expect(repository.findById).not.toHaveBeenCalled()
    expect(repository.findByIdForUpdate).toHaveBeenCalledWith(team.id)
    expect(repository.update).toHaveBeenCalledWith(team.id, {
      name: "Changed",
      provinceCode: team.provinceCode,
      format: team.format,
      expectedVersion: 2,
    })
  })

  it("lists only teams owned by the authorized manager", async () => {
    const repository = createRepository()

    const teams = await listOwnedTeams(teamManager, { teams: repository })

    expect(teams).toEqual([team])
    expect(repository.listByOwner).toHaveBeenCalledWith(teamManager.id)
  })

  it("loads active players without reading legacy members for the workspace", async () => {
    const activePlayer = playerFromDraft(draftPlayer("one", 4))
    const repository = createRepository({
      listActivePlayers: vi.fn(async () => [activePlayer]),
    })

    await expect(
      getOwnedTeamWorkspace(team.id, teamManager, { teams: repository }),
    ).resolves.toEqual({
      team,
      players: [activePlayer],
    })
  })

  it("performs each team mutation in a repository transaction", async () => {
    const repository = createRepository()

    await createTeam(
      {
        name: "Khon Kaen Hoops",
        provinceCode: "40",
        format: "FIVE_V_FIVE",
      },
      teamManager,
      { teams: repository },
    )
    await updateTeam(
      {
        teamId: team.id,
        name: "Changed",
        provinceCode: "10",
        format: team.format,
        expectedVersion: team.version,
      },
      teamManager,
      { teams: repository },
    )
    expect(repository.inTransaction).toHaveBeenCalledTimes(2)
  })

  it("does not commit a team update when its audit write fails", async () => {
    let persistedTeam = { ...team }
    const repository = createRepository({
      findByIdForUpdate: vi.fn(async () => persistedTeam),
      update: vi.fn(async (_id, input) => {
        persistedTeam = { ...persistedTeam, ...input }
        return persistedTeam
      }),
      appendAuditEvent: vi.fn(async () => {
        throw new Error("AUDIT_FAILED")
      }),
      inTransaction: vi.fn(async (operation) => {
        const before = persistedTeam
        try {
          return await operation(repository)
        } catch (error) {
          persistedTeam = before
          throw error
        }
      }),
    })

    await expect(
      updateTeam(
        {
          teamId: team.id,
          name: "Changed",
          provinceCode: "10",
          format: team.format,
          expectedVersion: team.version,
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("AUDIT_FAILED")

    expect(persistedTeam).toEqual(team)
  })
})
