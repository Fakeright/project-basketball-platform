import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest"

import { getDevelopmentTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/development-tournament-operations-repository"
import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"
import type {
  TournamentGovernanceTransition,
  TournamentOperationsRepository,
} from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

const developmentFile = vi.hoisted(() => {
  const state = { json: "" }
  return {
    state,
    mkdir: vi.fn(async () => undefined),
    readFile: vi.fn(async () => state.json),
    writeFile: vi.fn(async (_path, contents) => {
      state.json = String(contents)
    }),
  }
})

vi.mock("server-only", () => ({}))
vi.mock("node:fs/promises", () => {
  const fileSystem = {
    mkdir: developmentFile.mkdir,
    readFile: developmentFile.readFile,
    writeFile: developmentFile.writeFile,
  }
  return { ...fileSystem, default: fileSystem }
})

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

const governanceTargetCases = [
  ["SUSPEND", "DRAFT", "ACTIVE", "DRAFT", "SUSPENDED"],
  ["RESUME", "DRAFT", "SUSPENDED", "DRAFT", "ACTIVE"],
  ["REMOVE", "DRAFT", "ACTIVE", "DRAFT", "REMOVED"],
  ["ARCHIVE", "COMPLETED", "ACTIVE", "ARCHIVED", "ACTIVE"],
  [
    "REOPEN_REGISTRATION",
    "REGISTRATION_CLOSED",
    "ACTIVE",
    "PUBLISHED",
    "ACTIVE",
  ],
] as const

beforeEach(() => {
  developmentFile.state.json = JSON.stringify({
    tournaments: [],
    reviews: [],
    audits: [],
  })
  vi.clearAllMocks()
})

describe("TournamentOperationsRepository governance contract", () => {
  it("does not expose caller-supplied governance target fields", () => {
    expectTypeOf<"targetStatus" extends keyof TournamentGovernanceTransition
      ? true
      : false>().toEqualTypeOf<false>()
    expectTypeOf<
      "targetGovernanceStatus" extends keyof TournamentGovernanceTransition
        ? true
        : false
    >().toEqualTypeOf<false>()
  })

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

  it.each([
    [
      "in-memory",
      async (): Promise<TournamentOperationsRepository> =>
        new InMemoryTournamentOperationsRepository(),
    ],
    [
      "development",
      async (): Promise<TournamentOperationsRepository> =>
        getDevelopmentTournamentOperationsRepository(),
    ],
  ] as const)(
    "rejects deleting a reviewed draft and preserves %s review state",
    async (adapter, createRepository) => {
      const repository = await createRepository()
      const draft = await repository.create(tournamentInput, {
        actorId: "organizer-1",
        action: "tournament.created",
        adminOverride: false,
      })
      const reviewed = await repository.reviewWithVersion({
        tournamentId: draft.id,
        version: draft.version,
        sourceStatus: "DRAFT",
        status: "DRAFT",
        reviewerId: "admin-1",
        decision: "CHANGES_REQUESTED",
        note: "ตรวจแล้ว",
      })

      await expect(
        repository.findGovernanceContext(reviewed.id),
      ).resolves.toMatchObject({ reviewCount: 1 })
      await expect(
        repository.permanentlyDeleteWithVersion({
          tournamentId: reviewed.id,
          expectedVersion: reviewed.version,
          confirmationTitle: reviewed.title,
          reason: "ลบรายการที่ตรวจแล้ว",
          actorId: "admin-1",
          at: "2026-08-22T10:00:00.000Z",
        }),
      ).rejects.toMatchObject({ issues: ["TOURNAMENT_HAS_REVIEWS"] })
      await expect(repository.findById(reviewed.id)).resolves.not.toBeNull()

      if (adapter === "in-memory") {
        expect(
          (repository as InMemoryTournamentOperationsRepository).reviews,
        ).toHaveLength(1)
      } else {
        const state = JSON.parse(developmentFile.state.json) as {
          tournaments: unknown[]
          reviews: unknown[]
        }
        expect(state.tournaments).toHaveLength(1)
        expect(state.reviews).toHaveLength(1)
      }
    },
  )

  it.each([
    [
      "in-memory",
      async (): Promise<TournamentOperationsRepository> =>
        new InMemoryTournamentOperationsRepository(),
    ],
    [
      "development",
      async (): Promise<TournamentOperationsRepository> =>
        getDevelopmentTournamentOperationsRepository(),
    ],
  ] as const)(
    "derives every governance target in the %s adapter",
    async (_adapter, createRepository) => {
      for (const [
        action,
        sourceStatus,
        sourceGovernanceStatus,
        expectedStatus,
        expectedGovernanceStatus,
      ] of governanceTargetCases) {
        const repository = await createRepository()
        const draft = await repository.create(
          { ...tournamentInput, title: `${tournamentInput.title} ${action}` },
          {
            actorId: "organizer-1",
            action: "tournament.created",
            adminOverride: false,
          },
        )
        const source =
          sourceStatus === "DRAFT" && sourceGovernanceStatus === "ACTIVE"
            ? draft
            : await repository.updateWithVersion(
                draft.id,
                draft.version,
                {
                  status: sourceStatus,
                  governanceStatus: sourceGovernanceStatus,
                },
                {
                  actorId: "system",
                  action: "tournament.updated",
                  adminOverride: false,
                },
              )

        const governed = await repository.governWithVersion({
          action,
          tournamentId: source.id,
          expectedVersion: source.version,
          sourceStatus,
          sourceGovernanceStatus,
          reason: "เหตุผลการกำกับรายการ",
          actorId: "admin-1",
          at: "2026-08-22T10:00:00.000Z",
        })

        expect(governed).toMatchObject({
          status: expectedStatus,
          governanceStatus: expectedGovernanceStatus,
        })
      }
    },
  )
})
