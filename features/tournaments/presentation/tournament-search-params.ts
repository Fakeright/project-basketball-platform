import type {
  TournamentFormat,
  TournamentSearchFilters,
  TournamentStatus,
} from "@/features/tournaments/domain/tournament"
import { findProvinceByCode } from "@/features/provinces/domain/thai-provinces"

const formats = new Set<TournamentFormat>(["FIVE_V_FIVE", "THREE_V_THREE"])
const statuses = new Set<TournamentStatus>(["OPEN", "CLOSED", "ONGOING", "COMPLETED"])

function scalarValue(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

export function parseTournamentSearchParams(
  input: Record<string, string | string[] | undefined>,
): TournamentSearchFilters {
  const query = scalarValue(input.q)
  const provinceCode = scalarValue(input.province)
  const format = scalarValue(input.format)
  const ageGroup = scalarValue(input.ageGroup)
  const venue = scalarValue(input.venue)
  const date = scalarValue(input.date)
  const status = scalarValue(input.status)

  return {
    ...(query ? { query } : {}),
    ...(provinceCode && findProvinceByCode(provinceCode) ? { provinceCode } : {}),
    ...(format && formats.has(format as TournamentFormat) ? { format: format as TournamentFormat } : {}),
    ...(ageGroup ? { ageGroup } : {}),
    ...(venue ? { venue } : {}),
    ...(date ? { date } : {}),
    ...(status && statuses.has(status as TournamentStatus) ? { status: status as TournamentStatus } : {}),
  }
}

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
