import "server-only"

import { InMemoryTournamentOperationsRepository } from "./in-memory-tournament-operations-repository"

let repositoryPromise:
  | Promise<InMemoryTournamentOperationsRepository>
  | undefined

export function getDevelopmentTournamentOperationsRepository() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("TOURNAMENT_REPOSITORY_NOT_CONFIGURED")
  }

  repositoryPromise ??= createSeededRepository()
  return repositoryPromise
}

async function createSeededRepository() {
  const repository = new InMemoryTournamentOperationsRepository()
  const submissions = [
    {
      title: "Bangkok Community Cup",
      organizerId: "organizer-1",
    },
    {
      title: "North Court U18",
      organizerId: "organizer-1",
    },
    {
      title: "Chonburi Coast League",
      organizerId: "organizer-2",
    },
  ] as const

  for (const submission of submissions) {
    const tournament = await repository.create({
      ...submission,
      description: "รายการตัวอย่างสำหรับคิวตรวจสอบ",
      rules: "กติกามาตรฐาน",
      province: "Bangkok",
      venue: "COURTSIDE Arena",
      format: "FIVE_V_FIVE",
      ageGroup: "Open",
      startsAt: "2026-11-15T09:00:00+07:00",
      endsAt: "2026-11-16T18:00:00+07:00",
      registrationDeadline: "2026-11-01T23:59:00+07:00",
      capacity: 16,
    })
    await repository.updateWithVersion(tournament.id, 0, {
      status: "SUBMITTED",
    })
  }

  return repository
}
