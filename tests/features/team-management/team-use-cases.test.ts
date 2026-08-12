import { describe, expect, it, vi } from "vitest"

import { addTeamPlayers } from "@/features/team-management/application/add-team-players"
import { createTeam } from "@/features/team-management/application/create-team"
import { deactivateTeamPlayer } from "@/features/team-management/application/deactivate-team-player"
import { getOwnedTeamWorkspace } from "@/features/team-management/application/get-owned-team-workspace"
import { listReusableTeamPlayers } from "@/features/team-management/application/list-reusable-team-players"
import { listOwnedTeams } from "@/features/team-management/application/list-owned-teams"
import type {
  TeamMutationRepository,
  TeamRepository,
} from "@/features/team-management/application/ports/team-repository"
import { removeOrDeactivateTeam } from "@/features/team-management/application/remove-or-deactivate-team"
import { updateTeam } from "@/features/team-management/application/update-team"
import { updateTeamPlayer } from "@/features/team-management/application/update-team-player"
import type { TeamPlayer, TeamPlayerDraft } from "@/features/team-management/domain/team"
import {
  projectReusableTeamPlayers,
  type TeamPlayerHistorySource,
} from "@/features/team-management/domain/team-player-history"
import { createTestActor } from "@/tests/fixtures/actor"

const teamManager = createTestActor("manager-1", "TEAM_MANAGER_COACH")
const platformAdmin = createTestActor("admin-1", "PLATFORM_ADMIN")
const playerActor = createTestActor("player-actor-1", "PLAYER")

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

const playerPiiKeys = new Set([
  "firstName",
  "lastName",
  "nickname",
  "birthDate",
  "phone",
])

function playerAuditSnapshot(player: TeamPlayer) {
  return {
    playerId: player.id,
    teamId: player.teamId,
    jerseyNumber: player.jerseyNumber,
    position: player.position,
    isActive: player.isActive,
  }
}

function expectPlayerAuditPayloadsToOmitPii(repository: TeamRepository) {
  for (const [event] of vi.mocked(repository.appendAuditEvent).mock.calls) {
    expect(findPlayerPiiKeys(event.before)).toEqual([])
    expect(findPlayerPiiKeys(event.after)).toEqual([])
  }
}

function findPlayerPiiKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(findPlayerPiiKeys)
  if (typeof value !== "object" || value === null) return []

  return Object.entries(value).flatMap(([key, nestedValue]) => [
    ...(playerPiiKeys.has(key) ? [key] : []),
    ...findPlayerPiiKeys(nestedValue),
  ])
}

type TransactionalTeamRepository = TeamRepository
const transactionLifetimeError = "TRANSACTION_REPOSITORY_OUTSIDE_CALLBACK"

function createRepository(
  overrides: Partial<TransactionalTeamRepository> = {},
): TransactionalTeamRepository {
  const repository: TransactionalTeamRepository = {
    create: vi.fn(async (input) => ({ id: "team-new", ...input })),
    findById: vi.fn(async () => team),
    findByIdForUpdate: vi.fn(async () => team),
    listByOwner: vi.fn(async () => [team]),
    listPlayerHistoryByOwner: vi.fn(async () => []),
    listLegacyReconciliationContexts: vi.fn(async () => []),
    update: vi.fn(async (id, input) => ({ ...team, id, ...input })),
    listActivePlayers: vi.fn(async () => []),
    hasActiveRegistration: vi.fn(async () => false),
    getRemovalContextForUpdate: vi.fn(async () => ({
      team,
      registrationStatuses: [],
      totalLegacyMemberCount: 0,
    })),
    deleteTeam: vi.fn(async () => undefined),
    deactivateTeam: vi.fn(async (_id, expectedVersion, at) => ({
      ...team,
      isActive: false,
      deactivatedAt: at,
      version: expectedVersion + 1,
    })),
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

function guardTransactionRepository(
  repository: TransactionalTeamRepository,
  isActive: () => boolean,
): TransactionalTeamRepository {
  const guardedMethods = new Map<
    PropertyKey,
    (...args: unknown[]) => Promise<unknown>
  >()

  return new Proxy(repository, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      if (typeof value !== "function") return value

      let guarded = guardedMethods.get(property)
      if (!guarded) {
        guarded = vi.fn(async (...args: unknown[]) => {
          if (!isActive()) throw new Error(transactionLifetimeError)
          return Reflect.apply(value, target, args)
        })
        guardedMethods.set(property, guarded)
      }
      return guarded
    },
  })
}

