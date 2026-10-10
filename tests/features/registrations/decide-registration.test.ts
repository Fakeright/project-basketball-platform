import { describe, expect, it, vi } from "vitest"

import { decideRegistration } from "@/features/registrations/application/decide-registration"
import type { RegistrationRepository } from "@/features/registrations/application/ports/registration-repository"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const anotherOrganizer = createTestActor("organizer-2", "TOURNAMENT_ORGANIZER")
const platformAdmin = createTestActor("admin-1", "PLATFORM_ADMIN")

const pendingRegistration: TournamentRegistration = {
  id: "registration-1",
  tournamentId: "tournament-1",
  teamId: "team-1",
  status: "PENDING",
  decisionNote: null,
  decidedAt: null,
  cancelledAt: null,
  withdrawnAt: null,
  version: 0,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
}

const reviewContext = {
  registration: pendingRegistration,
  tournament: {
    id: "tournament-1",
    title: "Bangkok Open",
    organizerId: organizer.id,
    status: "PUBLISHED" as const,
    governanceStatus: "ACTIVE" as const,
    capacity: 1,
  },
}

function createRepository(
  overrides: Record<string, unknown> = {},
): RegistrationRepository {
  const repository = {
    findReviewContext: vi.fn(async () => reviewContext),
    approveWithCapacity: vi.fn(async () => ({
      ...pendingRegistration,
      status: "APPROVED" as const,
      version: 1,
    })),
    rejectWithVersion: vi.fn(async () => ({
      ...pendingRegistration,
      status: "REJECTED" as const,
      version: 1,
    })),
    inTransaction: vi.fn(
      async (operation: (transaction: RegistrationRepository) => unknown) =>
        operation(repository as unknown as RegistrationRepository),
    ),
    ...overrides,
  }
  return repository as unknown as RegistrationRepository
}

describe("decideRegistration", () => {
  it("approves a pending registration for the owning organizer", async () => {
    const repository = createRepository()

    await decideRegistration(
      {
        tournamentId: "tournament-1",
        registrationId: pendingRegistration.id,
        decision: "APPROVE",
        note: "",
        version: 0,
      },
      organizer,
      {
        registrations: repository,
        now: () => new Date("2026-10-02T00:00:00.000Z"),
      },
    )

    expect(repository.approveWithCapacity).toHaveBeenCalledWith({
      before: pendingRegistration,
      version: 0,
      note: "",
      actorId: organizer.id,
      at: "2026-10-02T00:00:00.000Z",
      adminOverride: false,
    })
  })

  it("hides the registration from another organizer", async () => {
    await expect(
      decideRegistration(
        {
          tournamentId: "tournament-1",
          registrationId: pendingRegistration.id,
          decision: "APPROVE",
          note: "",
          version: 0,
        },
        anotherOrganizer,
        {
          registrations: createRepository(),
          now: () => new Date("2026-10-02T00:00:00.000Z"),
        },
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("requires a trimmed reason when rejecting", async () => {
    const repository = createRepository()

    await expect(
      decideRegistration(
        {
          tournamentId: "tournament-1",
          registrationId: pendingRegistration.id,
          decision: "REJECT",
          note: "   ",
          version: 0,
        },
        organizer,
        {
          registrations: repository,
          now: () => new Date("2026-10-02T00:00:00.000Z"),
        },
      ),
    ).rejects.toThrow("REASON_REQUIRED")

    expect(repository.rejectWithVersion).not.toHaveBeenCalled()
  })

  it("returns the deterministic capacity error from concurrent approval", async () => {
    const repository = createRepository({
      approveWithCapacity: vi.fn(async () => {
        throw new Error("TOURNAMENT_CAPACITY_REACHED")
      }),
    })

    await expect(
      decideRegistration(
        {
          tournamentId: "tournament-1",
          registrationId: pendingRegistration.id,
          decision: "APPROVE",
          note: "",
          version: 0,
        },
        organizer,
        {
          registrations: repository,
          now: () => new Date("2026-10-02T00:00:00.000Z"),
        },
      ),
    ).rejects.toThrow("TOURNAMENT_CAPACITY_REACHED")
  })

  it("returns a stale conflict when the submitted version changed", async () => {
    const repository = createRepository({
      rejectWithVersion: vi.fn(async () => {
        throw new Error("CONFLICT")
      }),
    })

    await expect(
      decideRegistration(
        {
          tournamentId: "tournament-1",
          registrationId: pendingRegistration.id,
          decision: "REJECT",
          note: "Roster is incomplete",
          version: 0,
        },
        organizer,
        {
          registrations: repository,
          now: () => new Date("2026-10-02T00:00:00.000Z"),
        },
      ),
    ).rejects.toThrow("CONFLICT")
  })

  it("records platform admin governance as an override", async () => {
    const repository = createRepository()

    await decideRegistration(
      {
        tournamentId: "tournament-1",
        registrationId: pendingRegistration.id,
        decision: "REJECT",
        note: "  Policy violation  ",
        version: 0,
      },
      platformAdmin,
      {
        registrations: repository,
        now: () => new Date("2026-10-02T00:00:00.000Z"),
      },
    )

    expect(repository.rejectWithVersion).toHaveBeenCalledWith({
      before: pendingRegistration,
      version: 0,
      note: "Policy violation",
      actorId: platformAdmin.id,
      at: "2026-10-02T00:00:00.000Z",
      adminOverride: true,
    })
  })

  it("hides a registration addressed through another tournament", async () => {
    await expect(
      decideRegistration(
        {
          tournamentId: "tournament-2",
          registrationId: pendingRegistration.id,
          decision: "APPROVE",
          note: "",
          version: 0,
        },
        organizer,
        {
          registrations: createRepository(),
          now: () => new Date("2026-10-02T00:00:00.000Z"),
        },
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("blocks a decision for a suspended tournament before persistence", async () => {
    const repository = createRepository({
      findReviewContext: vi.fn(async () => ({
        ...reviewContext,
        tournament: {
          ...reviewContext.tournament,
          governanceStatus: "SUSPENDED",
        },
      })),
    })

    await expect(
      decideRegistration(
        {
          tournamentId: "tournament-1",
          registrationId: pendingRegistration.id,
          decision: "APPROVE",
          note: "",
          version: 0,
        },
        organizer,
        {
          registrations: repository,
          now: () => new Date("2026-10-02T00:00:00.000Z"),
        },
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(repository.approveWithCapacity).not.toHaveBeenCalled()
  })
})
