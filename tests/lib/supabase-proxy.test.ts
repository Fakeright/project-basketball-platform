import { NextRequest } from "next/server"
import { describe, expect, it, vi } from "vitest"

import { refreshSupabaseSession } from "@/lib/supabase/proxy"
import { AuthDependencyUnavailableError } from "@/features/identity/presentation/auth-handler"

describe("Supabase session proxy", () => {
  it("refreshes the session and propagates cookies with Supabase headers", async () => {
    const request = new NextRequest("http://localhost/tournaments", {
      headers: {
        cookie: "sb-session=old-session",
      },
    })
    const getUser = vi.fn(async () => ({ data: { user: null }, error: null }))

    const response = await refreshSupabaseSession(request, {
      url: "https://project.supabase.co",
      publishableKey: "publishable",
      createClient(_url, _key, options) {
        return {
          auth: {
            async getUser() {
              await options.cookies.setAll?.(
                [
                  {
                    name: "sb-session",
                    value: "refreshed-session",
                    options: {
                      httpOnly: true,
                      path: "/",
                      sameSite: "lax",
                      secure: true,
                      maxAge: 3_600,
                    },
                  },
                ],
                {
                  "Cache-Control":
                    "private, no-cache, no-store, must-revalidate, max-age=0",
                  Expires: "0",
                  Pragma: "no-cache",
                },
              )
              return getUser()
            },
          },
        }
      },
    })

    expect(getUser).toHaveBeenCalledOnce()
    expect(response.cookies.get("sb-session")?.value).toBe(
      "refreshed-session",
    )
    expect(response.headers.get("cache-control")).toBe(
      "private, no-cache, no-store, must-revalidate, max-age=0",
    )
    expect(response.headers.get("expires")).toBe("0")
    expect(response.headers.get("pragma")).toBe("no-cache")
    expect(response.headers.get("set-cookie")).toContain("HttpOnly")
    expect(response.headers.get("set-cookie")).toContain("SameSite=lax")
  })

  it("maps provider outages to typed unavailability without exposing details", async () => {
    const request = new NextRequest("http://localhost/tournaments")

    await expect(
      refreshSupabaseSession(request, {
        url: "https://project.supabase.co",
        publishableKey: "publishable",
        createClient() {
          return {
            auth: {
              async getUser() {
                return {
                  data: { user: null },
                  error: {
                    status: 503,
                    message: "provider secret detail",
                  },
                }
              },
            },
          }
        },
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "AuthDependencyUnavailableError",
        message: "AUTH_DEPENDENCY_UNAVAILABLE",
      }),
    )
    await expect(
      refreshSupabaseSession(request, {
        url: "https://project.supabase.co",
        publishableKey: "publishable",
        createClient() {
          return {
            auth: {
              async getUser() {
                throw new Error("network secret detail")
              },
            },
          }
        },
      }),
    ).rejects.toBeInstanceOf(AuthDependencyUnavailableError)
  })
})
