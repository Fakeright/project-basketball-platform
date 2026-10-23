/**
 * COURTSIDE: คำอธิบายไฟล์
 * แปลง query string เป็นตัวกรองค้นหาและแปลงกลับ เพื่อให้ URL เก็บเงื่อนไขที่เลือก
 * เรียกใช้จาก: app/(public)/tournaments/page.tsx, components/tournament-search-form.tsx
 * ตามการทำงานต่อ: features/provinces/domain/thai-provinces.ts, features/tournament-operations/domain/tournament-age-group.ts
 */

import type {
  TournamentFormat,
  TournamentSearchFilters,
  TournamentStatus,
} from "@/features/tournaments/domain/tournament"
import { findProvinceByCode } from "@/features/provinces/domain/thai-provinces"
import { isTournamentAgeGroup } from "@/features/tournament-operations/domain/tournament-age-group"

const formats = new Set<TournamentFormat>(["FIVE_V_FIVE", "THREE_V_THREE"])
const statuses = new Set<TournamentStatus>(["OPEN", "CLOSED", "ONGOING", "COMPLETED"])

function scalarValue(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

// อ่าน query string และคืนเฉพาะตัวกรองที่ระบบรองรับ
export function parseTournamentSearchParams(
  input: Record<string, string | string[] | undefined>,
): TournamentSearchFilters {
  // อ่านข้อมูลจังหวัดและรูปแบบจาก URL
  const query = scalarValue(input.q)
  const provinceCode = scalarValue(input.province)
  const format = scalarValue(input.format)
  const ageGroup = scalarValue(input.ageGroup)
  const venue = scalarValue(input.venue)
  const date = scalarValue(input.date)
  const status = scalarValue(input.status)

  // คืนเฉพาะค่าที่ผ่านเงื่อนไข
  return {
    ...(query ? { query } : {}),
    ...(provinceCode && findProvinceByCode(provinceCode) ? { provinceCode } : {}),
    ...(format && formats.has(format as TournamentFormat) ? { format: format as TournamentFormat } : {}),
    ...(ageGroup && isTournamentAgeGroup(ageGroup) ? { ageGroup } : {}),
    ...(venue ? { venue } : {}),
    ...(date ? { date } : {}),
    ...(status && statuses.has(status as TournamentStatus) ? { status: status as TournamentStatus } : {}),
  }
}

// สร้าง query string จากตัวกรอง เพื่อคงตัวเลือกไว้ใน URL
export function toTournamentSearchParams(filters: TournamentSearchFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.query) params.set("q", filters.query)
  if (filters.provinceCode) params.set("province", filters.provinceCode)
  if (filters.format) params.set("format", filters.format)
  if (filters.ageGroup) params.set("ageGroup", filters.ageGroup)
  if (filters.venue) params.set("venue", filters.venue)
  if (filters.date) params.set("date", filters.date)

  return params
}
