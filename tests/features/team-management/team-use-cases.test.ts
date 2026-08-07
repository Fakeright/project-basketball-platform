import { describe, expect, it, vi } from "vitest"

import { addTeamMember } from "@/features/team-management/application/add-team-member"
import { addTeamPlayers } from "@/features/team-management/application/add-team-players"
import { createTeam } from "@/features/team-management/application/create-team"
import { deactivateTeamMember } from "@/features/team-management/application/deactivate-team-member"
import { deactivateTeamPlayer } from "@/features/team-management/application/deactivate-team-player"
import { getOwnedTeamWorkspace } from "@/features/team-management/application/get-owned-team-workspace"
import { listOwnedTeams } from "@/features/team-management/application/list-owned-teams"
import { listTeamMemberCandidates } from "@/features/team-management/application/list-team-member-candidates"
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
    listByOwner: vi.fn(async () => [team]),
    update: vi.fn(async (id, input) => ({ ...team, id, ...input })),
    findUser: vi.fn(async () => ({
      id: "player-1",
      displayName: "Player One",
      role: "PLAYER",
    })),
    listUsersByRoles: vi.fn(async () => [
      { id: "player-1", displayName: "Player One", role: "PLAYER" },
    ]),
    listActiveMembers: vi.fn(async () => []),
    listActivePlayers: vi.fn(async () => []),
    addMember: vi.fn(async (input) => ({
      id: "membership-1",
      ...input,
      isActive: true,
      deactivatedAt: null,
    })),
    deactivateMember: vi.fn(async () => undefined),
    addPlayers: vi.fn(async (teamId, players) =>
      players.map((player, index) =>
        playerFromDraft(player, { id: `player-${index + 1}`, teamId }),
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

  it("records reactivated player ids in the batch audit event", async () => {
    const reactivated = playerFromDraft(draftPlayer("one", 4), {
      id: "player-old",
      createdAt: "2025-08-07T00:00:00.000Z",
      updatedAt: "2026-08-07T00:00:00.000Z",
    })
    const repository = createRepository({ addPlayers: vi.fn(async () => [reactivated]) })

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
      { name: "Chiang Mai Hoops", provinceCode: "50" },
      teamManager,
      { teams: repository },
    )

    expect(created.ownerId).toBe(teamManager.id)
    expect(repository.create).toHaveBeenCalledWith({
      name: "Chiang Mai Hoops",
      provinceCode: "50",
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
      findById: vi.fn(async () => ({ ...team, ownerId: "manager-2" })),
    })

    await expect(
      updateTeam(
        { teamId: team.id, name: "Changed", provinceCode: "10" },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("audits an admin override separately from the team update", async () => {
    const repository = createRepository({
      findById: vi.fn(async () => ({ ...team, ownerId: "manager-2" })),
    })

    await updateTeam(
      { teamId: team.id, name: "Changed", provinceCode: "10" },
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

  it("rejects adding a global player as a coach", async () => {
    const repository = createRepository()

    await expect(
      addTeamMember(
        { teamId: team.id, userId: "player-1", role: "COACH" },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("MEMBER_ROLE_MISMATCH")
  })

  it("audits a roster member addition", async () => {
    const repository = createRepository()

    await addTeamMember(
      { teamId: team.id, userId: "player-1", role: "PLAYER" },
      teamManager,
      { teams: repository },
    )

    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "team.member_added", entityId: team.id }),
    )
  })

  it("deactivates an active member and audits the mutation", async () => {
    const repository = createRepository({
      listActiveMembers: vi.fn(async () => [
        {
          id: "membership-1",
          userId: "player-1",
          role: "PLAYER",
          isActive: true,
          deactivatedAt: null,
        },
      ]),
    })

    await deactivateTeamMember(
      { teamId: team.id, memberId: "membership-1", at: "2026-07-26T00:00:00.000Z" },
      teamManager,
      { teams: repository },
    )

    expect(repository.deactivateMember).toHaveBeenCalledWith(
      team.id,
      "membership-1",
      "2026-07-26T00:00:00.000Z",
    )
    expect(repository.appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "team.member_deactivated", entityId: team.id }),
    )
  })

  it("lists only teams owned by the authorized manager", async () => {
    const repository = createRepository()

    const teams = await listOwnedTeams(teamManager, { teams: repository })

    expect(teams).toEqual([team])
    expect(repository.listByOwner).toHaveBeenCalledWith(teamManager.id)
  })

  it("loads only an owned team's active roster for the workspace", async () => {
    const repository = createRepository({
      listActiveMembers: vi.fn(async () => [
        {
          id: "membership-1",
          userId: "player-1",
          role: "PLAYER",
          isActive: true,
          deactivatedAt: null,
        },
      ]),
    })

    await expect(
      getOwnedTeamWorkspace(team.id, teamManager, { teams: repository }),
    ).resolves.toEqual({
      team,
      members: [
        {
          id: "membership-1",
          userId: "player-1",
          role: "PLAYER",
          isActive: true,
          deactivatedAt: null,
        },
      ],
      players: [],
    })
  })

  it("lists only player candidates for an owned roster", async () => {
    const repository = createRepository()

    const candidates = await listTeamMemberCandidates(team.id, teamManager, {
      teams: repository,
    })

    expect(candidates).toEqual([
      { id: "player-1", displayName: "Player One", role: "PLAYER" },
    ])
    expect(repository.listUsersByRoles).toHaveBeenCalledWith(["PLAYER"])
  })

  it("performs each team mutation in a repository transaction", async () => {
    const repository = createRepository({
      listActiveMembers: vi.fn(async () => [
        {
          id: "membership-1",
          userId: "player-1",
          role: "PLAYER",
          isActive: true,
          deactivatedAt: null,
        },
      ]),
    })

    await createTeam({ name: "Khon Kaen Hoops", provinceCode: "40" }, teamManager, {
      teams: repository,
    })
    await updateTeam(
      { teamId: team.id, name: "Changed", provinceCode: "10" },
      teamManager,
      { teams: repository },
    )
    await addTeamMember(
      { teamId: team.id, userId: "player-1", role: "PLAYER" },
      teamManager,
      { teams: repository },
    )
    await deactivateTeamMember(
      { teamId: team.id, memberId: "membership-1", at: "2026-07-26T00:00:00.000Z" },
      teamManager,
      { teams: repository },
    )

    expect(repository.inTransaction).toHaveBeenCalledTimes(4)
  })

  it("does not commit a team update when its audit write fails", async () => {
    let persistedTeam = { ...team }
    const repository = createRepository({
      findById: vi.fn(async () => persistedTeam),
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
        { teamId: team.id, name: "Changed", provinceCode: "10" },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("AUDIT_FAILED")

    expect(persistedTeam).toEqual(team)
  })
})
