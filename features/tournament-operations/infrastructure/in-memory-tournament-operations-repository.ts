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

export class InMemoryTournamentOperationsRepository implements TournamentOperationsRepository {
  private readonly tournaments = new Map<string, TournamentOperation>()
  readonly reviews: Array<{ tournamentId: string; reviewerId: string; decision: TournamentReviewInput["decision"]; note: string }> = []
  readonly audits: Array<{
    actorId: string
    action: string
    tournamentId: string
    before: object | null
    after: object
  }> = []

  async create(
    input: TournamentOperationInput & { organizerId: string },
    audit: TournamentMutationAudit = systemAudit("tournament.created"),
  ): Promise<TournamentOperation> {
    const now = new Date().toISOString()
    const tournament: TournamentOperation = { ...input, province: provinceName(input.provinceCode), id: `tournament-${this.tournaments.size + 1}`, status: "DRAFT", governanceStatus: "ACTIVE", governanceReason: null, governanceUpdatedAt: null, version: 0, createdAt: now, updatedAt: now }
    this.tournaments.set(tournament.id, tournament)
    this.appendAudit(audit, tournament.id, null, tournament)
    return tournament
  }

  async findById(id: string) { return this.tournaments.get(id) ?? null }

  async findGovernanceContext(
    id: string,
  ): Promise<TournamentGovernanceContext | null> {
    const tournament = this.tournaments.get(id)
    return tournament
      ? mapGovernanceContext(tournament, this.reviewCount(id))
      : null
  }

  async findCompetitionLifecycleContext(
    id: string,
  ): Promise<TournamentCompetitionOperationContext | null> {
    const tournament = this.tournaments.get(id)
    return tournament
      ? {
          tournamentId: tournament.id,
          organizerId: tournament.organizerId,
          status: tournament.status,
          tournamentGovernanceStatus: tournament.governanceStatus,
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

  async governWithVersion(input: TournamentGovernanceTransition) {
    const current = this.tournaments.get(input.tournamentId)
    if (!current) throw new Error("NOT_FOUND")
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
      mapGovernanceContext(current, this.reviewCount(input.tournamentId)),
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
    this.tournaments.set(input.tournamentId, updated)
    this.appendAudit(
      {
        actorId: input.actorId,
        action: governanceAuditAction(input.action),
        adminOverride: true,
      },
      input.tournamentId,
      current,
      { ...updated, transitionReason: reason },
    )
    return updated
  }

  async permanentlyDeleteWithVersion(input: TournamentPermanentDelete) {
    const current = this.tournaments.get(input.tournamentId)
    if (!current) throw new Error("NOT_FOUND")
    if (current.version !== input.expectedVersion) throw new Error("CONFLICT")

    const reason = input.reason.trim()
    assertGovernancePolicy(
      "PERMANENT_DELETE",
      mapGovernanceContext(current, this.reviewCount(input.tournamentId)),
      input.at,
      reason,
      input.confirmationTitle,
    )
    this.appendAudit(
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
    this.tournaments.delete(input.tournamentId)
  }

  private reviewCount(tournamentId: string) {
    return this.reviews.filter(
      (review) => review.tournamentId === tournamentId,
    ).length
  }

  private appendAudit(
    audit: TournamentMutationAudit,
    tournamentId: string,
    before: object | null,
    after: object,
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
