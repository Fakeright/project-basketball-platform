import { describe, expect, it } from "vitest"

import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"

const tournamentInput = {
  title: "COURTSIDE Open",
  description: "Tournament description",
  rules: "Tournament rules",
  provinceCode: "10",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  startsAt: "2026-11-15T02:00:00.000Z",
  endsAt: "2026-11-16T11:00:00.000Z",
  registrationDeadline: "2026-11-01T16:59:00.000Z",
  capacity: 16,
  organizerId: "organizer-1",
}

describe("TournamentOperationsRepository governance contract", () => {
  it("returns a dependency-free governance context for an in-memory draft", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await repository.create(tournamentInput)

    await expect(
      repository.findGovernanceContext(tournament.id),
    ).resolves.toEqual({
      tournamentId: tournament.id,
      title: "COURTSIDE Open",
      organizerId: "organizer-1",
      status: "DRAFT",
      governanceStatus: "ACTIVE",
      version: 0,
      startsAt: "2026-11-15T02:00:00.000Z",
      reviewCount: 0,
      registrationCount: 0,
      bracketCount: 0,
      matchCount: 0,
      mediaAssetCount: 0,
      activeBracket: null,
    })
  })

  it("applies a governance transition and records both reason audits", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await repository.create(tournamentInput)

    const governed = await repository.governWithVersion({
      action: "SUSPEND",
      tournamentId: tournament.id,
      expectedVersion: 0,
      sourceStatus: "DRAFT",
      sourceGovernanceStatus: "ACTIVE",
      targetStatus: "DRAFT",
      targetGovernanceStatus: "SUSPENDED",
      reason: "ตรวจสอบข้อมูลผู้จัด",
      actorId: "admin-1",
      at: "2026-08-22T10:00:00.000Z",
    })

    expect(governed).toMatchObject({
      status: "DRAFT",
      governanceStatus: "SUSPENDED",
      governanceReason: "ตรวจสอบข้อมูลผู้จัด",
      governanceUpdatedAt: "2026-08-22T10:00:00.000Z",
      version: 1,
    })
    expect(repository.audits.slice(-2)).toEqual([
      expect.objectContaining({
        action: "tournament.suspended",
        after: expect.objectContaining({
          transitionReason: "ตรวจสอบข้อมูลผู้จัด",
        }),
      }),
      expect.objectContaining({
        action: "tournament.admin_override",
        after: expect.objectContaining({
          transitionReason: "ตรวจสอบข้อมูลผู้จัด",
        }),
      }),
    ])
  })

  it("rejects a stale governance transition", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await repository.create(tournamentInput)

    await expect(
      repository.governWithVersion({
        action: "SUSPEND",
        tournamentId: tournament.id,
        expectedVersion: 3,
        sourceStatus: "DRAFT",
        sourceGovernanceStatus: "ACTIVE",
        targetStatus: "DRAFT",
        targetGovernanceStatus: "SUSPENDED",
        reason: "ตรวจสอบข้อมูลผู้จัด",
        actorId: "admin-1",
        at: "2026-08-22T10:00:00.000Z",
      }),
    ).rejects.toThrow("CONFLICT")
  })

  it("keeps tombstone audits after permanently deleting an empty draft", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await repository.create(tournamentInput)

    await repository.permanentlyDeleteWithVersion({
      tournamentId: tournament.id,
      expectedVersion: 0,
      confirmationTitle: " COURTSIDE Open ",
      reason: "สร้างรายการซ้ำ",
      actorId: "admin-1",
      at: "2026-08-22T10:00:00.000Z",
    })

    await expect(repository.findById(tournament.id)).resolves.toBeNull()
    expect(repository.audits.slice(-2)).toEqual([
      expect.objectContaining({
        action: "tournament.deleted",
        tournamentId: tournament.id,
        before: expect.objectContaining({ title: "COURTSIDE Open" }),
        after: expect.objectContaining({
          deleted: true,
          title: "COURTSIDE Open",
          transitionReason: "สร้างรายการซ้ำ",
          deletedAt: "2026-08-22T10:00:00.000Z",
        }),
      }),
      expect.objectContaining({ action: "tournament.admin_override" }),
    ])
  })
})
