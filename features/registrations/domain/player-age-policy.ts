import type { TeamPlayer } from "@/features/team-management/domain/team"
import type { TournamentAgeGroup } from "@/features/tournament-operations/domain/tournament-age-group"
import { toBangkokCalendarDate } from "@/features/tournaments/domain/tournament-calendar"

export interface PlayerAgeIneligibleDetails {
  playerIds: string[]
}

export class PlayerAgeIneligibleError extends Error {
  readonly details: PlayerAgeIneligibleDetails

  constructor(playerIds: string[]) {
    super("PLAYER_AGE_INELIGIBLE")
    this.name = "PlayerAgeIneligibleError"
    this.details = { playerIds }
  }
}

const maximumAgeByGroup: Partial<Record<TournamentAgeGroup, number>> = {
  U12: 12,
  U14: 14,
  U16: 16,
  U18: 18,
  U23: 23,
}

export function assertRosterAgeEligibility(
  ageGroup: TournamentAgeGroup,
  startsAt: string,
  roster: readonly TeamPlayer[],
): void {
  const maximumAge = maximumAgeByGroup[ageGroup]
  if (maximumAge === undefined) return

  const startDate = dateOnlyToUtc(toBangkokCalendarDate(startsAt))
  const playerIds = roster
    .filter((player) => completedCalendarYears(player.birthDate, startDate) >= maximumAge)
    .map((player) => player.id)

  if (playerIds.length > 0) throw new PlayerAgeIneligibleError(playerIds)
}

function completedCalendarYears(birthDate: string, onDate: Date): number {
  const birth = dateOnlyToUtc(birthDate)
  let years = onDate.getUTCFullYear() - birth.getUTCFullYear()
  const birthdayHasPassed =
    onDate.getUTCMonth() > birth.getUTCMonth() ||
    (onDate.getUTCMonth() === birth.getUTCMonth() &&
      onDate.getUTCDate() >= birth.getUTCDate())

  if (!birthdayHasPassed) years -= 1
  return years
}

function dateOnlyToUtc(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) throw new Error("INVALID_PLAYER_BIRTH_DATE")
  return date
}
