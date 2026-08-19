import { describe, expect, it } from "vitest"

import {
  BracketGenerationMethod,
  BracketMode,
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
  })
})
