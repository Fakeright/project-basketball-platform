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
import type { TournamentCompetitionLifecycleContext } from "@/features/competition/domain/competition"
import type {
  TournamentCompetitionTransition,
  TournamentLifecycleTransition,
  TournamentMutationAudit,
  TournamentOperationsRepository,
  AdminTournamentFilters,
} from "./tournament-operations-repository"

export class InMemoryTournamentOperationsRepository implements TournamentOperationsRepository {
  private readonly tournaments = new Map<string, TournamentOperation>()
  readonly reviews: Array<{ tournamentId: string; reviewerId: string; decision: TournamentReviewInput["decision"]; note: string }> = []
  readonly audits: Array<{
    actorId: string
    action: string
    tournamentId: string
    before: TournamentOperation | null
    after: TournamentOperation
  }> = []

  async create(
    input: TournamentOperationInput & { organizerId: string },
    audit: TournamentMutationAudit = systemAudit("tournament.created"),
  ): Promise<TournamentOperation> {
    const now = new Date().toISOString()
    const tournament: TournamentOperation = { ...input, province: provinceName(input.provinceCode), id: `tournament-${this.tournaments.size + 1}`, status: "DRAFT", version: 0, createdAt: now, updatedAt: now }
    this.tournaments.set(tournament.id, tournament)
    this.appendAudit(audit, tournament.id, null, tournament)
    return tournament
  }

  async findById(id: string) { return this.tournaments.get(id) ?? null }

  async findCompetitionLifecycleContext(
    id: string,
  ): Promise<TournamentCompetitionLifecycleContext | null> {
    const tournament = this.tournaments.get(id)
    return tournament
      ? {
          tournamentId: tournament.id,
          organizerId: tournament.organizerId,
          status: tournament.status,
          version: tournament.version,
          activeBracket: null,
        }
      : null
  }

  async listByOrganizer(organizerId: string) {
    return [...this.tournaments.values()].filter(
      (tournament) => tournament.organizerId === organizerId,
    )
  }

  async listForAdmin(filters: AdminTournamentFilters) {
    const query = filters.query?.trim().toLocaleLowerCase("th-TH")
    return [...this.tournaments.values()]
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

  async listByStatus(status: TournamentOperation["status"]) {
    return [...this.tournaments.values()].filter(
      (tournament) => tournament.status === status,
    )
  }

  async updateWithVersion(
    id: string,
    version: number,
    changes: Partial<TournamentOperation>,
    audit: TournamentMutationAudit = systemAudit("tournament.updated"),
  ) {
    const current = this.tournaments.get(id)
    if (!current) throw new Error("NOT_FOUND")
    if (current.version !== version) throw new Error("CONFLICT")
    const updated = {
      ...current,
      ...changes,
      province: provinceName(changes.provinceCode ?? current.provinceCode),
      version: version + 1,
      updatedAt: new Date().toISOString(),
    }
    this.tournaments.set(id, updated)
    this.appendAudit(audit, id, current, updated)
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
    const current = this.tournaments.get(input.tournamentId)
    if (!current) throw new Error("NOT_FOUND")
    if (
      current.version !== input.version ||
      current.status !== input.sourceStatus
    ) {
      throw new Error("CONFLICT")
    }

    const updated = {
      ...current,
      status: input.status,
      version: input.version + 1,
      updatedAt: new Date().toISOString(),
    }
    this.tournaments.set(input.tournamentId, updated)
    this.reviews.push(input)
    this.appendAudit(
      {
        actorId: input.reviewerId,
        action: "tournament.reviewed",
        adminOverride: false,
      },
      input.tournamentId,
      current,
      updated,
    )
    return updated
  }

  async transitionWithVersion(
    input: TournamentLifecycleTransition | TournamentCompetitionTransition,
  ) {
    const current = this.tournaments.get(input.tournamentId)
    if (!current) throw new Error("NOT_FOUND")
    if (
      current.version !== input.version ||
      current.status !== input.sourceStatus
    ) {
      throw new Error("CONFLICT")
    }
    const updated = {
      ...current,
      status: input.status,
      version: input.version + 1,
      updatedAt: new Date().toISOString(),
    }
    this.tournaments.set(input.tournamentId, updated)
    this.appendAudit(input, input.tournamentId, current, updated)
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

  private appendAudit(
    audit: TournamentMutationAudit,
    tournamentId: string,
    before: TournamentOperation | null,
    after: TournamentOperation,
  ) {
    this.audits.push({
      actorId: audit.actorId,
      action: audit.action,
      tournamentId,
      before,
      after,
    })
    if (audit.adminOverride) {
      this.audits.push({
        actorId: audit.actorId,
        action: "tournament.admin_override",
        tournamentId,
        before,
        after,
      })
    }
  }
}

function provinceName(provinceCode: string) {
  const province = findProvinceByCode(provinceCode)
  if (!province) throw new Error("INVALID_PROVINCE_CODE")
  return province.nameTh
}

function systemAudit(
  action: TournamentMutationAudit["action"],
): TournamentMutationAudit {
  return { actorId: "system", action, adminOverride: false }
}
