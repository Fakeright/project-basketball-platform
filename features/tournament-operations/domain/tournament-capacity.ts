export const MIN_TOURNAMENT_CAPACITY = 6
export const MAX_TOURNAMENT_CAPACITY = 32

export function isValidTournamentCapacity(capacity: number): boolean {
  return (
    Number.isInteger(capacity) &&
    capacity % 2 === 0 &&
    capacity >= MIN_TOURNAMENT_CAPACITY &&
    capacity <= MAX_TOURNAMENT_CAPACITY
  )
}
