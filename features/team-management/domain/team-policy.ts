import type { TeamFormat, TeamPlayer, TeamRosterMember } from "./team"

export type RosterFormat = TeamFormat

const minimumPlayersByFormat: Record<TeamFormat, number> = {
  FIVE_V_FIVE: 5,
  THREE_V_THREE: 3,
}

export function assertRosterEligibility(
  format: TeamFormat,
  players: readonly TeamPlayer[],
): void {
  assertMinimumActivePlayerCount(
    format,
    players.filter((player) => player.isActive).length,
  )
}

export function assertLegacyRegistrationRosterEligibility(
  format: TeamFormat,
  members: readonly TeamRosterMember[],
): void {
  assertMinimumActivePlayerCount(
    format,
    members.filter((member) => member.isActive && member.role === "PLAYER").length,
  )
}

function assertMinimumActivePlayerCount(
  format: TeamFormat,
  activePlayerCount: number,
): void {
  if (activePlayerCount < minimumPlayersByFormat[format]) {
    throw new Error("ROSTER_INCOMPLETE")
  }
}
