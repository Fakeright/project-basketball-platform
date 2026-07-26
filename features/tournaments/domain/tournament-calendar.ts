export const TOURNAMENT_TIME_ZONE = "Asia/Bangkok"

const BANGKOK_UTC_OFFSET_MILLISECONDS = 7 * 60 * 60 * 1_000
const CALENDAR_DAY_MILLISECONDS = 24 * 60 * 60 * 1_000

const bangkokCalendarDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: TOURNAMENT_TIME_ZONE,
  year: "numeric",
})

export function toBangkokCalendarDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_TOURNAMENT_DATE")
  }

  const parts = bangkokCalendarDateFormatter.formatToParts(date)
  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  if (!year || !month || !day) {
    throw new Error("INVALID_TOURNAMENT_DATE")
  }

  return `${year}-${month}-${day}`
}

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
