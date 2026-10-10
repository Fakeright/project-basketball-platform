import { createHash } from "node:crypto"

import type { LockedBracketEntry } from "@/features/competition/domain/competition"

export function tokenizedBracketShuffle(
  entries: readonly LockedBracketEntry[],
  token: string,
): LockedBracketEntry[] {
  return [...entries].sort((left, right) => {
    const hashOrder = hashEntry(token, left.id).localeCompare(
      hashEntry(token, right.id),
    )
    return hashOrder || left.id.localeCompare(right.id)
  })
}

function hashEntry(token: string, entryId: string) {
  return createHash("sha256").update(token).update(":").update(entryId).digest("hex")
}
