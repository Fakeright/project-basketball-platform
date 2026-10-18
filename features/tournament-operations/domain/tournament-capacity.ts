export const MIN_TOURNAMENT_CAPACITY = 6
export const MAX_TOURNAMENT_CAPACITY = 32
export const SUPPORTED_TOURNAMENT_CAPACITIES = [8, 16, 32] as const

export function isValidTournamentCapacity(capacity: number): boolean {
  return SUPPORTED_TOURNAMENT_CAPACITIES.some((value) => value === capacity)
}

export function isLegacyTournamentCapacity(capacity: number): boolean {
  return (
    Number.isInteger(capacity) &&
    capacity % 2 === 0 &&
    capacity >= MIN_TOURNAMENT_CAPACITY &&
    capacity <= MAX_TOURNAMENT_CAPACITY
  )
}
