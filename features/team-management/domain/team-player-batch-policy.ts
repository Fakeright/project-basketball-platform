import type { TeamFormat, TeamPlayerDraft } from "./team"

export const maximumTeamPlayerBatchSize = 15

export function getMaximumTeamPlayerCount(format: TeamFormat): number {
  return format === "FIVE_V_FIVE" ? 15 : 4
}

export interface TeamPlayerBatchOptions {
  allowEmpty: boolean
  format?: TeamFormat
  existingActiveCount?: number
}

export function assertTeamPlayerBatch(
  players: readonly TeamPlayerDraft[],
  options: TeamPlayerBatchOptions,
): void {
  if (!options.allowEmpty && players.length === 0) {
    throw new Error("PLAYER_BATCH_INVALID")
  }
  const exceedsBatchLimit = players.length > maximumTeamPlayerBatchSize
  const exceedsRosterLimit = options.format !== undefined &&
    (options.existingActiveCount ?? 0) + players.length > getMaximumTeamPlayerCount(options.format)
  if (exceedsBatchLimit || exceedsRosterLimit) {
    throw new Error("PLAYER_LIMIT_EXCEEDED")
  }

  const identities = new Set<string>()
  const jerseyNumbers = new Set<number>()

  for (const player of players) {
    const identity = normalizedPlayerIdentity(player)
    if (identities.has(identity)) throw new Error("PLAYER_ALREADY_EXISTS")
    identities.add(identity)

    if (player.jerseyNumber === null) continue
    if (jerseyNumbers.has(player.jerseyNumber)) {
      throw new Error("JERSEY_ALREADY_IN_USE")
    }
    jerseyNumbers.add(player.jerseyNumber)
  }
}

function normalizedPlayerIdentity(player: TeamPlayerDraft): string {
  return [
    player.firstName.trim().toLowerCase(),
    player.lastName.trim().toLowerCase(),
    player.birthDate,
  ].join("\u0000")
}
