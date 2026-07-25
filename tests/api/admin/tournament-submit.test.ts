import { describe, expect, it } from "vitest"

import { saveTournamentHandler } from "@/features/admin/presentation/save-tournament-handler"
import { submitTournamentHandler } from "@/features/admin/presentation/submit-tournament-handler"
import { InMemoryTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository"

const validTournament = {
  title: "Chiang Rai Cup",
  description: "การแข่งขันระดับชุมชน",
  province: "เชียงราย",
  venue: "สนามกีฬากลาง",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  startsAt: "2026-12-10T09:00:00+07:00",
  endsAt: "2026-12-11T18:00:00+07:00",
  registrationDeadline: "2026-12-01T23:59:00+07:00",
  capacity: 16,
  rules: "ใช้กติกามาตรฐาน",
}

describe("submitTournamentHandler", () => {
  it("submits an owned organizer draft", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await repository.create({
      ...validTournament,
      organizerId: "organizer-1",
    })

    const response = await submitTournamentHandler({
      actor: { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" },
      id: tournament.id,
      repository,
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      tournament: { status: "SUBMITTED" },
    })
  })

  it("rejects an organizer submitting another organizer's draft", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await repository.create({
      ...validTournament,
      organizerId: "organizer-2",
    })

    const response = await submitTournamentHandler({
      actor: { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" },
      id: tournament.id,
      repository,
    })

    expect(response.status).toBe(403)
  })
})

describe("saveTournamentHandler", () => {
  it("returns 422 when required draft data is missing", async () => {
    const response = await saveTournamentHandler({
      actor: { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" },
      request: new Request("http://localhost/api/admin/tournaments", {
        method: "POST",
        body: JSON.stringify({ title: "Incomplete Cup" }),
      }),
      repository: new InMemoryTournamentOperationsRepository(),
    })

    expect(response.status).toBe(422)
  })

  it("returns 409 when an editor saves a stale version", async () => {
    const repository = new InMemoryTournamentOperationsRepository()
    const tournament = await repository.create({
      ...validTournament,
      organizerId: "organizer-1",
    })
    await repository.updateWithVersion(tournament.id, 0, {
      title: "Updated elsewhere",
    })

    const response = await saveTournamentHandler({
      actor: { id: "organizer-1", role: "TOURNAMENT_ORGANIZER" },
      id: tournament.id,
      request: new Request(
        `http://localhost/api/admin/tournaments/${tournament.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ ...validTournament, version: 0 }),
        },
      ),
      repository,
    })

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      message: "ข้อมูลถูกแก้ไขจากอีกหน้าต่าง กรุณาโหลดใหม่",
    })
  })
})