function createDistinctTransactionRepositories(
  transactionOverrides: Partial<TeamMutationRepository> = {},
) {
  let transactionActive = false
  const transaction = guardTransactionRepository(
    createRepository(transactionOverrides),
    () => transactionActive,
  )
  const outer = createRepository()
  outer.inTransaction = vi.fn(
    async <T>(
      operation: (repository: TeamMutationRepository) => Promise<T>,
    ): Promise<T> => {
      transactionActive = true
      try {
        return await operation(transaction)
      } finally {
        transactionActive = false
      }
    },
  )
  return { outer, transaction }
}

describe("team use cases", () => {
  describe("transaction-scoped roster mutations", () => {
    it("rejects transaction repository use after the callback lifetime", async () => {
      const { outer, transaction } = createDistinctTransactionRepositories()

      await outer.inTransaction(async (teams) => {
        await teams.findByIdForUpdate(team.id)
      })

      await expect(transaction.findByIdForUpdate(team.id)).rejects.toThrow(
        transactionLifetimeError,
      )
    })

    it("adds players only through the callback repository after its Team lock", async () => {
      const { outer, transaction } = createDistinctTransactionRepositories()

      await addTeamPlayers(
        { teamId: team.id, players: [draftPlayer("one", 4)] },
        teamManager,
        { teams: outer },
      )

      expect(outer.inTransaction).toHaveBeenCalledOnce()
      expect(transaction.findByIdForUpdate).toHaveBeenCalledWith(team.id)
      expect(transaction.findExistingPlayersByIdentities).toHaveBeenCalledOnce()
      expect(transaction.addPlayers).toHaveBeenCalledOnce()
      expect(transaction.appendAuditEvent).toHaveBeenCalledOnce()
      expect(outer.findById).not.toHaveBeenCalled()
      expect(outer.findByIdForUpdate).not.toHaveBeenCalled()
      expect(outer.findExistingPlayersByIdentities).not.toHaveBeenCalled()
      expect(outer.addPlayers).not.toHaveBeenCalled()
      expect(outer.appendAuditEvent).not.toHaveBeenCalled()
      expect(
        vi.mocked(transaction.findByIdForUpdate).mock.invocationCallOrder[0],
      ).toBeLessThan(
        vi.mocked(transaction.findExistingPlayersByIdentities).mock.invocationCallOrder[0],
      )
      expect(
        vi.mocked(transaction.findByIdForUpdate).mock.invocationCallOrder[0],
      ).toBeLessThan(vi.mocked(transaction.addPlayers).mock.invocationCallOrder[0])
    })

    it("updates a player only through the callback repository after its Team lock", async () => {
      const existingPlayer = playerFromDraft(draftPlayer("one", 4))
      const { outer, transaction } = createDistinctTransactionRepositories({
        listActivePlayers: vi.fn(async () => [existingPlayer]),
      })

      await updateTeamPlayer(
        {
          teamId: team.id,
          playerId: existingPlayer.id,
          player: draftPlayer("one", 8),
        },
        teamManager,
        { teams: outer },
      )

      expect(outer.inTransaction).toHaveBeenCalledOnce()
      expect(transaction.findByIdForUpdate).toHaveBeenCalledWith(team.id)
      expect(transaction.listActivePlayers).toHaveBeenCalledWith(team.id)
      expect(transaction.updatePlayer).toHaveBeenCalledOnce()
      expect(transaction.appendAuditEvent).toHaveBeenCalledOnce()
      expect(outer.findById).not.toHaveBeenCalled()
      expect(outer.findByIdForUpdate).not.toHaveBeenCalled()
      expect(outer.listActivePlayers).not.toHaveBeenCalled()
      expect(outer.updatePlayer).not.toHaveBeenCalled()
      expect(outer.appendAuditEvent).not.toHaveBeenCalled()
      expect(
        vi.mocked(transaction.findByIdForUpdate).mock.invocationCallOrder[0],
      ).toBeLessThan(
        vi.mocked(transaction.listActivePlayers).mock.invocationCallOrder[0],
      )
      expect(
        vi.mocked(transaction.findByIdForUpdate).mock.invocationCallOrder[0],
      ).toBeLessThan(vi.mocked(transaction.updatePlayer).mock.invocationCallOrder[0])
    })

    it("deactivates a player only through the callback repository after its Team lock", async () => {
      const existingPlayer = playerFromDraft(draftPlayer("one", 4))
      const { outer, transaction } = createDistinctTransactionRepositories({
        listActivePlayers: vi.fn(async () => [existingPlayer]),
      })

      await deactivateTeamPlayer(
        {
          teamId: team.id,
          playerId: existingPlayer.id,
          at: "2026-08-10T00:00:00.000Z",
        },
        teamManager,
        { teams: outer },
      )

      expect(outer.inTransaction).toHaveBeenCalledOnce()
      expect(transaction.findByIdForUpdate).toHaveBeenCalledWith(team.id)
      expect(transaction.listActivePlayers).toHaveBeenCalledWith(team.id)
      expect(transaction.deactivatePlayer).toHaveBeenCalledOnce()
      expect(transaction.appendAuditEvent).toHaveBeenCalledOnce()
      expect(outer.findById).not.toHaveBeenCalled()
      expect(outer.findByIdForUpdate).not.toHaveBeenCalled()
      expect(outer.listActivePlayers).not.toHaveBeenCalled()
      expect(outer.deactivatePlayer).not.toHaveBeenCalled()
      expect(outer.appendAuditEvent).not.toHaveBeenCalled()
      expect(
        vi.mocked(transaction.findByIdForUpdate).mock.invocationCallOrder[0],
      ).toBeLessThan(
        vi.mocked(transaction.listActivePlayers).mock.invocationCallOrder[0],
      )
      expect(
        vi.mocked(transaction.findByIdForUpdate).mock.invocationCallOrder[0],
      ).toBeLessThan(
        vi.mocked(transaction.deactivatePlayer).mock.invocationCallOrder[0],
      )
    })

    it("stops a player batch inside the callback when its locked Team is inactive", async () => {
      const { outer, transaction } = createDistinctTransactionRepositories({
        findByIdForUpdate: vi.fn(async () => ({ ...team, isActive: false })),
      })

      await expect(
        addTeamPlayers(
          { teamId: team.id, players: [draftPlayer("one", 4)] },
          teamManager,
          { teams: outer },
        ),
      ).rejects.toThrow("TEAM_INACTIVE")

      expect(outer.inTransaction).toHaveBeenCalledOnce()
      expect(transaction.findByIdForUpdate).toHaveBeenCalledWith(team.id)
      expect(transaction.findExistingPlayersByIdentities).not.toHaveBeenCalled()
      expect(transaction.addPlayers).not.toHaveBeenCalled()
      expect(transaction.appendAuditEvent).not.toHaveBeenCalled()
      expect(outer.findById).not.toHaveBeenCalled()
      expect(outer.findByIdForUpdate).not.toHaveBeenCalled()
      expect(outer.findExistingPlayersByIdentities).not.toHaveBeenCalled()
      expect(outer.addPlayers).not.toHaveBeenCalled()
      expect(outer.appendAuditEvent).not.toHaveBeenCalled()
    })

    it("stops a player update inside the callback when its locked Team is inactive", async () => {
      const { outer, transaction } = createDistinctTransactionRepositories({
        findByIdForUpdate: vi.fn(async () => ({ ...team, isActive: false })),
      })

      await expect(
        updateTeamPlayer(
          { teamId: team.id, playerId: "player-1", player: draftPlayer("one", 8) },
          teamManager,
          { teams: outer },
        ),
      ).rejects.toThrow("TEAM_INACTIVE")

      expect(outer.inTransaction).toHaveBeenCalledOnce()
      expect(transaction.findByIdForUpdate).toHaveBeenCalledWith(team.id)
      expect(transaction.listActivePlayers).not.toHaveBeenCalled()
      expect(transaction.updatePlayer).not.toHaveBeenCalled()
      expect(transaction.appendAuditEvent).not.toHaveBeenCalled()
      expect(outer.findById).not.toHaveBeenCalled()
      expect(outer.findByIdForUpdate).not.toHaveBeenCalled()
      expect(outer.listActivePlayers).not.toHaveBeenCalled()
      expect(outer.updatePlayer).not.toHaveBeenCalled()
      expect(outer.appendAuditEvent).not.toHaveBeenCalled()
    })

    it("stops player deactivation inside the callback when its locked Team is inactive", async () => {
      const { outer, transaction } = createDistinctTransactionRepositories({
        findByIdForUpdate: vi.fn(async () => ({ ...team, isActive: false })),
      })

      await expect(
        deactivateTeamPlayer(
          {
            teamId: team.id,
            playerId: "player-1",
            at: "2026-08-10T00:00:00.000Z",
          },
          teamManager,
          { teams: outer },
        ),
      ).rejects.toThrow("TEAM_INACTIVE")

      expect(outer.inTransaction).toHaveBeenCalledOnce()
      expect(transaction.findByIdForUpdate).toHaveBeenCalledWith(team.id)
      expect(transaction.listActivePlayers).not.toHaveBeenCalled()
      expect(transaction.deactivatePlayer).not.toHaveBeenCalled()
      expect(transaction.appendAuditEvent).not.toHaveBeenCalled()
      expect(outer.findById).not.toHaveBeenCalled()
      expect(outer.findByIdForUpdate).not.toHaveBeenCalled()
      expect(outer.listActivePlayers).not.toHaveBeenCalled()
      expect(outer.deactivatePlayer).not.toHaveBeenCalled()
      expect(outer.appendAuditEvent).not.toHaveBeenCalled()
    })
  })

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
          players: players.map(playerAuditSnapshot),
          reactivatedPlayerIds: [],
          count: 2,
        },
      }),
    )
    expectPlayerAuditPayloadsToOmitPii(repository)
    expect(repository.findById).not.toHaveBeenCalled()
    expect(repository.findByIdForUpdate).toHaveBeenCalledWith(team.id)
    expect(vi.mocked(repository.findByIdForUpdate).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(repository.findExistingPlayersByIdentities).mock.invocationCallOrder[0],
    )
    expect(
      vi.mocked(repository.findExistingPlayersByIdentities).mock.invocationCallOrder[0],
    ).toBeLessThan(vi.mocked(repository.addPlayers).mock.invocationCallOrder[0])
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
      findByIdForUpdate: vi.fn(async () => ({ ...team, ownerId: "manager-2" })),
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
      findByIdForUpdate: vi.fn(async () => ({ ...team, isActive: false })),
    })

    await expect(
      addTeamPlayers(
        { teamId: team.id, players: [draftPlayer("one", 4)] },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("TEAM_INACTIVE")
    expect(repository.findExistingPlayersByIdentities).not.toHaveBeenCalled()
    expect(repository.addPlayers).not.toHaveBeenCalled()
  })

  it("rejects player edit and deactivation when the locked team is inactive", async () => {
    const activePlayer = playerFromDraft(draftPlayer("one", 4))
    const repository = createRepository({
      findByIdForUpdate: vi.fn(async () => ({ ...team, isActive: false })),
      listActivePlayers: vi.fn(async () => [activePlayer]),
    })

    await expect(
      updateTeamPlayer(
        { teamId: team.id, playerId: activePlayer.id, player: draftPlayer("one", 8) },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("TEAM_INACTIVE")
    await expect(
      deactivateTeamPlayer(
        { teamId: team.id, playerId: activePlayer.id, at: "2026-08-10T00:00:00.000Z" },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("TEAM_INACTIVE")

    expect(repository.listActivePlayers).not.toHaveBeenCalled()
    expect(repository.updatePlayer).not.toHaveBeenCalled()
    expect(repository.deactivatePlayer).not.toHaveBeenCalled()
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
        after: {
          players: [playerAuditSnapshot(reactivated)],
          reactivatedPlayerIds: ["player-old"],
          count: 1,
        },
      }),
    )
    expectPlayerAuditPayloadsToOmitPii(repository)
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
        before: playerAuditSnapshot(existingPlayer),
        after: playerAuditSnapshot(updated),
      }),
    )
    expectPlayerAuditPayloadsToOmitPii(repository)
    expect(repository.findById).not.toHaveBeenCalled()
    expect(repository.findByIdForUpdate).toHaveBeenCalledWith(team.id)
    expect(vi.mocked(repository.findByIdForUpdate).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(repository.listActivePlayers).mock.invocationCallOrder[0],
    )
    expect(vi.mocked(repository.listActivePlayers).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(repository.updatePlayer).mock.invocationCallOrder[0],
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
      expect.objectContaining({
        action: "team.player_deactivated",
        before: playerAuditSnapshot(existingPlayer),
        after: playerAuditSnapshot(deactivated),
      }),
    )
    expectPlayerAuditPayloadsToOmitPii(repository)
    expect(repository.findById).not.toHaveBeenCalled()
    expect(repository.findByIdForUpdate).toHaveBeenCalledWith(team.id)
    expect(vi.mocked(repository.findByIdForUpdate).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(repository.listActivePlayers).mock.invocationCallOrder[0],
    )
    expect(vi.mocked(repository.listActivePlayers).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(repository.deactivatePlayer).mock.invocationCallOrder[0],
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
    expectPlayerAuditPayloadsToOmitPii(repository)
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

  it("rejects a current-version update when the locked team is inactive", async () => {
    const repository = createRepository({
      findByIdForUpdate: vi.fn(async () => ({ ...team, isActive: false })),
    })

    await expect(
      updateTeam(
        {
          teamId: team.id,
          name: team.name,
          provinceCode: team.provinceCode,
          format: team.format,
          expectedVersion: team.version,
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("TEAM_INACTIVE")
    expect(repository.update).not.toHaveBeenCalled()
  })

  it("returns a stale conflict before the inactive-team update guard", async () => {
    const repository = createRepository({
      findByIdForUpdate: vi.fn(async () => ({ ...team, isActive: false, version: 2 })),
    })

    await expect(
      updateTeam(
        {
          teamId: team.id,
          name: team.name,
          provinceCode: team.provinceCode,
          format: team.format,
          expectedVersion: 1,
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("CONFLICT")
    expect(repository.update).not.toHaveBeenCalled()
  })

  it("permanently deletes a team with no registration history and audits it", async () => {
    const repository = createRepository()
    const at = "2026-08-09T12:00:00.000Z"

    await expect(
      removeOrDeactivateTeam(
        {
          teamId: team.id,
          confirmationName: `  ${team.name}  `,
          expectedVersion: team.version,
          at,
        },
        teamManager,
        { teams: repository },
      ),
    ).resolves.toEqual({ outcome: "DELETED" })

    expect(repository.deleteTeam).toHaveBeenCalledWith(team.id)
    expect(repository.deactivateTeam).not.toHaveBeenCalled()
    expect(repository.appendAuditEvent).toHaveBeenCalledWith({
      actorId: teamManager.id,
      action: "team.deleted",
      entityId: team.id,
      before: team,
      after: null,
    })
    expect(repository.inTransaction).toHaveBeenCalledOnce()
  })

  it("deactivates a team with legacy member history even without registrations", async () => {
    const at = "2026-08-09T12:00:00.000Z"
    const repository = createRepository({
      getRemovalContextForUpdate: vi.fn(async () => ({
        team,
        registrationStatuses: [],
        totalLegacyMemberCount: 2,
      })),
    })

    await expect(
      removeOrDeactivateTeam(
        {
          teamId: team.id,
          confirmationName: team.name,
          expectedVersion: team.version,
          at,
        },
        teamManager,
        { teams: repository },
      ),
    ).resolves.toEqual({ outcome: "DEACTIVATED" })

    expect(repository.deleteTeam).not.toHaveBeenCalled()
    expect(repository.deactivateTeam).toHaveBeenCalledWith(
      team.id,
      team.version,
      at,
    )
    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "team.deactivated",
        entityId: team.id,
        before: team,
        after: expect.objectContaining({ isActive: false }),
      }),
    )
  })

  it("deactivates a team with terminal registration history and increments version", async () => {
    const at = "2026-08-09T12:00:00.000Z"
    const repository = createRepository({
      getRemovalContextForUpdate: vi.fn(async () => ({
        team,
        registrationStatuses: ["REJECTED", "CANCELLED", "WITHDRAWN"],
        totalLegacyMemberCount: 0,
      })),
    })

    await expect(
      removeOrDeactivateTeam(
        {
          teamId: team.id,
          confirmationName: team.name,
          expectedVersion: team.version,
          at,
        },
        teamManager,
        { teams: repository },
      ),
    ).resolves.toEqual({ outcome: "DEACTIVATED" })

    expect(repository.deactivateTeam).toHaveBeenCalledWith(
      team.id,
      team.version,
      at,
    )
    expect(repository.deleteTeam).not.toHaveBeenCalled()
    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "team.deactivated",
        before: team,
        after: expect.objectContaining({
          isActive: false,
          deactivatedAt: at,
          version: team.version + 1,
        }),
      }),
    )
  })

  it.each(["PENDING", "APPROVED"] as const)(
    "blocks removal while a registration is %s",
    async (status) => {
      const repository = createRepository({
        getRemovalContextForUpdate: vi.fn(async () => ({
          team,
          registrationStatuses: [status],
          totalLegacyMemberCount: 1,
        })),
      })

      await expect(
        removeOrDeactivateTeam(
          {
            teamId: team.id,
            confirmationName: team.name,
            expectedVersion: team.version,
            at: "2026-08-09T12:00:00.000Z",
          },
          teamManager,
          { teams: repository },
        ),
      ).rejects.toThrow("TEAM_REMOVAL_BLOCKED")

      expect(repository.deleteTeam).not.toHaveBeenCalled()
      expect(repository.deactivateTeam).not.toHaveBeenCalled()
      expect(repository.appendAuditEvent).not.toHaveBeenCalled()
    },
  )

  it("returns a stale conflict before the active-registration lifecycle guard", async () => {
    const repository = createRepository({
      getRemovalContextForUpdate: vi.fn(async () => ({
        team: { ...team, version: 2 },
        registrationStatuses: ["APPROVED"],
        totalLegacyMemberCount: 1,
      })),
    })

    await expect(
      removeOrDeactivateTeam(
        {
          teamId: team.id,
          confirmationName: team.name,
          expectedVersion: 1,
          at: "2026-08-09T12:00:00.000Z",
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("CONFLICT")
  })

  it("rejects removal when the team is already inactive", async () => {
    const repository = createRepository({
      getRemovalContextForUpdate: vi.fn(async () => ({
        team: { ...team, isActive: false },
        registrationStatuses: ["APPROVED"],
        totalLegacyMemberCount: 1,
      })),
    })

    await expect(
      removeOrDeactivateTeam(
        {
          teamId: team.id,
          confirmationName: team.name,
          expectedVersion: team.version,
          at: "2026-08-09T12:00:00.000Z",
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("TEAM_INACTIVE")
  })

  it("requires the trimmed confirmation to match the team name exactly", async () => {
    const repository = createRepository({
      getRemovalContextForUpdate: vi.fn(async () => ({
        team,
        registrationStatuses: ["APPROVED"],
        totalLegacyMemberCount: 1,
      })),
    })

    await expect(
      removeOrDeactivateTeam(
        {
          teamId: team.id,
          confirmationName: team.name.toLowerCase(),
          expectedVersion: team.version,
          at: "2026-08-09T12:00:00.000Z",
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("TEAM_NAME_CONFIRMATION_MISMATCH")

    expect(repository.deleteTeam).not.toHaveBeenCalled()
    expect(repository.deactivateTeam).not.toHaveBeenCalled()
  })

  it("hides another manager's team when removing it", async () => {
    const repository = createRepository({
      getRemovalContextForUpdate: vi.fn(async () => ({
        team: { ...team, ownerId: "manager-2" },
        registrationStatuses: [],
        totalLegacyMemberCount: 1,
      })),
    })

    await expect(
      removeOrDeactivateTeam(
        {
          teamId: team.id,
          confirmationName: team.name,
          expectedVersion: team.version,
          at: "2026-08-09T12:00:00.000Z",
        },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("audits an admin team removal override as a second event", async () => {
    const otherOwnerTeam = { ...team, ownerId: "manager-2" }
    const repository = createRepository({
      getRemovalContextForUpdate: vi.fn(async () => ({
        team: otherOwnerTeam,
        registrationStatuses: ["REJECTED"],
        totalLegacyMemberCount: 1,
      })),
    })

    await removeOrDeactivateTeam(
      {
        teamId: team.id,
        confirmationName: team.name,
        expectedVersion: team.version,
        at: "2026-08-09T12:00:00.000Z",
      },
      platformAdmin,
      { teams: repository },
    )

    expect(repository.appendAuditEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ action: "team.deactivated", entityId: team.id }),
    )
    expect(repository.appendAuditEvent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ action: "team.admin_override", entityId: team.id }),
    )
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

  it("projects reusable player history owned by the authorized manager", async () => {
    const sources: TeamPlayerHistorySource[] = [
      {
        ...playerFromDraft(draftPlayer("One", 4)),
        teamName: team.name,
      },
    ]
    const repository = createRepository({
      listPlayerHistoryByOwner: vi.fn(async () => sources),
    })

    await expect(
      listReusableTeamPlayers(teamManager, { teams: repository }),
    ).resolves.toEqual(projectReusableTeamPlayers(sources))
    expect(repository.listPlayerHistoryByOwner).toHaveBeenCalledWith(teamManager.id)
  })

  it("keeps reusable player history scoped to the platform admin actor id", async () => {
    const repository = createRepository()

    await listReusableTeamPlayers(platformAdmin, { teams: repository })

    expect(repository.listPlayerHistoryByOwner).toHaveBeenCalledWith(platformAdmin.id)
  })

  it("rejects actors without team.create before reading reusable player history", async () => {
    const repository = createRepository()

    await expect(
      listReusableTeamPlayers(playerActor, { teams: repository }),
    ).rejects.toThrow("FORBIDDEN")
    expect(repository.listPlayerHistoryByOwner).not.toHaveBeenCalled()
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
      legacyReconciliation: null,
    })
  })

  it("reports legacy reconciliation readiness while keeping legacy members out of the roster", async () => {
    const repository = createRepository({
      listActivePlayers: vi.fn(async () => []),
      listLegacyReconciliationContexts: vi.fn(async () => [
        {
          teamId: team.id,
          format: team.format,
          activeLegacyPlayerCount: 2,
          activeLegacyCoachCount: 1,
          inactiveLegacyPlayerCount: 0,
          inactiveLegacyCoachCount: 0,
          totalLegacyMemberCount: 3,
          activeTeamPlayerCount: 0,
          registrationHistoryCount: 2,
          registrationStatusCounts: {
            PENDING: 0,
            APPROVED: 0,
            REJECTED: 1,
            CANCELLED: 0,
            WITHDRAWN: 1,
          },
        },
      ]),
    })

    await expect(
      getOwnedTeamWorkspace(team.id, teamManager, { teams: repository }),
    ).resolves.toEqual({
      team,
      players: [],
      legacyReconciliation: {
        teamId: team.id,
        format: "FIVE_V_FIVE",
        activeLegacyPlayerCount: 2,
        activeLegacyCoachCount: 1,
        inactiveLegacyPlayerCount: 0,
        inactiveLegacyCoachCount: 0,
        totalLegacyMemberCount: 3,
        activeLegacyMemberCount: 3,
        inactiveLegacyMemberCount: 0,
        activeTeamPlayerCount: 0,
        registrationHistoryCount: 2,
        registrationStatusCounts: {
          PENDING: 0,
          APPROVED: 0,
          REJECTED: 1,
          CANCELLED: 0,
          WITHDRAWN: 1,
        },
        readyForLegacyRemoval: false,
        issues: [
          "LEGACY_PLAYERS_REQUIRE_MANUAL_REENTRY",
          "LEGACY_COACHES_REQUIRE_REVIEW",
          "TEAM_FORMAT_REQUIRES_REVIEW",
        ],
      },
    })
    expect(repository.listActivePlayers).toHaveBeenCalledWith(team.id)
  })

  it("reports inactive-only legacy history as preserved and not ready for removal", async () => {
    const repository = createRepository({
      listActivePlayers: vi.fn(async () => []),
      listLegacyReconciliationContexts: vi.fn(async () => [
        {
          teamId: team.id,
          format: team.format,
          activeLegacyPlayerCount: 0,
          activeLegacyCoachCount: 0,
          inactiveLegacyPlayerCount: 2,
          inactiveLegacyCoachCount: 1,
          totalLegacyMemberCount: 3,
          activeTeamPlayerCount: 0,
          registrationHistoryCount: 0,
          registrationStatusCounts: {
            PENDING: 0,
            APPROVED: 0,
            REJECTED: 0,
            CANCELLED: 0,
            WITHDRAWN: 0,
          },
        },
      ]),
    })

    const workspace = await getOwnedTeamWorkspace(team.id, teamManager, {
      teams: repository,
    })

    expect(workspace.players).toEqual([])
    expect(workspace.legacyReconciliation).toMatchObject({
      activeLegacyMemberCount: 0,
      inactiveLegacyMemberCount: 3,
      totalLegacyMemberCount: 3,
      readyForLegacyRemoval: false,
      issues: [
        "INACTIVE_LEGACY_HISTORY_REQUIRES_PRESERVATION",
        "TEAM_FORMAT_REQUIRES_REVIEW",
      ],
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
