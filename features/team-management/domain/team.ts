export type TeamMemberRole = "PLAYER" | "COACH"

export type TeamFormat = "FIVE_V_FIVE" | "THREE_V_THREE"

export type TeamPlayerPosition = "PG" | "SG" | "SF" | "PF" | "C"

export interface TeamSummary {
  id: string
  name: string
  provinceCode: string
  province: string
  ownerId: string
  format: TeamFormat
  isActive: boolean
  deactivatedAt: string | null
  version: number
}

export interface TeamPlayerDraft {
  firstName: string
  lastName: string
  nickname: string | null
  birthDate: string
  jerseyNumber: number | null
  position: TeamPlayerPosition | null
  phone: string | null
}

export interface TeamPlayer extends TeamPlayerDraft {
  id: string
  teamId: string
  isActive: boolean
  deactivatedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TeamRosterMember {
  id: string
  userId: string
  role: TeamMemberRole
  isActive: boolean
  deactivatedAt: string | null
}
