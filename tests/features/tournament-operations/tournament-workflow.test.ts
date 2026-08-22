import { describe, expect, it, vi } from "vitest"

import {
  createTournament,
  submitTournament,
  updateTournament,
} from "@/features/tournament-operations/application/create-tournament"
import { reviewTournament } from "@/features/tournament-operations/application/review-tournament"
import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const admin = createTestActor("admin-1", "PLATFORM_ADMIN")

const validInput = {
  title: "Bangkok Admin Cup",
  description: "รายการแข่งขันสำหรับการทดสอบ",
  rules: "กติกามาตรฐาน",
  provinceCode: "10",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  startsAt: "2026-11-15T09:00:00+07:00",
  endsAt: "2026-11-16T18:00:00+07:00",
  registrationDeadline: "2026-11-01T23:59:00+07:00",
  capacity: 16,
}

describe("tournament workflow", () => {
  it("creates a draft owned by the organizer", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, validInput, organizer)

    expect(tournament).toMatchObject({ status: "DRAFT", organizerId: organizer.id, version: 0 })
  })

  it("submits a complete draft for review", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, validInput, organizer)

    const submitted = await submitTournament(repository, tournament.id, organizer)

    expect(submitted.status).toBe("SUBMITTED")
  })

  it("updates the displayed province and audit snapshot from a new province code", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, validInput, organizer)

    const updated = await updateTournament(
      repository,
      tournament.id,
      { ...validInput, provinceCode: "92", version: tournament.version },
      organizer,
    )

    expect(updated).toMatchObject({ provinceCode: "92", province: "ตรัง" })
    expect(repository.audits.at(-1)?.after).toMatchObject({
      provinceCode: "92",
      province: "ตรัง",
    })
  })

  it.each([6, 10, 32])("accepts an even capacity of %i", async (capacity) => {
    const repository = new InMemoryTournamentOperationsRepository()

    await expect(
      createTournament(repository, { ...validInput, capacity }, organizer),
    ).resolves.toMatchObject({ capacity })
  })

  it.each([5, 7, 10.5, 33])(
    "rejects an invalid capacity of %s",
    async (capacity) => {
      const repository = new InMemoryTournamentOperationsRepository()

      await expect(
        createTournament(repository, { ...validInput, capacity }, organizer),
      ).rejects.toThrow("CAPACITY_INVALID")
    },
  )

  it.each(["U12", "U14", "U16", "U18", "U23", "Open"])(
    "accepts the canonical age group %s",
    async (ageGroup) => {
      const repository = new InMemoryTournamentOperationsRepository()

      await expect(
        createTournament(repository, { ...validInput, ageGroup }, organizer),
      ).resolves.toMatchObject({ ageGroup })
    },
  )

  it.each(["", "U20", "35+", "open"])(
    "rejects the unsupported age group %s",
    async (ageGroup) => {
      const repository = new InMemoryTournamentOperationsRepository()

      await expect(
        createTournament(repository, { ...validInput, ageGroup }, organizer),
      ).rejects.toThrow("AGE_GROUP_INVALID")
    },
  )

  it("requires a note when an admin requests changes", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, validInput, organizer)

    await expect(
      reviewTournament(repository, tournament.id, { decision: "CHANGES_REQUESTED", note: "", version: tournament.version }, admin),
    ).rejects.toThrow("REVIEW_NOTE_REQUIRED")
  })

  it("blocks updating a suspended tournament before persistence", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, validInput, organizer)
    await repository.updateWithVersion(tournament.id, tournament.version, {
      governanceStatus: "SUSPENDED",
    })
    const updateWithVersion = vi.spyOn(repository, "updateWithVersion")
    updateWithVersion.mockClear()

    await expect(
      updateTournament(
        repository,
        tournament.id,
        { ...validInput, title: "Blocked edit", version: 1 },
        organizer,
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(updateWithVersion).not.toHaveBeenCalled()
  })

  it("blocks submitting a removed tournament before persistence", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await createTournament(repository, validInput, organizer)
    await repository.updateWithVersion(tournament.id, tournament.version, {
      governanceStatus: "REMOVED",
    })
    const updateWithVersion = vi.spyOn(repository, "updateWithVersion")
    updateWithVersion.mockClear()

    await expect(
      submitTournament(repository, tournament.id, organizer),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_REMOVED"] })
    expect(updateWithVersion).not.toHaveBeenCalled()
  })
})
