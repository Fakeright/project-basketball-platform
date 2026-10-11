import { describe, expect, it } from "vitest"

import { permissions, permissionsByRole } from "@/features/identity/domain/permission"

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

  it("reserves reopening tournament registration for platform admins", () => {
    expect(permissions).toContain("tournament.registration.reopen")
    expect(
      permissionsByRole.PLATFORM_ADMIN.has("tournament.registration.reopen"),
    ).toBe(true)
    expect(
      permissionsByRole.TOURNAMENT_ORGANIZER.has(
        "tournament.registration.reopen",
      ),
    ).toBe(false)
  })
})
