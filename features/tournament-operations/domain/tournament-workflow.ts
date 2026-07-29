import type { TournamentOperation, TournamentOperationInput, TournamentOperationStatus } from "./tournament-operation"

const requiredFields: Array<keyof TournamentOperationInput> = [
  "title", "description", "rules", "province", "venue", "ageGroup", "startsAt", "endsAt", "registrationDeadline",
]

export function validateTournamentInput(input: TournamentOperationInput): void {
  for (const field of requiredFields) {
    if (!String(input[field]).trim()) throw new Error(`FIELD_REQUIRED:${field}`)
  }
  if (!Number.isInteger(input.capacity) || input.capacity < 2 || input.capacity > 64) throw new Error("CAPACITY_INVALID")
  const startsAt = Date.parse(input.startsAt)
  const endsAt = Date.parse(input.endsAt)
  const deadline = Date.parse(input.registrationDeadline)
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || !Number.isFinite(deadline)) throw new Error("DATE_INVALID")
  if (endsAt <= startsAt) throw new Error("DATE_RANGE_INVALID")
  if (deadline >= startsAt) throw new Error("REGISTRATION_DEADLINE_INVALID")
}

export function canSubmit(status: TournamentOperationStatus): boolean {
  return status === "DRAFT" || status === "CHANGES_REQUESTED"
}

export function applyReviewDecision(tournament: TournamentOperation, decision: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED"): TournamentOperationStatus {
  if (tournament.status !== "SUBMITTED") throw new Error("INVALID_REVIEW_STATUS")
  return decision
}

export function assertCanPublish(
  tournament: TournamentOperation,
  now: Date,
): void {
  if (tournament.status !== "APPROVED") {
    throw new Error("INVALID_PUBLISH_STATUS")
  }
  validateTournamentInput(tournament)
  if (Date.parse(tournament.registrationDeadline) <= now.getTime()) {
    throw new Error("REGISTRATION_WINDOW_CLOSED")
  }
  if (Date.parse(tournament.startsAt) <= now.getTime()) {
    throw new Error("TOURNAMENT_ALREADY_STARTED")
  }
}

export function assertCanCloseRegistration(
  tournament: TournamentOperation,
): void {
  if (tournament.status !== "PUBLISHED") {
    throw new Error("INVALID_CLOSE_REGISTRATION_STATUS")
  }
}
