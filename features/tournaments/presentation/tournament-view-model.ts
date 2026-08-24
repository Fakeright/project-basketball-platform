import type { TournamentFormat } from "@/features/tournaments/domain/tournament"
import { toBangkokCalendarDate } from "@/features/tournaments/domain/tournament-calendar"

const thaiDateFormatter = new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

function parseDate(value: string) {
  return new Date(`${toBangkokCalendarDate(value)}T00:00:00Z`)
}

export function formatThaiCalendarDate(value: string): string {
  return thaiDateFormatter.format(parseDate(value))
}

export function formatTournamentDateRange(start: string, end: string): string {
  const startDate = parseDate(start)
  const endDate = parseDate(end)

  if (startDate.getTime() === endDate.getTime()) {
    return thaiDateFormatter.format(startDate)
  }

  if (
    startDate.getUTCFullYear() === endDate.getUTCFullYear() &&
    startDate.getUTCMonth() === endDate.getUTCMonth()
  ) {
    const endParts = thaiDateFormatter.formatToParts(endDate)
    const month = endParts.find((part) => part.type === "month")?.value
    const year = endParts.find((part) => part.type === "year")?.value

    return `${startDate.getUTCDate()}-${endDate.getUTCDate()} ${month} ${year}`
  }

  return `${thaiDateFormatter.format(startDate)} - ${thaiDateFormatter.format(endDate)}`
}

export function formatTournamentFormat(format: TournamentFormat): string {
  return format === "THREE_V_THREE" ? "3x3" : "5x5"
}
