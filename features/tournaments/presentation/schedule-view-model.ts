/**
 * COURTSIDE: คำอธิบายไฟล์
 * จัดคู่แข่งขันเป็นกลุ่มตามวันที่และสนามสำหรับตารางสาธารณะ
 * เรียกใช้จาก: components/schedule-table.tsx
 * ตามการทำงานต่อ: features/tournaments/domain/tournament-calendar.ts
 */

import type { Match } from "@/features/tournaments/domain/tournament"
import { toBangkokCalendarDate } from "@/features/tournaments/domain/tournament-calendar"

export type ScheduledMatch = Match & { scheduledAt: string }

// จัดกลุ่มคู่ตามวันและสนามให้ตารางแสดงเป็นช่วงที่อ่านได้ง่าย
export function groupMatchesByDateAndCourt(
  matches: Match[],
): Record<string, Record<string, ScheduledMatch[]>> {
  return matches.reduce<Record<string, Record<string, ScheduledMatch[]>>>((groupedMatches, match) => {
    if (!match.scheduledAt) return groupedMatches

    const date = toBangkokCalendarDate(match.scheduledAt)
    const courts = (groupedMatches[date] ??= {})
    const matchesForCourt = (courts[match.court] ??= [])

    matchesForCourt.push({ ...match, scheduledAt: match.scheduledAt })

    return groupedMatches
  }, {})
}
