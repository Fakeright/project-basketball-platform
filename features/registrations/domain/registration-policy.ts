import type { TeamRosterMember, TeamSummary } from "@/features/team-management/domain/team"
import {
  assertLegacyRegistrationRosterEligibility,
  type RosterFormat,
} from "@/features/team-management/domain/team-policy"

import type { RegistrationAction, RegistrationStatus } from "./registration"

export type RegistrationTournamentStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "PUBLISHED"
  | "REGISTRATION_CLOSED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ARCHIVED"
  | "REJECTED"
  | "SUSPENDED"

export interface RegistrationApplicationEligibility {
  actorId: string
  team: TeamSummary
  roster: readonly TeamRosterMember[]
  tournament: {
    format: RosterFormat
    status: RegistrationTournamentStatus
    registrationDeadline: string
    capacity: number
    approvedCount: number
  }
  hasActiveRegistration: boolean
  now: Date
}

export interface RegistrationTransitionContext {
  tournamentStatus: RegistrationTournamentStatus
  reason: string
}

const transitions: Record<
  RegistrationStatus,
  Partial<Record<RegistrationAction, RegistrationStatus>>
> = {
  PENDING: { APPROVE: "APPROVED", REJECT: "REJECTED", CANCEL: "CANCELLED" },
  APPROVED: { WITHDRAW: "WITHDRAWN" },
  REJECTED: {},
  CANCELLED: {},
  WITHDRAWN: {},
}

export function assertCanApply(input: RegistrationApplicationEligibility): void {
  if (input.tournament.status !== "PUBLISHED") {
    throw new Error("TOURNAMENT_NOT_PUBLISHED")
  }

  const deadline = Date.parse(input.tournament.registrationDeadline)
  if (!Number.isFinite(deadline) || input.now.getTime() > deadline) {
    throw new Error("REGISTRATION_DEADLINE_PASSED")
  }

  if (input.tournament.approvedCount >= input.tournament.capacity) {
    throw new Error("TOURNAMENT_CAPACITY_REACHED")
  }

  if (input.team.ownerId !== input.actorId) {
    throw new Error("TEAM_NOT_OWNED")
  }

  assertLegacyRegistrationRosterEligibility(input.tournament.format, input.roster)

  if (input.hasActiveRegistration) {
    throw new Error("REGISTRATION_ALREADY_ACTIVE")
  }
}

export function transitionRegistration(
  status: RegistrationStatus,
  action: RegistrationAction,
  context: RegistrationTransitionContext,
): RegistrationStatus {
  if ((action === "REJECT" || action === "WITHDRAW") && !context.reason.trim()) {
    throw new Error("REASON_REQUIRED")
  }

  if (
    (action === "APPROVE" || action === "REJECT") &&
    context.tournamentStatus !== "PUBLISHED" &&
    context.tournamentStatus !== "REGISTRATION_CLOSED"
  ) {
    throw new Error("REGISTRATION_DECISION_UNAVAILABLE")
  }

  const nextStatus = transitions[status][action]
  if (!nextStatus) {
    throw new Error("INVALID_REGISTRATION_TRANSITION")
  }

  return nextStatus
}
