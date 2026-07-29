import { describe, expect, it, vi } from "vitest"

import { addTeamMember } from "@/features/team-management/application/add-team-member"
import { createTeam } from "@/features/team-management/application/create-team"
import { deactivateTeamMember } from "@/features/team-management/application/deactivate-team-member"
import { getOwnedTeamWorkspace } from "@/features/team-management/application/get-owned-team-workspace"
import { listOwnedTeams } from "@/features/team-management/application/list-owned-teams"
import { listTeamMemberCandidates } from "@/features/team-management/application/list-team-member-candidates"
import type { TeamRepository } from "@/features/team-management/application/ports/team-repository"
import { updateTeam } from "@/features/team-management/application/update-team"
import { createTestActor } from "@/tests/fixtures/actor"

const teamManager = createTestActor("manager-1", "TEAM_MANAGER")
const platformAdmin = createTestActor("admin-1", "PLATFORM_ADMIN")

const team = {
  id: "team-1",
  name: "Bangkok Ballers",
  province: "Bangkok",
  ownerId: teamManager.id,
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
      { id: "coach-1", displayName: "Coach One", role: "COACH" },
    ]),
    listActiveMembers: vi.fn(async () => []),
    addMember: vi.fn(async (input) => ({
      id: "membership-1",
      ...input,
      isActive: true,
      deactivatedAt: null,
    })),
    deactivateMember: vi.fn(async () => undefined),
    appendAuditEvent: vi.fn(async () => undefined),
    inTransaction: vi.fn(async (operation) => operation(repository)),
    ...overrides,
  }
  return repository
}

describe("team use cases", () => {
  it("creates a team owned by the team manager and audits the mutation", async () => {
    const repository = createRepository()

    const created = await createTeam(
      { name: "Chiang Mai Hoops", province: "Chiang Mai" },
      teamManager,
      { teams: repository },
    )

    expect(created.ownerId).toBe(teamManager.id)
    expect(repository.create).toHaveBeenCalledWith({
      name: "Chiang Mai Hoops",
      province: "Chiang Mai",
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
        { teamId: team.id, name: "Changed", province: "Bangkok" },
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
      { teamId: team.id, name: "Changed", province: "Bangkok" },
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
    })
  })

  it("lists only player and coach candidates for an owned roster", async () => {
    const repository = createRepository()

    const candidates = await listTeamMemberCandidates(team.id, teamManager, {
      teams: repository,
    })

    expect(candidates).toEqual([
      { id: "player-1", displayName: "Player One", role: "PLAYER" },
      { id: "coach-1", displayName: "Coach One", role: "COACH" },
    ])
    expect(repository.listUsersByRoles).toHaveBeenCalledWith(["PLAYER", "COACH"])
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

    await createTeam({ name: "Khon Kaen Hoops", province: "Khon Kaen" }, teamManager, {
      teams: repository,
    })
    await updateTeam(
      { teamId: team.id, name: "Changed", province: "Bangkok" },
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
        { teamId: team.id, name: "Changed", province: "Bangkok" },
        teamManager,
        { teams: repository },
      ),
    ).rejects.toThrow("AUDIT_FAILED")

    expect(persistedTeam).toEqual(team)
  })
})
