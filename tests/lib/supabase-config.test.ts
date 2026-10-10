import { describe, expect, it } from "vitest"

import { AuthDependencyUnavailableError } from "@/features/identity/presentation/auth-handler"
import {
  getApplicationUrl,
  getAdminSupabaseConfiguration,
  getPublicSupabaseConfiguration,
  getRecoverySecret,
  resolvePublicSupabaseConfigurationForRuntime,
} from "@/lib/supabase/config"

describe("Supabase auth configuration", () => {
  it("allows a localhost APP_URL default only in development", () => {
    expect(getApplicationUrl({}, "development").toString()).toBe(
      "http://localhost:3000/",
    )
    expect(() => getApplicationUrl({}, "production")).toThrow(
      AuthDependencyUnavailableError,
    )
    expect(() => getApplicationUrl({}, "test")).toThrow(
      AuthDependencyUnavailableError,
    )
  })

  it("rejects APP_URL values with credentials, path, query, or unsafe protocol", () => {
    for (const appUrl of [
      "ftp://courtside.example",
      "https://user:pass@courtside.example",
      "https://courtside.example/base",
      "https://courtside.example/?query=1",
    ]) {
      expect(() =>
        getApplicationUrl({ APP_URL: appUrl }, "production"),
      ).toThrow(AuthDependencyUnavailableError)
    }
  })

  it("requires HTTPS in production and permits HTTP only on loopback outside production", () => {
    expect(() =>
      getApplicationUrl(
        { APP_URL: "http://localhost:3000" },
        "production",
      ),
    ).toThrow(AuthDependencyUnavailableError)
    expect(() =>
      getApplicationUrl(
        { APP_URL: "http://courtside.internal:3000" },
        "development",
      ),
    ).toThrow(AuthDependencyUnavailableError)
    expect(() =>
      getApplicationUrl(
        { APP_URL: "http://courtside.internal:3000" },
        "test",
      ),
    ).toThrow(AuthDependencyUnavailableError)

    for (const loopbackUrl of [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://[::1]:3000",
    ]) {
      expect(
        getApplicationUrl(
          { APP_URL: loopbackUrl },
          "development",
        ).origin,
      ).toBe(new URL(loopbackUrl).origin)
      expect(
        getApplicationUrl({ APP_URL: loopbackUrl }, "test").origin,
      ).toBe(new URL(loopbackUrl).origin)
    }
  })

  it("requires public Supabase configuration outside explicit development fallback", () => {
    expect(() => getPublicSupabaseConfiguration({})).toThrow(
      AuthDependencyUnavailableError,
    )
    expect(
      getPublicSupabaseConfiguration({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
      }),
    ).toEqual({
      url: "https://project.supabase.co",
      publishableKey: "publishable",
    })
  })

  it("uses an absent-session development fallback but never one in test or production", () => {
    expect(
      resolvePublicSupabaseConfigurationForRuntime({}, "development"),
    ).toBeNull()
    expect(() =>
      resolvePublicSupabaseConfigurationForRuntime({}, "test"),
    ).toThrow(AuthDependencyUnavailableError)
    expect(() =>
      resolvePublicSupabaseConfigurationForRuntime({}, "production"),
    ).toThrow(AuthDependencyUnavailableError)
  })

  it("requires a dedicated recovery secret with at least 32 bytes", () => {
    expect(() =>
      getRecoverySecret({ AUTH_RECOVERY_SECRET: "too-short" }),
    ).toThrow(AuthDependencyUnavailableError)
    expect(
      getRecoverySecret({
        AUTH_RECOVERY_SECRET:
          "a-dedicated-recovery-secret-with-32-bytes",
      }),
    ).toBe("a-dedicated-recovery-secret-with-32-bytes")
  })

  it("treats missing server-only admin configuration as dependency unavailability", () => {
    expect(() =>
      getAdminSupabaseConfiguration({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      }),
    ).toThrow(AuthDependencyUnavailableError)
    expect(
      getAdminSupabaseConfiguration({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "server-only-service-role",
      }),
    ).toEqual({
      url: "https://project.supabase.co",
      serviceRoleKey: "server-only-service-role",
    })
  })
})
