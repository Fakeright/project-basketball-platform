import type { TeamRosterMember } from "./team"

export type RosterFormat = "FIVE_V_FIVE" | "THREE_V_THREE"

const minimumPlayersByFormat: Record<RosterFormat, number> = {
  FIVE_V_FIVE: 5,
  THREE_V_THREE: 3,
}

export function assertRosterEligibility(
  format: RosterFormat,
  members: readonly TeamRosterMember[],
): void {
  const activeMembers = members.filter((member) => member.isActive)
  const activePlayerCount = activeMembers.filter((member) => member.role === "PLAYER").length
  const activeCoachCount = activeMembers.filter((member) => member.role === "COACH").length

  if (activePlayerCount < minimumPlayersByFormat[format]) {
    throw new Error("ROSTER_INCOMPLETE")
  }

  if (activeCoachCount > 1) {
    throw new Error("ROSTER_COACH_LIMIT_EXCEEDED")
  }
}
