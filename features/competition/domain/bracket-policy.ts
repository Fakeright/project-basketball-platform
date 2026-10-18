export function assertEntriesCanBeLocked(input: {
  tournamentStatus: string
  approvedTeamIds: readonly string[]
  capacity: number
}): void {
  if (input.tournamentStatus !== "REGISTRATION_CLOSED") {
    throw new Error("BRACKET_ENTRY_LOCK_UNAVAILABLE")
  }

  const entryCount = input.approvedTeamIds.length
  const uniqueTeamCount = new Set(input.approvedTeamIds).size
  const hasValidCapacity =
    Number.isInteger(input.capacity) && input.capacity >= 2 && input.capacity <= 32

  if (
    !hasValidCapacity ||
    entryCount < 2 ||
    entryCount > 32 ||
    entryCount > input.capacity ||
    uniqueTeamCount !== entryCount
  ) {
    throw new Error("BRACKET_ENTRY_COUNT_INVALID")
  }
}

export function assertBracketStructureMutable(input: {
  hasStartedMatch: boolean
}): void {
  if (input.hasStartedMatch) {
    throw new Error("BRACKET_STRUCTURE_LOCKED")
  }
}

export function assertSystemBracketEntryCount(count: number): void {
  if (count !== 8 && count !== 16 && count !== 32) {
    throw new Error("BRACKET_ENTRY_COUNT_UNSUPPORTED")
  }
}

export function validateOrderedPositions(
  entries: readonly { entryId: string; position: number }[],
): void {
  const positions = entries.map((entry) => entry.position)
  if (
    new Set(entries.map((entry) => entry.entryId)).size !== entries.length ||
    new Set(positions).size !== entries.length ||
    positions.some((position) =>
      !Number.isInteger(position) || position < 1 || position > entries.length
    )
  ) {
    throw new Error("BRACKET_ORDER_INVALID")
  }
}

export function validateSeeds(
  entries: readonly { entryId: string; seed: number }[],
): void {
  const entryCount = entries.length
  const seedValues = entries.map((entry) => entry.seed)
  const entryIds = entries.map((entry) => entry.entryId)
  const hasValidSeeds = seedValues.every(
    (seed) => Number.isInteger(seed) && seed >= 1 && seed <= entryCount,
  )

  if (
    entryCount < 2 ||
    entryCount > 32 ||
    new Set(seedValues).size !== entryCount ||
    new Set(entryIds).size !== entryCount ||
    !hasValidSeeds
  ) {
    throw new Error("BRACKET_SEED_INVALID")
  }
}
