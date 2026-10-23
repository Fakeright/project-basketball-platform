/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนดสถานะและข้อมูลใบสมัครที่ใช้ร่วมกันระหว่าง use case, repository และหน้าจอ
 * เรียกใช้จาก: components/organizer/registration-review-list.tsx, components/team/team-registration-list.tsx
 */

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
