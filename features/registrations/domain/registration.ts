export type RegistrationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "WITHDRAWN"

export type RegistrationAction = "APPROVE" | "REJECT" | "CANCEL" | "WITHDRAW"

export interface TournamentRegistration {
  id: string
  tournamentId: string
  teamId: string
  status: RegistrationStatus
  decisionNote: string | null
  decidedAt: string | null
  cancelledAt: string | null
  withdrawnAt: string | null
  version: number
  createdAt: string
  updatedAt: string
}
