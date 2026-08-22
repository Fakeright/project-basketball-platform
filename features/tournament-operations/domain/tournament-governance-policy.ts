import type { TournamentOperationStatus } from "./tournament-operation"

export type TournamentGovernanceStatus = "ACTIVE" | "SUSPENDED" | "REMOVED"

export type TournamentGovernanceAction =
  | "SUSPEND"
  | "RESUME"
  | "REMOVE"
  | "ARCHIVE"
  | "REOPEN_REGISTRATION"
  | "PERMANENT_DELETE"

export interface TournamentGovernanceContext {
  tournamentId: string
  title: string
  organizerId: string
  status: TournamentOperationStatus
  governanceStatus: TournamentGovernanceStatus
  version: number
  startsAt: string
  reviewCount: number
  registrationCount: number
  bracketCount: number
  matchCount: number
  mediaAssetCount: number
  activeBracket: null | {
    status: string
    entriesLockedAt: string | null
    matchCount: number
  }
}

export type TournamentGovernanceIssueCode =
  | "GOVERNANCE_STATUS_INVALID"
  | "TOURNAMENT_STATUS_INVALID"
  | "TOURNAMENT_ALREADY_STARTED"
  | "BRACKET_PUBLISHED"
  | "BRACKET_ENTRIES_LOCKED"
  | "BRACKET_HAS_MATCHES"
  | "TOURNAMENT_HAS_REVIEWS"
  | "TOURNAMENT_HAS_REGISTRATIONS"
  | "TOURNAMENT_HAS_BRACKETS"
  | "TOURNAMENT_HAS_MATCHES"
  | "TOURNAMENT_HAS_MEDIA_ASSETS"
  | "CONFIRMATION_TITLE_MISMATCH"
  | "LEGACY_SUSPENDED_STATUS_REQUIRES_REVIEW"
  | "TOURNAMENT_SUSPENDED"
  | "TOURNAMENT_REMOVED"

export class TournamentGovernancePolicyError extends Error {
  readonly issues: readonly TournamentGovernanceIssueCode[]

  constructor(issues: readonly TournamentGovernanceIssueCode[]) {
    super("TOURNAMENT_GOVERNANCE_OPERATION_NOT_ALLOWED")
    this.name = "TournamentGovernancePolicyError"
    this.issues = issues
  }
}

export function getTournamentGovernanceIssues(
  action: TournamentGovernanceAction,
  context: TournamentGovernanceContext,
  now: Date,
  confirmationTitle?: string,
): TournamentGovernanceIssueCode[] {
  switch (action) {
    case "SUSPEND":
      return getSuspendIssues(context)
    case "RESUME":
      return getResumeIssues(context)
    case "REMOVE":
      return getRemoveIssues(context)
    case "ARCHIVE":
      return getArchiveIssues(context)
    case "REOPEN_REGISTRATION":
      return getReopenRegistrationIssues(context, now)
    case "PERMANENT_DELETE":
      return getPermanentDeleteIssues(context, confirmationTitle)
  }
}

export function assertTournamentGovernanceAllowsOperation(
  status: TournamentGovernanceStatus,
): void {
  if (status === "SUSPENDED") {
    throw new TournamentGovernancePolicyError(["TOURNAMENT_SUSPENDED"])
  }
  if (status === "REMOVED") {
    throw new TournamentGovernancePolicyError(["TOURNAMENT_REMOVED"])
  }
}

function getSuspendIssues(
  context: TournamentGovernanceContext,
): TournamentGovernanceIssueCode[] {
  const issues = getGovernanceStateIssues(context, ["ACTIVE"])
  if (context.status === "ARCHIVED") issues.push("TOURNAMENT_STATUS_INVALID")
  return issues
}

function getResumeIssues(
  context: TournamentGovernanceContext,
): TournamentGovernanceIssueCode[] {
  if (
    context.status === "SUSPENDED" &&
    context.governanceStatus === "SUSPENDED"
  ) {
    return ["LEGACY_SUSPENDED_STATUS_REQUIRES_REVIEW"]
  }

  return getGovernanceStateIssues(context, ["SUSPENDED"])
}

function getRemoveIssues(
  context: TournamentGovernanceContext,
): TournamentGovernanceIssueCode[] {
  const issues = getGovernanceStateIssues(context, ["ACTIVE", "SUSPENDED"])
  if (context.status === "ARCHIVED") issues.push("TOURNAMENT_STATUS_INVALID")
  return issues
}

function getArchiveIssues(
  context: TournamentGovernanceContext,
): TournamentGovernanceIssueCode[] {
  const issues = getGovernanceStateIssues(context, ["ACTIVE"])
  if (context.status !== "COMPLETED") issues.push("TOURNAMENT_STATUS_INVALID")
  return issues
}

function getReopenRegistrationIssues(
  context: TournamentGovernanceContext,
  now: Date,
): TournamentGovernanceIssueCode[] {
  const issues = getGovernanceStateIssues(context, ["ACTIVE"])
  if (context.status !== "REGISTRATION_CLOSED") {
    issues.push("TOURNAMENT_STATUS_INVALID")
  }
  if (Date.parse(context.startsAt) <= now.getTime()) {
    issues.push("TOURNAMENT_ALREADY_STARTED")
  }

  const bracket = context.activeBracket
  if (bracket?.status === "PUBLISHED") issues.push("BRACKET_PUBLISHED")
  if (bracket?.entriesLockedAt) issues.push("BRACKET_ENTRIES_LOCKED")
  if ((bracket?.matchCount ?? 0) > 0) issues.push("BRACKET_HAS_MATCHES")

  return issues
}

function getPermanentDeleteIssues(
  context: TournamentGovernanceContext,
  confirmationTitle: string | undefined,
): TournamentGovernanceIssueCode[] {
  const issues = getGovernanceStateIssues(context, ["ACTIVE"])
  if (context.status !== "DRAFT") issues.push("TOURNAMENT_STATUS_INVALID")
  if (context.reviewCount > 0) issues.push("TOURNAMENT_HAS_REVIEWS")
  if (context.registrationCount > 0) issues.push("TOURNAMENT_HAS_REGISTRATIONS")
  if (context.bracketCount > 0) issues.push("TOURNAMENT_HAS_BRACKETS")
  if (context.matchCount > 0) issues.push("TOURNAMENT_HAS_MATCHES")
  if (context.mediaAssetCount > 0) issues.push("TOURNAMENT_HAS_MEDIA_ASSETS")
  if (confirmationTitle?.trim() !== context.title.trim()) {
    issues.push("CONFIRMATION_TITLE_MISMATCH")
  }
  return issues
}

function getGovernanceStateIssues(
  context: TournamentGovernanceContext,
  allowedStatuses: readonly TournamentGovernanceStatus[],
): TournamentGovernanceIssueCode[] {
  return allowedStatuses.includes(context.governanceStatus)
    ? []
    : ["GOVERNANCE_STATUS_INVALID"]
}
