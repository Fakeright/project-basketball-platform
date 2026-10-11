import { describe, expect, it, vi } from "vitest"

import { governTournament } from "@/features/tournament-operations/application/govern-tournament"
import {
  TournamentGovernancePolicyError,
} from "@/features/tournament-operations/domain/tournament-governance-policy"
import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const admin = createTestActor("admin-1", "PLATFORM_ADMIN")
const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const now = () => new Date("2026-08-22T10:00:00.000Z")

const tournamentInput = {
  title: "Governance Cup",
  description: "การแข่งขันบาสเกตบอล",
  rules: "กติกามาตรฐาน",
  provinceCode: "10",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  startsAt: "2026-11-15T02:00:00.000Z",
  endsAt: "2026-11-16T11:00:00.000Z",
  registrationDeadline: "2026-11-01T16:59:00.000Z",
  capacity: 16,
  organizerId: organizer.id,
}

describe("governTournament", () => {
  it.each(["existing-tournament", "missing-tournament"])(
    "rejects non-admin governance for an %s without a repository lookup",
    async (resource) => {
    const { repository, tournament } = await createRepository()
    const findGovernanceContext = vi.spyOn(
      repository,
      "findGovernanceContext",
    )
    const tournamentId =
      resource === "existing-tournament" ? tournament.id : "missing-tournament"

    await expect(
      governTournament(
        repository,
        {
          action: "SUSPEND",
          tournamentId,
          version: tournament.version,
          reason: "ตรวจสอบข้อมูลผู้จัด",
        },
        organizer,
        { now },
      ),
    ).rejects.toThrow("FORBIDDEN")
    expect(findGovernanceContext).not.toHaveBeenCalled()
    },
  )

  it.each([
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
  ] as const)(
    "derives the %s transition target from the command action",
    async (action, status, governanceStatus, expectedStatus, expectedGovernanceStatus) => {
      const { repository, tournament } = await createRepository({
        status,
        governanceStatus,
      })

      const governed = await governTournament(
        repository,
        {
          action,
          tournamentId: tournament.id,
          version: tournament.version,
          reason: "  ตรวจสอบข้อมูลผู้จัด  ",
        },
        admin,
        { now },
      )

      expect(governed).toEqual(
        expect.objectContaining({
          status: expectedStatus,
          governanceStatus: expectedGovernanceStatus,
          version: tournament.version + 1,
        }),
      )
      expect(repository.audits.at(-1)).toEqual(
        expect.objectContaining({
          after: expect.objectContaining({
            transitionReason: "ตรวจสอบข้อมูลผู้จัด",
          }),
        }),
      )
    },
  )

  it("permanently deletes an empty draft only after an exact trimmed title confirmation", async () => {
    const { repository, tournament } = await createRepository()

    await expect(
      governTournament(
        repository,
        {
          action: "PERMANENT_DELETE",
          tournamentId: tournament.id,
          version: tournament.version,
          reason: "ลบรายการทดสอบ",
          confirmationTitle: "  Governance Cup  ",
        },
        admin,
        { now },
      ),
    ).resolves.toBeNull()
    await expect(repository.findById(tournament.id)).resolves.toBeNull()
  })

  it("rejects stale commands before a governance transition", async () => {
    const { repository, tournament } = await createRepository()

    await expect(
      governTournament(
        repository,
        {
          action: "SUSPEND",
          tournamentId: tournament.id,
          version: tournament.version - 1,
          reason: "ตรวจสอบข้อมูลผู้จัด",
        },
        admin,
        { now },
      ),
    ).rejects.toThrow("CONFLICT")
  })

  it("uses the domain validator for trimmed governance reasons", async () => {
    const { repository, tournament } = await createRepository()

    await expect(
      governTournament(
        repository,
        {
          action: "SUSPEND",
          tournamentId: tournament.id,
          version: tournament.version,
          reason: "  ",
        },
        admin,
        { now },
      ),
    ).rejects.toEqual(
      expect.objectContaining<TournamentGovernancePolicyError>({
        issues: ["GOVERNANCE_REASON_REQUIRED"],
      }),
    )
  })

  it("rejects commands that violate governance policy", async () => {
    const { repository, tournament } = await createRepository({
      governanceStatus: "SUSPENDED",
    })

    await expect(
      governTournament(
        repository,
        {
          action: "ARCHIVE",
          tournamentId: tournament.id,
          version: tournament.version,
          reason: "จัดเก็บรายการ",
        },
        admin,
        { now },
      ),
    ).rejects.toEqual(
      expect.objectContaining<TournamentGovernancePolicyError>({
        issues: ["GOVERNANCE_STATUS_INVALID", "TOURNAMENT_STATUS_INVALID"],
      }),
    )
  })
})

async function createRepository(
  overrides: {
    status?: "DRAFT" | "COMPLETED" | "REGISTRATION_CLOSED"
    governanceStatus?: "ACTIVE" | "SUSPENDED"
  } = {},
) {
  const repository = new InMemoryTournamentOperationsRepository()
  let tournament = await repository.create(tournamentInput)
  const status = overrides.status ?? tournament.status
  const governanceStatus = overrides.governanceStatus ?? tournament.governanceStatus

  if (status !== tournament.status || governanceStatus !== tournament.governanceStatus) {
    tournament = await repository.updateWithVersion(tournament.id, tournament.version, {
      status,
      governanceStatus,
    })
  }

  return { repository, tournament }
}
