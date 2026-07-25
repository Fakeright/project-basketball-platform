import "server-only"

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type {
  TournamentOperation,
  TournamentOperationInput,
  TournamentReviewInput,
} from "@/features/tournament-operations/domain/tournament-operation"

import type { TournamentOperationsRepository } from "./tournament-operations-repository"

interface DevelopmentState {
  tournaments: TournamentOperation[]
  reviews: Array<{
    tournamentId: string
    reviewerId: string
    decision: TournamentReviewInput["decision"]
    note: string
  }>
}

const stateDirectory = path.join(process.cwd(), ".superpowers")
const statePath = path.join(stateDirectory, "development-tournaments.json")

export async function getDevelopmentTournamentOperationsRepository() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("TOURNAMENT_REPOSITORY_NOT_CONFIGURED")
  }

  await ensureDevelopmentState()
  return new DevelopmentTournamentOperationsRepository()
}

class DevelopmentTournamentOperationsRepository
  implements TournamentOperationsRepository
{
  async create(
    input: TournamentOperationInput & { organizerId: string },
  ): Promise<TournamentOperation> {
    const state = await readState()
    const now = new Date().toISOString()
    const tournament: TournamentOperation = {
      ...input,
      id: `tournament-${state.tournaments.length + 1}`,
      status: "DRAFT",
      version: 0,
      createdAt: now,
      updatedAt: now,
    }
    state.tournaments.push(tournament)
    await writeState(state)
    return tournament
  }

  async findById(id: string) {
    const state = await readState()
    return state.tournaments.find((tournament) => tournament.id === id) ?? null
  }

  async listByOrganizer(organizerId: string) {
    const state = await readState()
    return state.tournaments.filter(
      (tournament) => tournament.organizerId === organizerId,
    )
  }

  async updateWithVersion(
    id: string,
    version: number,
    changes: Partial<TournamentOperation>,
  ) {
    const state = await readState()
    const index = state.tournaments.findIndex(
      (tournament) => tournament.id === id,
    )
    if (index < 0) throw new Error("NOT_FOUND")

    const current = state.tournaments[index]
    if (current.version !== version) throw new Error("CONFLICT")

    const updated: TournamentOperation = {
      ...current,
      ...changes,
      version: version + 1,
      updatedAt: new Date().toISOString(),
    }
    state.tournaments[index] = updated
    await writeState(state)
    return updated
  }

  async appendReview(input: DevelopmentState["reviews"][number]) {
    const state = await readState()
    state.reviews.push(input)
    await writeState(state)
  }
}

async function ensureDevelopmentState() {
  try {
    await readFile(statePath, "utf8")
  } catch {
    await mkdir(stateDirectory, { recursive: true })
    await writeState(createSeedState())
  }
}

async function readState(): Promise<DevelopmentState> {
  return JSON.parse(await readFile(statePath, "utf8")) as DevelopmentState
}

async function writeState(state: DevelopmentState) {
  await writeFile(statePath, JSON.stringify(state, null, 2), "utf8")
}

function createSeedState(): DevelopmentState {
  const now = new Date().toISOString()
  const submissions = [
    ["Bangkok Community Cup", "organizer-1"],
    ["North Court U18", "organizer-1"],
    ["Chonburi Coast League", "organizer-2"],
  ] as const

  return {
    tournaments: submissions.map(([title, organizerId], index) => ({
      id: `tournament-${index + 1}`,
      title,
      organizerId,
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
      status: "SUBMITTED",
      version: 1,
      createdAt: now,
      updatedAt: now,
    })),
    reviews: [],
  }
}
