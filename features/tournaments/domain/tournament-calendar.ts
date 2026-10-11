import {
  BANGKOK_TIME_ZONE,
  toBangkokCalendarDate as toSharedBangkokCalendarDate,
} from "@/features/shared/domain/calendar-date"

export const TOURNAMENT_TIME_ZONE = BANGKOK_TIME_ZONE

export function toBangkokCalendarDate(value: string | Date): string {
  try {
    return toSharedBangkokCalendarDate(value)
  } catch {
    throw new Error("INVALID_TOURNAMENT_DATE")
  }
}

const BANGKOK_UTC_OFFSET_MILLISECONDS = 7 * 60 * 60 * 1_000
const CALENDAR_DAY_MILLISECONDS = 24 * 60 * 60 * 1_000

export function getBangkokCalendarDayUtcRange(
  calendarDate: string,
): { gte: Date; lt: Date } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(calendarDate)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const utcCalendarDate = new Date(Date.UTC(year, month - 1, day))

  if (
    utcCalendarDate.getUTCFullYear() !== year ||
    utcCalendarDate.getUTCMonth() !== month - 1 ||
    utcCalendarDate.getUTCDate() !== day
  ) {
    return null
  }

  const start = utcCalendarDate.getTime() - BANGKOK_UTC_OFFSET_MILLISECONDS

  return {
    gte: new Date(start),
    lt: new Date(start + CALENDAR_DAY_MILLISECONDS),
  }
}
