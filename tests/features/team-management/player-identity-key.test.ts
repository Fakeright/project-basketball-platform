import { describe, expect, it } from "vitest"

import { normalizedPlayerIdentityParts } from "@/features/team-management/domain/player-identity"

describe("normalizedPlayerIdentityParts", () => {
  it("matches the same name and date within one owner despite casing and outer spaces", () => {
    expect(normalizedPlayerIdentityParts("  Arun ", " JAI ", "2007-02-15")).toEqual({
      firstName: "arun",
      lastName: "jai",
      birthDate: "2007-02-15",
    })
  })

  it("does not merge different dates", () => {
    expect(normalizedPlayerIdentityParts("Arun", "Jai", "2007-02-15")).not.toEqual(
      normalizedPlayerIdentityParts("Arun", "Jai", "2008-02-15"),
    )
  })
})
