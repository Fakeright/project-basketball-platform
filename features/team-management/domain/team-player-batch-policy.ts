/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจชุดผู้เล่นและเบอร์เสื้อไม่ซ้ำ; ทีม 5v5 ไม่เกิน 15 คน และ 3v3 ไม่เกิน 4 คน
 * เรียกใช้จาก: components/team/team-creation-roster-editor.tsx, components/team/team-editor.tsx
 */

import type { TeamFormat, TeamPlayerDraft } from "./team"

export const maximumTeamPlayerBatchSize = 15

// คืนเพดานผู้เล่นตามรูปแบบทีม: 5v5 ได้ 15 คน และ 3v3 ได้ 4 คน
export function getMaximumTeamPlayerCount(format: TeamFormat): number {
  return format === "FIVE_V_FIVE" ? 15 : 4
}

export interface TeamPlayerBatchOptions {
  allowEmpty: boolean
  format?: TeamFormat
  existingActiveCount?: number
}

// ตรวจจำนวนผู้เล่น รวมกับสมาชิกเดิมเมื่อมี และตรวจตัวตน/เบอร์เสื้อซ้ำภายในชุดที่ส่งมา
export function assertTeamPlayerBatch(
  players: readonly TeamPlayerDraft[],
  options: TeamPlayerBatchOptions,
): void {
  if (!options.allowEmpty && players.length === 0) {
    throw new Error("PLAYER_BATCH_INVALID")
  }
  const exceedsBatchLimit = players.length > maximumTeamPlayerBatchSize
  const exceedsRosterLimit = options.format !== undefined &&
    (options.existingActiveCount ?? 0) + players.length > getMaximumTeamPlayerCount(options.format)
  if (exceedsBatchLimit || exceedsRosterLimit) {
    throw new Error("PLAYER_LIMIT_EXCEEDED")
  }

  const identities = new Set<string>()
  const jerseyNumbers = new Set<number>()

  for (const player of players) {
    const identity = normalizedPlayerIdentity(player)
    if (identities.has(identity)) throw new Error("PLAYER_ALREADY_EXISTS")
    identities.add(identity)

    if (player.jerseyNumber === null) continue
    if (jerseyNumbers.has(player.jerseyNumber)) {
      throw new Error("JERSEY_ALREADY_IN_USE")
    }
    jerseyNumbers.add(player.jerseyNumber)
  }
}

// รวมชื่อ นามสกุล และวันเกิดเป็นคีย์เปรียบเทียบคนเดิม โดยตัดช่องว่างหัวท้ายและไม่แยกตัวพิมพ์
function normalizedPlayerIdentity(player: TeamPlayerDraft): string {
  return [
    player.firstName.trim().toLowerCase(),
    player.lastName.trim().toLowerCase(),
    player.birthDate,
  ].join("\u0000")
}
