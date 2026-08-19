import "server-only"

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type {
  TournamentOperation,
  TournamentOperationInput,
  TournamentReviewInput,
} from "@/features/tournament-operations/domain/tournament-operation"
import { findProvinceByCode } from "@/features/provinces/domain/thai-provinces"

import type {
  TournamentLifecycleTransition,
  TournamentMutationAudit,
  TournamentOperationsRepository,
  AdminTournamentFilters,
} from "./tournament-operations-repository"

interface DevelopmentState {
  tournaments: TournamentOperation[]
  reviews: Array<{
    tournamentId: string
    reviewerId: string
    decision: TournamentReviewInput["decision"]
    note: string
  }>
  audits: Array<{
    actorId: string
    action: string
    tournamentId: string
    before: TournamentOperation | null
    after: TournamentOperation
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
    audit: TournamentMutationAudit,
  ): Promise<TournamentOperation> {
    const state = await readState()
    const now = new Date().toISOString()
    const tournament: TournamentOperation = {
      ...input,
      province: provinceName(input.provinceCode),
      id: `tournament-${state.tournaments.length + 1}`,
      status: "DRAFT",
      version: 0,
      createdAt: now,
      updatedAt: now,
    }
    state.tournaments.push(tournament)
    appendDevelopmentAudit(state, audit, tournament.id, null, tournament)
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

  async listForAdmin(filters: AdminTournamentFilters) {
    const state = await readState()
    return filterAdminTournaments(state.tournaments, filters)
  }

  async listByStatus(status: TournamentOperation["status"]) {
    const state = await readState()
    return state.tournaments.filter(
      (tournament) => tournament.status === status,
    )
  }

  async updateWithVersion(
    id: string,
    version: number,
    changes: Partial<TournamentOperation>,
    audit: TournamentMutationAudit,
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
      province: provinceName(changes.provinceCode ?? current.provinceCode),
      version: version + 1,
      updatedAt: new Date().toISOString(),
    }
    state.tournaments[index] = updated
    appendDevelopmentAudit(state, audit, id, current, updated)
    await writeState(state)
    return updated
  }

  async reviewWithVersion(input: {
    tournamentId: string
    version: number
    sourceStatus: TournamentOperation["status"]
    status: TournamentOperation["status"]
    reviewerId: string
    decision: TournamentReviewInput["decision"]
    note: string
  }) {
    const state = await readState()
    const index = state.tournaments.findIndex(
      (tournament) => tournament.id === input.tournamentId,
    )
    if (index < 0) throw new Error("NOT_FOUND")

    const current = state.tournaments[index]
    if (
      current.version !== input.version ||
      current.status !== input.sourceStatus
    ) {
      throw new Error("CONFLICT")
    }

    const updated: TournamentOperation = {
      ...current,
      status: input.status,
      version: input.version + 1,
      updatedAt: new Date().toISOString(),
    }
    state.tournaments[index] = updated
    state.reviews.push(input)
    appendDevelopmentAudit(
      state,
      {
        actorId: input.reviewerId,
        action: "tournament.reviewed",
        adminOverride: false,
      },
      input.tournamentId,
      current,
      updated,
    )
    await writeState(state)
    return updated
  }

  async transitionWithVersion(input: TournamentLifecycleTransition) {
    const state = await readState()
    const index = state.tournaments.findIndex(
      (tournament) => tournament.id === input.tournamentId,
    )
    if (index < 0) throw new Error("NOT_FOUND")
    const current = state.tournaments[index]
    if (
      current.version !== input.version ||
      current.status !== input.sourceStatus
    ) {
      throw new Error("CONFLICT")
    }
    const updated: TournamentOperation = {
      ...current,
      status: input.status,
      version: input.version + 1,
      updatedAt: new Date().toISOString(),
    }
    state.tournaments[index] = updated
    appendDevelopmentAudit(
      state,
      input,
      input.tournamentId,
      current,
      updated,
    )
    await writeState(state)
    return updated
  }
}

function filterAdminTournaments(
  tournaments: TournamentOperation[],
  filters: AdminTournamentFilters,
) {
  const query = filters.query?.trim().toLocaleLowerCase("th-TH")
  return tournaments
    .filter((tournament) => !filters.status || tournament.status === filters.status)
    .filter(
      (tournament) =>
        !query ||
        [tournament.title, tournament.organizerName, tournament.province]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase("th-TH").includes(query)),
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 100)
}

function provinceName(provinceCode: string) {
  const province = findProvinceByCode(provinceCode)
  if (!province) throw new Error("INVALID_PROVINCE_CODE")
  return province.nameTh
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
  const state = JSON.parse(
    await readFile(statePath, "utf8"),
  ) as DevelopmentState
  state.audits ??= []
  return state
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
      provinceCode: "10",
      province: "กรุงเทพมหานคร",
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
    audits: [],
  }
}

function appendDevelopmentAudit(
  state: DevelopmentState,
  audit: TournamentMutationAudit,
  tournamentId: string,
  before: TournamentOperation | null,
  after: TournamentOperation,
) {
  state.audits.push({
    actorId: audit.actorId,
    action: audit.action,
    tournamentId,
    before,
    after,
  })
  if (audit.adminOverride) {
    state.audits.push({
      actorId: audit.actorId,
      action: "tournament.admin_override",
      tournamentId,
      before,
      after,
    })
  }
}
