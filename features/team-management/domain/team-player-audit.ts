/**
 * COURTSIDE: คำอธิบายไฟล์
 * เลือกเฉพาะข้อมูลที่จำเป็นสำหรับประวัติผู้เล่น และตรวจหา audit เก่าที่เก็บข้อมูลส่วนบุคคลเกินจำเป็น
 * เรียกใช้จาก: features/team-management/application/add-team-players.ts, features/team-management/application/create-team.ts
 */

import type { TeamPlayer, TeamPlayerPosition } from "./team"

export interface TeamPlayerAuditSnapshot {
  playerId: string
  teamId: string
  jerseyNumber: number | null
  position: TeamPlayerPosition | null
  isActive: boolean
}

export interface TeamPlayerBatchAuditSnapshot {
  players: TeamPlayerAuditSnapshot[]
  reactivatedPlayerIds: string[]
  count: number
}

export interface StoredTeamPlayerAuditEvent {
  id: string
  action: string
  beforeJson: unknown
  afterJson: unknown
}

export interface TeamPlayerAuditPiiFinding {
  auditLogId: string
  action: string
  snapshots: Array<"beforeJson" | "afterJson">
  piiKeys: string[]
}

export interface TeamPlayerAuditPiiReport {
  eventsScanned: number
  eventsWithPlayerPii: number
  containsHistoricalPlayerPii: boolean
  findings: TeamPlayerAuditPiiFinding[]
}

const teamPlayerPiiKeys = new Set([
  "firstName",
  "lastName",
  "nickname",
  "birthDate",
  "phone",
])

// เลือกเฉพาะฟิลด์ที่จำเป็นต่อ audit โดยไม่คัดลอกข้อมูลส่วนบุคคลทั้งระเบียน
export function projectTeamPlayerAuditSnapshot(
  player: TeamPlayer,
): TeamPlayerAuditSnapshot {
  return {
    playerId: player.id,
    teamId: player.teamId,
    jerseyNumber: player.jerseyNumber,
    position: player.position,
    isActive: player.isActive,
  }
}

// สร้างประวัติแบบสรุปของชุดผู้เล่น รวม ID ที่เปิดกลับมาใช้
export function projectTeamPlayerBatchAuditSnapshot(
  players: readonly TeamPlayer[],
  reactivatedPlayerIds: readonly string[],
): TeamPlayerBatchAuditSnapshot {
  return {
    players: players.map(projectTeamPlayerAuditSnapshot),
    reactivatedPlayerIds: [...reactivatedPlayerIds],
    count: players.length,
  }
}

export function createTeamPlayerAuditPiiReport(
  events: readonly StoredTeamPlayerAuditEvent[],
): TeamPlayerAuditPiiReport {
  const findings = events.flatMap((event): TeamPlayerAuditPiiFinding[] => {
    const beforeKeys = findTeamPlayerPiiKeys(event.beforeJson)
    const afterKeys = findTeamPlayerPiiKeys(event.afterJson)
    const piiKeys = [...new Set([...beforeKeys, ...afterKeys])]
    if (piiKeys.length === 0) return []

    return [{
      auditLogId: event.id,
      action: event.action,
      snapshots: [
        ...(beforeKeys.length > 0 ? ["beforeJson" as const] : []),
        ...(afterKeys.length > 0 ? ["afterJson" as const] : []),
      ],
      piiKeys,
    }]
  })

  return {
    eventsScanned: events.length,
    eventsWithPlayerPii: findings.length,
    containsHistoricalPlayerPii: findings.length > 0,
    findings,
  }
}

function findTeamPlayerPiiKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(findTeamPlayerPiiKeys)
  if (typeof value !== "object" || value === null) return []

  return Object.entries(value).flatMap(([key, nestedValue]) => [
    ...(teamPlayerPiiKeys.has(key) ? [key] : []),
    ...findTeamPlayerPiiKeys(nestedValue),
  ])
}
