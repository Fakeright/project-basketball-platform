import type { TeamFormat, TeamPlayer } from "./team"

export type RosterFormat = TeamFormat

const minimumPlayersByFormat: Record<TeamFormat, number> = {
  FIVE_V_FIVE: 5,
  THREE_V_THREE: 3,
}

export function assertRosterEligibility(
  format: TeamFormat,
  players: readonly TeamPlayer[],
): void {
  const activePlayerCount = players.filter((player) => player.isActive).length

  if (activePlayerCount < minimumPlayersByFormat[format]) {
    throw new Error("ROSTER_INCOMPLETE")
  }
}
