import { describe, expect, it, vi } from "vitest"

import { listTournamentRegistrations } from "@/features/registrations/application/list-tournament-registrations"
import type { RegistrationRepository } from "@/features/registrations/application/ports/registration-repository"

const organizer = { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" } as const
const anotherOrganizer = {
  id: "organizer-2",
  role: "TOURNAMENT_ORGANIZER",
} as const
const platformAdmin = { id: "admin-1", role: "PLATFORM_ADMIN" } as const

function createRepository(): RegistrationRepository {
  return {
    findTournamentForReview: vi.fn(async () => ({
      id: "tournament-1",
      title: "Bangkok Open",
      organizerId: organizer.id,
      status: "PUBLISHED",
      capacity: 8,
    })),
    listByTournament: vi.fn(async () => []),
  } as unknown as RegistrationRepository
}

describe("listTournamentRegistrations", () => {
  it("lists registrations for the owning organizer", async () => {
    const repository = createRepository()

    await expect(
      listTournamentRegistrations("tournament-1", organizer, {
        registrations: repository,
      }),
    ).resolves.toEqual({
      tournament: expect.objectContaining({ title: "Bangkok Open" }),
      registrations: [],
    })
    expect(repository.listByTournament).toHaveBeenCalledWith("tournament-1")
  })

  it("prevents another organizer from viewing the registration queue", async () => {
    await expect(
      listTournamentRegistrations("tournament-1", anotherOrganizer, {
        registrations: createRepository(),
      }),
    ).rejects.toThrow("FORBIDDEN")
  })

  it("allows platform admin governance across tournaments", async () => {
    await expect(
      listTournamentRegistrations("tournament-1", platformAdmin, {
        registrations: createRepository(),
      }),
    ).resolves.toMatchObject({
      tournament: { id: "tournament-1" },
    })
  })
})
