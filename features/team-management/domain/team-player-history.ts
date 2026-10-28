/**
 * COURTSIDE: คำอธิบายไฟล์
 * รวมสมาชิกหลายทีมด้วยรหัสตัวตนผู้เล่น และเลือกข้อมูลล่าสุดเพื่อใช้สร้างทีมใหม่
 * เรียกใช้จาก: components/team/reusable-player-selector.tsx, components/team/team-creation-roster-editor.tsx
 */

import type { TeamPlayer, TeamPlayerDraft } from "./team"

export interface TeamPlayerHistorySource extends TeamPlayer {
  teamName: string
  isCommitted?: boolean
}

export interface ReusableTeamPlayerSourceTeam {
  id: string
  name: string
  playerIsActive: boolean
}

export interface ReusableTeamPlayer {
  key: string
  player: TeamPlayerDraft
  isActive: boolean
  isCommitted?: boolean
  sourceTeams: ReusableTeamPlayerSourceTeam[]
}

interface PlayerHistoryGroup {
  selected: TeamPlayerHistorySource
  sources: TeamPlayerHistorySource[]
}

// จัดกลุ่มด้วยรหัสตัวตน; รองรับข้อมูลทดสอบเดิมที่ยังไม่มีรหัสด้วยชื่อและวันเกิด
export function projectReusableTeamPlayers(
  sources: readonly TeamPlayerHistorySource[],
): ReusableTeamPlayer[] {
  const groups = new Map<string, PlayerHistoryGroup>()

  for (const source of sources) {
    const identity = source.playerIdentityId ?? normalizedPlayerIdentity(source)
    const group = groups.get(identity)

    if (!group) {
      groups.set(identity, { selected: source, sources: [source] })
      continue
    }

    group.sources.push(source)
    if (compareCanonicalSources(source, group.selected) < 0) {
      group.selected = source
    }
  }

  return [...groups.values()]
    .map(projectPlayerHistoryGroup)
    .sort((left, right) => compareStrings(left.key, right.key))
}

// รวมชื่อ นามสกุล และวันเกิดเป็นคีย์เปรียบเทียบคนเดิม โดยตัดช่องว่างหัวท้ายและไม่แยกตัวพิมพ์
function normalizedPlayerIdentity(player: TeamPlayerDraft): string {
  return [
    player.firstName.trim().toLowerCase(),
    player.lastName.trim().toLowerCase(),
    player.birthDate,
  ].join("\u0000")
}

// เลือกระเบียนที่แก้ไขล่าสุดก่อน และใช้ ID ตัดสินเมื่อลำดับเวลาเท่ากันเพื่อให้ผลคงที่
function compareCanonicalSources(
  left: TeamPlayerHistorySource,
  right: TeamPlayerHistorySource,
): number {
  if (left.updatedAt !== right.updatedAt) {
    return left.updatedAt > right.updatedAt ? -1 : 1
  }
  return compareStrings(left.id, right.id)
}

// แปลงกลุ่มประวัติของคนเดียวให้เหลือหนึ่งตัวเลือก พร้อมรายชื่อทีมต้นทาง
function projectPlayerHistoryGroup(group: PlayerHistoryGroup): ReusableTeamPlayer {
  const selected = group.selected
  const sourceTeams = new Map<string, ReusableTeamPlayerSourceTeam>()

  for (const source of group.sources) {
    const existing = sourceTeams.get(source.teamId)
    sourceTeams.set(source.teamId, {
      id: source.teamId,
      name:
        existing && compareStrings(existing.name, source.teamName) <= 0
          ? existing.name
          : source.teamName,
      playerIsActive: Boolean(existing?.playerIsActive || source.isActive),
    })
  }

  return {
    key: selected.playerIdentityId ?? selected.id,
    player: {
      firstName: selected.firstName,
      lastName: selected.lastName,
      nickname: selected.nickname,
      birthDate: selected.birthDate,
      jerseyNumber: selected.jerseyNumber,
      position: selected.position,
      phone: selected.phone,
    },
    isActive: group.sources.some((source) => source.isActive),
    ...(group.sources.some((source) => source.isCommitted) ? { isCommitted: true } : {}),
    sourceTeams: [...sourceTeams.values()].sort((left, right) =>
      compareStrings(left.id, right.id),
    ),
  }
}

function compareStrings(left: string, right: string): number {
  if (left === right) return 0
  return left < right ? -1 : 1
}
