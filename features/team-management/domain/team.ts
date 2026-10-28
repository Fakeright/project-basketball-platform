/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนดรูปแบบทีม ตำแหน่งผู้เล่น ข้อมูลทีม และข้อมูลผู้เล่นแบบร่าง/ที่บันทึกแล้ว
 * เรียกใช้จาก: components/team/team-creation-roster-editor.tsx, components/team/team-editor.tsx
 */

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
  playerIdentityId?: string
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
