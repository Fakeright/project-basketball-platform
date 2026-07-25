import { describe, expect, it } from "vitest"

import {
  CookieCurrentActorProvider,
  getDevelopmentSessionDestination,
} from "@/features/identity/infrastructure/cookie-current-actor-provider"

describe("CookieCurrentActorProvider", () => {
  it("resolves a known development actor", async () => {
    const provider = new CookieCurrentActorProvider(
      async () => "admin-1",
      true,
    )

    await expect(provider.getCurrentActor()).resolves.toEqual({
      id: "admin-1",
      role: "PLATFORM_ADMIN",
    })
  })

  it("does not trust development cookies when disabled", async () => {
    const provider = new CookieCurrentActorProvider(
      async () => "admin-1",
      false,
    )

    await expect(provider.getCurrentActor()).resolves.toBeNull()
  })
})

describe("getDevelopmentSessionDestination", () => {
  it("sends organizers to their workspace", () => {
    expect(getDevelopmentSessionDestination("organizer-1")).toBe("/organizer")
  })

  it("sends platform admins to the admin dashboard", () => {
    expect(getDevelopmentSessionDestination("admin-1")).toBe("/admin")
  })
})
