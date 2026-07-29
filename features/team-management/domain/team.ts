export type TeamMemberRole = "PLAYER" | "COACH"

export interface TeamSummary {
  id: string
  name: string
  provinceCode: string
  province: string
  ownerId: string
}

export interface TeamRosterMember {
  id: string
  userId: string
  role: TeamMemberRole
  isActive: boolean
  deactivatedAt: string | null
}
