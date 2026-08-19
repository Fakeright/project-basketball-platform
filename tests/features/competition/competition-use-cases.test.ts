import { describe, expect, it, vi } from "vitest"

import { lockBracketEntries } from "@/features/competition/application/lock-bracket-entries"
import type { CompetitionRepository } from "@/features/competition/application/ports/competition-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")

function createRepository(
  context: Awaited<ReturnType<CompetitionRepository["findLockContext"]>>,
): CompetitionRepository {
  const transaction = {
    findLockContext: vi.fn(async () => context),
    lockEntries: vi.fn(async () => ({
      id: "bracket-1",
      tournamentId: "tournament-1",
      version: 1,
      entries: [
        { teamId: "team-1", teamNameSnapshot: "Team One" },
        { teamId: "team-2", teamNameSnapshot: "Team Two" },
      ],
    })),
    persistGeneratedPlan: vi.fn(),
  }
  return {
    ...transaction,
    inTransaction: vi.fn(
      async (
        operation: (repository: typeof transaction) => Promise<unknown>,
      ) => operation(transaction),
    ),
  }
}

describe("lockBracketEntries", () => {
  it("hides another organizer's tournament", async () => {
    const repository = createRepository({
      tournamentId: "tournament-1",
      organizerId: "another-organizer",
      tournamentStatus: "REGISTRATION_CLOSED",
      capacity: 6,
      version: 0,
      approvedEntries: [],
      hasStartedMatch: false,
    })

    await expect(
      lockBracketEntries(
        { tournamentId: "tournament-1", expectedVersion: 0 },
        organizer,
        { competitions: repository, now: () => new Date("2026-08-19T05:00:00Z") },
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("locks approved team snapshots for the owning organizer", async () => {
    const repository = createRepository({
      tournamentId: "tournament-1",
      organizerId: organizer.id,
      tournamentStatus: "REGISTRATION_CLOSED",
      capacity: 6,
      version: 0,
      approvedEntries: [
        {
          registrationId: "registration-1",
          teamId: "team-1",
          teamName: "Team One",
        },
        {
          registrationId: "registration-2",
          teamId: "team-2",
          teamName: "Team Two",
        },
      ],
      hasStartedMatch: false,
    })

    await expect(
      lockBracketEntries(
        { tournamentId: "tournament-1", expectedVersion: 0 },
        organizer,
        { competitions: repository, now: () => new Date("2026-08-19T05:00:00Z") },
      ),
    ).resolves.toMatchObject({
      entries: [{ teamId: "team-1" }, { teamId: "team-2" }],
    })
  })
})
