import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import {
  BracketGenerationMethod,
  BracketMode,
  MatchPurpose,
  MatchSlot,
} from "@/lib/generated/prisma/client"

describe("competition persistence schema", () => {
  it("exposes bracket modes, draw methods, and advancement slots", () => {
    expect(BracketMode).toMatchObject({
      SYSTEM_GENERATED: "SYSTEM_GENERATED",
      EXTERNAL_DOCUMENT: "EXTERNAL_DOCUMENT",
    })
    expect(BracketGenerationMethod).toMatchObject({
      SEEDED: "SEEDED",
      RANDOM: "RANDOM",
    })
    expect(MatchSlot).toMatchObject({ HOME: "HOME", AWAY: "AWAY" })
    expect(MatchPurpose).toMatchObject({
      STANDARD: "STANDARD",
      THIRD_PLACE: "THIRD_PLACE",
      CHAMPIONSHIP: "CHAMPIONSHIP",
    })
  })

  it("enforces one placement match of each purpose per bracket", () => {
    const migration = readFileSync(
      resolve(
        process.cwd(),
        "prisma/migrations/20260820090000_add_match_purpose/migration.sql",
      ),
      "utf8",
    )

    expect(migration).toContain(
      'CREATE UNIQUE INDEX "Match_bracketId_placementPurpose_key"',
    )
    expect(migration).toContain(
      "WHERE \"purpose\" IN ('THIRD_PLACE', 'CHAMPIONSHIP')",
    )
  })
})
