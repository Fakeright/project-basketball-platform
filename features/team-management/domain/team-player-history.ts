import type { TeamPlayer, TeamPlayerDraft } from "./team"

export interface TeamPlayerHistorySource extends TeamPlayer {
  teamName: string
}

export interface ReusableTeamPlayerSourceTeam {
  id: string
  name: string
  playerIsActive: boolean
}

export interface ReusableTeamPlayer {
  key: string
  player: TeamPlayerDraft
  isActive: boolean
  sourceTeams: ReusableTeamPlayerSourceTeam[]
}

interface PlayerHistoryGroup {
  selected: TeamPlayerHistorySource
  sources: TeamPlayerHistorySource[]
}

export function projectReusableTeamPlayers(
  sources: readonly TeamPlayerHistorySource[],
): ReusableTeamPlayer[] {
  const groups = new Map<string, PlayerHistoryGroup>()

  for (const source of sources) {
    const identity = normalizedPlayerIdentity(source)
    const group = groups.get(identity)

    if (!group) {
      groups.set(identity, { selected: source, sources: [source] })
      continue
    }

    group.sources.push(source)
    if (compareCanonicalSources(source, group.selected) < 0) {
      group.selected = source
    }
  }

  return [...groups.values()]
    .map(projectPlayerHistoryGroup)
    .sort((left, right) => compareStrings(left.key, right.key))
}

function normalizedPlayerIdentity(player: TeamPlayerDraft): string {
  return [
    player.firstName.trim().toLowerCase(),
    player.lastName.trim().toLowerCase(),
    player.birthDate,
  ].join("\u0000")
}

function compareCanonicalSources(
  left: TeamPlayerHistorySource,
  right: TeamPlayerHistorySource,
): number {
  if (left.updatedAt !== right.updatedAt) {
    return left.updatedAt > right.updatedAt ? -1 : 1
  }
  return compareStrings(left.id, right.id)
}

function projectPlayerHistoryGroup(group: PlayerHistoryGroup): ReusableTeamPlayer {
  const selected = group.selected
  const sourceTeams = new Map<string, ReusableTeamPlayerSourceTeam>()

  for (const source of group.sources) {
    const existing = sourceTeams.get(source.teamId)
    sourceTeams.set(source.teamId, {
      id: source.teamId,
      name:
        existing && compareStrings(existing.name, source.teamName) <= 0
          ? existing.name
          : source.teamName,
      playerIsActive: Boolean(existing?.playerIsActive || source.isActive),
    })
  }

  return {
    key: selected.id,
    player: {
      firstName: selected.firstName,
      lastName: selected.lastName,
      nickname: selected.nickname,
      birthDate: selected.birthDate,
      jerseyNumber: selected.jerseyNumber,
      position: selected.position,
      phone: selected.phone,
    },
    isActive: group.sources.some((source) => source.isActive),
    sourceTeams: [...sourceTeams.values()].sort((left, right) =>
      compareStrings(left.id, right.id),
    ),
  }
}

function compareStrings(left: string, right: string): number {
  if (left === right) return 0
  return left < right ? -1 : 1
}
