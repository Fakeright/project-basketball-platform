/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนดข้อมูลรายชื่อทีม ผู้สร้าง และสมาชิกปัจจุบันที่แอดมินอ่านได้โดยไม่เปิดเผยเบอร์โทร
 * เรียกใช้จาก: features/team-management/application/read-admin-teams.ts, features/team-management/infrastructure/get-admin-team-read-repository.ts
 */

import type {
  TeamFormat,
  TeamPlayerPosition,
} from "@/features/team-management/domain/team"

export interface AdminTeamListItem {
  id: string
  name: string
  province: string
  format: TeamFormat
  isActive: boolean
  ownerName: string
  activePlayerCount: number
}

export interface AdminTeamPlayer {
  id: string
  firstName: string
  lastName: string
  nickname: string | null
  jerseyNumber: number | null
  position: TeamPlayerPosition | null
  birthDate: string
}

export interface AdminTeamDetail extends AdminTeamListItem {
  players: AdminTeamPlayer[]
}

export interface AdminTeamReadRepository {
  listAll(): Promise<AdminTeamListItem[]>
  findById(id: string): Promise<AdminTeamDetail | null>
}
