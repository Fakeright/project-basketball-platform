import { describe, expect, it, vi } from "vitest"

import {
  createMutableCookieMethods,
  createReadOnlyCookieMethods,
} from "@/lib/supabase/server"

const refreshedCookie = {
  name: "sb-session",
  value: "new-session-value",
  options: {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: true,
    maxAge: 3_600,
  },
}

const noCacheHeaders = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
}

describe("Supabase server cookie adapters", () => {
  it("does not throw when Supabase attempts a write during Server Component rendering", async () => {
    const methods = createReadOnlyCookieMethods({
      getAll: () => [{ name: "sb-session", value: "old" }],
    })

    await expect(
      methods.setAll?.([refreshedCookie], noCacheHeaders),
    ).resolves.toBeUndefined()
    expect(await methods.getAll()).toEqual([
      { name: "sb-session", value: "old" },
    ])
  })

  it("propagates every cookie option and no-cache header in mutable contexts", async () => {
    const setCookie = vi.fn()
    const setHeader = vi.fn()
    const methods = createMutableCookieMethods({
      getAll: () => [],
      setCookie,
      setHeader,
    })

    await methods.setAll?.([refreshedCookie], noCacheHeaders)

    expect(setCookie).toHaveBeenCalledWith(
      refreshedCookie.name,
      refreshedCookie.value,
      refreshedCookie.options,
    )
    expect(setHeader).toHaveBeenCalledWith(
      "Cache-Control",
      noCacheHeaders["Cache-Control"],
    )
    expect(setHeader).toHaveBeenCalledWith("Expires", "0")
    expect(setHeader).toHaveBeenCalledWith("Pragma", "no-cache")
  })
})
