export const BANGKOK_TIME_ZONE = "Asia/Bangkok"

const bangkokCalendarDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: BANGKOK_TIME_ZONE,
  year: "numeric",
})

export function toBangkokCalendarDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_CALENDAR_DATE")
  }

  const parts = bangkokCalendarDateFormatter.formatToParts(date)
  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  if (!year || !month || !day) {
    throw new Error("INVALID_CALENDAR_DATE")
  }

  return `${year}-${month}-${day}`
}
