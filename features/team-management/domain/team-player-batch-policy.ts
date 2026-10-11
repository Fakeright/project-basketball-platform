import type { TeamPlayerDraft } from "./team"

export const maximumTeamPlayerBatchSize = 30

export interface TeamPlayerBatchOptions {
  allowEmpty: boolean
}

export function assertTeamPlayerBatch(
  players: readonly TeamPlayerDraft[],
  options: TeamPlayerBatchOptions,
): void {
  if (
    players.length > maximumTeamPlayerBatchSize ||
    (!options.allowEmpty && players.length === 0)
  ) {
    throw new Error("PLAYER_BATCH_INVALID")
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
