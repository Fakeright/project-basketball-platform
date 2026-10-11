import type { TournamentStatus } from "./tournament"

export function resolvePublicTournamentStatus(
  status: TournamentStatus,
  registrationDeadline: string,
  now: Date,
): TournamentStatus {
  if (status !== "OPEN") return status

  const deadline = Date.parse(registrationDeadline)
  return Number.isFinite(deadline) && now.getTime() <= deadline ? "OPEN" : "CLOSED"
}
