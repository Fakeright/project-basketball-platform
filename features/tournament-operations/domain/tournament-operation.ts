import type { TournamentFormat } from "@/features/tournaments/domain/tournament"

export type TournamentOperationStatus =
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

export type ReviewDecision = "APPROVED" | "CHANGES_REQUESTED" | "REJECTED"

export interface TournamentOperationInput {
  title: string
  description: string
  rules: string
  provinceCode: string
  venue: string
  format: TournamentFormat
  ageGroup: string
  startsAt: string
  endsAt: string
  registrationDeadline: string
  capacity: number
}

export interface TournamentOperation extends TournamentOperationInput {
  id: string
  province: string
  organizerId: string
  organizerName?: string
  status: TournamentOperationStatus
  version: number
  createdAt: string
  updatedAt: string
}

export interface TournamentReviewInput {
  decision: ReviewDecision
  note: string
  version: number
}

export type TournamentAuditAction =
  | "tournament.created"
  | "tournament.updated"
  | "tournament.submitted"
  | "tournament.reviewed"
  | "tournament.published"
  | "tournament.registration_closed"
