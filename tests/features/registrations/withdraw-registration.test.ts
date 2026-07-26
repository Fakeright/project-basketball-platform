import { describe, expect, it, vi } from "vitest"

import type { RegistrationRepository } from "@/features/registrations/application/ports/registration-repository"
import { withdrawRegistration } from "@/features/registrations/application/withdraw-registration"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"

const organizer = { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" } as const
const anotherOrganizer = {
  id: "organizer-2",
  role: "TOURNAMENT_ORGANIZER",
} as const

const approvedRegistration: TournamentRegistration = {
  id: "registration-1",
  tournamentId: "tournament-1",
  teamId: "team-1",
  status: "APPROVED",
  decisionNote: null,
  decidedAt: "2026-10-02T00:00:00.000Z",
  cancelledAt: null,
  withdrawnAt: null,
  version: 1,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-02T00:00:00.000Z",
}

function createRepository(
  overrides: Record<string, unknown> = {},
): RegistrationRepository {
  const repository = {
    findReviewContext: vi.fn(async () => ({
      registration: approvedRegistration,
      tournament: {
        id: "tournament-1",
        title: "Bangkok Open",
        organizerId: organizer.id,
        status: "REGISTRATION_CLOSED" as const,
        capacity: 8,
      },
    })),
    withdrawWithVersion: vi.fn(async () => ({
      ...approvedRegistration,
      status: "WITHDRAWN" as const,
      version: 2,
    })),
    inTransaction: vi.fn(
      async (operation: (transaction: RegistrationRepository) => unknown) =>
        operation(repository as unknown as RegistrationRepository),
    ),
    ...overrides,
  }
  return repository as unknown as RegistrationRepository
}

describe("withdrawRegistration", () => {
  it("requires a trimmed withdrawal reason", async () => {
    const repository = createRepository()

    await expect(
      withdrawRegistration(
        {
          tournamentId: "tournament-1",
          registrationId: approvedRegistration.id,
          reason: " ",
          version: 1,
        },
        organizer,
        {
          registrations: repository,
          now: () => new Date("2026-10-03T00:00:00.000Z"),
        },
      ),
    ).rejects.toThrow("REASON_REQUIRED")

    expect(repository.withdrawWithVersion).not.toHaveBeenCalled()
  })

  it("hides the approved registration from another organizer", async () => {
    await expect(
      withdrawRegistration(
        {
          tournamentId: "tournament-1",
          registrationId: approvedRegistration.id,
          reason: "Eligibility issue",
          version: 1,
        },
        anotherOrganizer,
        {
          registrations: createRepository(),
          now: () => new Date("2026-10-03T00:00:00.000Z"),
        },
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("withdraws only the approved registration version with the reason", async () => {
    const repository = createRepository()

    await withdrawRegistration(
      {
        tournamentId: "tournament-1",
        registrationId: approvedRegistration.id,
        reason: "  Eligibility issue  ",
        version: 1,
      },
      organizer,
      {
        registrations: repository,
        now: () => new Date("2026-10-03T00:00:00.000Z"),
      },
    )

    expect(repository.withdrawWithVersion).toHaveBeenCalledWith({
      before: approvedRegistration,
      version: 1,
      reason: "Eligibility issue",
      actorId: organizer.id,
      at: "2026-10-03T00:00:00.000Z",
      adminOverride: false,
    })
  })
})
