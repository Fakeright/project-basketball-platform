import "server-only"

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type {
  TournamentOperation,
  TournamentOperationInput,
  TournamentReviewInput,
} from "@/features/tournament-operations/domain/tournament-operation"
import { findProvinceByCode } from "@/features/provinces/domain/thai-provinces"
import {
  assertTournamentCanComplete,
  assertTournamentCanStart,
} from "@/features/competition/domain/tournament-competition-policy"
import {
  getTournamentGovernanceIssues,
  getTournamentGovernanceReasonIssues,
  TournamentGovernancePolicyError,
  type TournamentGovernanceContext,
} from "@/features/tournament-operations/domain/tournament-governance-policy"

import type {
  TournamentCompetitionTransition,
  TournamentCompetitionOperationContext,
  TournamentLifecycleTransition,
  TournamentMutationAudit,
  TournamentOperationsRepository,
  TournamentPermanentDelete,
  TournamentGovernanceTransition,
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
    before: object | null
    after: object
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
      governanceStatus: "ACTIVE",
      governanceReason: null,
      governanceUpdatedAt: null,
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

  async findGovernanceContext(
    id: string,
  ): Promise<TournamentGovernanceContext | null> {
    const state = await readState()
    const tournament = state.tournaments.find((candidate) => candidate.id === id)
    return tournament
      ? mapGovernanceContext(tournament, reviewCount(state, id))
      : null
  }

  async findCompetitionLifecycleContext(
    id: string,
  ): Promise<TournamentCompetitionOperationContext | null> {
    const tournament = await this.findById(id)
    return tournament
      ? {
          tournamentId: tournament.id,
          organizerId: tournament.organizerId,
          status: tournament.status,
          governanceStatus: tournament.governanceStatus,
          version: tournament.version,
          activeBracket: null,
        }
      : null
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

  async transitionWithVersion(
    input: TournamentLifecycleTransition | TournamentCompetitionTransition,
  ) {
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

  async transitionCompetitionWithVersion(
    input: TournamentCompetitionTransition,
  ) {
    const context = await this.findCompetitionLifecycleContext(
      input.tournamentId,
    )
    if (!context) throw new Error("NOT_FOUND")
    if (input.status === "IN_PROGRESS") {
      assertTournamentCanStart(context)
    } else {
      assertTournamentCanComplete(context)
    }
    return this.transitionWithVersion(input)
  }

  async governWithVersion(input: TournamentGovernanceTransition) {
    const state = await readState()
    const index = state.tournaments.findIndex(
      (tournament) => tournament.id === input.tournamentId,
    )
    if (index < 0) throw new Error("NOT_FOUND")

    const current = state.tournaments[index]
    if (
      current.version !== input.expectedVersion ||
      current.status !== input.sourceStatus ||
      current.governanceStatus !== input.sourceGovernanceStatus
    ) {
      throw new Error("CONFLICT")
    }

    const reason = input.reason.trim()
    assertGovernancePolicy(
      input.action,
      mapGovernanceContext(current, reviewCount(state, input.tournamentId)),
      input.at,
      reason,
    )
    const target = governanceTarget(input.action, input.sourceStatus)
    const updated: TournamentOperation = {
      ...current,
      status: target.status,
      governanceStatus: target.governanceStatus,
      ...(updatesGovernanceMetadata(input.action)
        ? {
            governanceReason: reason,
            governanceUpdatedAt: input.at,
          }
        : {}),
      version: input.expectedVersion + 1,
      updatedAt: input.at,
    }
    state.tournaments[index] = updated
    appendDevelopmentAudit(
      state,
      {
        actorId: input.actorId,
        action: governanceAuditAction(input.action),
        adminOverride: true,
      },
      input.tournamentId,
      current,
      { ...updated, transitionReason: reason },
    )
    await writeState(state)
    return updated
  }

  async permanentlyDeleteWithVersion(input: TournamentPermanentDelete) {
    const state = await readState()
    const index = state.tournaments.findIndex(
      (tournament) => tournament.id === input.tournamentId,
    )
    if (index < 0) throw new Error("NOT_FOUND")

    const current = state.tournaments[index]
    if (current.version !== input.expectedVersion) throw new Error("CONFLICT")

    const reason = input.reason.trim()
    assertGovernancePolicy(
      "PERMANENT_DELETE",
      mapGovernanceContext(current, reviewCount(state, input.tournamentId)),
      input.at,
      reason,
      input.confirmationTitle,
    )
    appendDevelopmentAudit(
      state,
      {
        actorId: input.actorId,
        action: "tournament.deleted",
        adminOverride: true,
      },
      input.tournamentId,
      current,
      {
        deleted: true,
        title: current.title,
        status: current.status,
        governanceStatus: current.governanceStatus,
        version: current.version,
        transitionReason: reason,
        deletedAt: input.at,
      },
    )
    state.tournaments.splice(index, 1)
    await writeState(state)
  }
}

function mapGovernanceContext(
  tournament: TournamentOperation,
  reviewCount: number,
): TournamentGovernanceContext {
  return {
    tournamentId: tournament.id,
    title: tournament.title,
    organizerId: tournament.organizerId,
    status: tournament.status,
    governanceStatus: tournament.governanceStatus,
    version: tournament.version,
    startsAt: tournament.startsAt,
    reviewCount,
    registrationCount: 0,
    bracketCount: 0,
    matchCount: 0,
    mediaAssetCount: 0,
    activeBracket: null,
  }
}

function reviewCount(state: DevelopmentState, tournamentId: string) {
  return state.reviews.filter(
    (review) => review.tournamentId === tournamentId,
  ).length
}

function assertGovernancePolicy(
  action: TournamentGovernanceTransition["action"] | "PERMANENT_DELETE",
  context: TournamentGovernanceContext,
  at: string,
  reason: string,
  confirmationTitle?: string,
) {
  const issues = [
    ...getTournamentGovernanceReasonIssues(reason),
    ...getTournamentGovernanceIssues(
      action,
      context,
      new Date(at),
      confirmationTitle,
    ),
  ]
  if (issues.length > 0) throw new TournamentGovernancePolicyError(issues)
}

function updatesGovernanceMetadata(
  action: TournamentGovernanceTransition["action"],
) {
  return action === "SUSPEND" || action === "RESUME" || action === "REMOVE"
}

function governanceTarget(
  action: TournamentGovernanceTransition["action"],
  sourceStatus: TournamentGovernanceTransition["sourceStatus"],
) {
  switch (action) {
    case "SUSPEND":
      return { status: sourceStatus, governanceStatus: "SUSPENDED" as const }
    case "RESUME":
      return { status: sourceStatus, governanceStatus: "ACTIVE" as const }
    case "REMOVE":
      return { status: sourceStatus, governanceStatus: "REMOVED" as const }
    case "ARCHIVE":
      return { status: "ARCHIVED" as const, governanceStatus: "ACTIVE" as const }
    case "REOPEN_REGISTRATION":
      return { status: "PUBLISHED" as const, governanceStatus: "ACTIVE" as const }
  }
}

function governanceAuditAction(
  action: TournamentGovernanceTransition["action"],
): TournamentMutationAudit["action"] {
  const auditActionByGovernanceAction = {
    SUSPEND: "tournament.suspended",
    RESUME: "tournament.resumed",
    REMOVE: "tournament.removed",
    ARCHIVE: "tournament.archived",
    REOPEN_REGISTRATION: "tournament.registration_reopened",
  } as const
  return auditActionByGovernanceAction[action]
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
  state.tournaments = state.tournaments.map((tournament) => ({
    ...tournament,
    governanceStatus: tournament.governanceStatus ?? "ACTIVE",
    governanceReason: tournament.governanceReason ?? null,
    governanceUpdatedAt: tournament.governanceUpdatedAt ?? null,
  }))
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
      governanceStatus: "ACTIVE",
      governanceReason: null,
      governanceUpdatedAt: null,
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
  before: object | null,
  after: object,
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
