import { describe, expect, it } from "vitest"

import { permissionsByRole } from "@/features/identity/domain/permission"

describe("role permissions", () => {
  it("allows tournament organizers to start and complete owned competitions", () => {
    const permissions = permissionsByRole.TOURNAMENT_ORGANIZER

    expect(permissions.has("tournament.start")).toBe(true)
    expect(permissions.has("tournament.complete")).toBe(true)
  })

  it("does not grant competition lifecycle commands to players", () => {
    const permissions = permissionsByRole.PLAYER

    expect(permissions.has("tournament.start")).toBe(false)
    expect(permissions.has("tournament.complete")).toBe(false)
  })
})
