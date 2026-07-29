import { createServerClient, type CookieMethodsServer } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getPublicSupabaseConfiguration } from "./config"
import { AuthDependencyUnavailableError } from "@/features/identity/application/auth-errors"

interface ProxySupabaseClient {
  auth: {
    getUser(): Promise<unknown>
  }
}

interface ProxyDependencies {
  url: string
  publishableKey: string
  createClient(
    url: string,
    publishableKey: string,
    options: { cookies: CookieMethodsServer },
  ): ProxySupabaseClient
}

export async function refreshSupabaseSession(
  request: NextRequest,
  dependencies: ProxyDependencies = getProxyDependencies(),
) {
  let response = NextResponse.next({ request })
  const client = dependencies.createClient(
    dependencies.url,
    dependencies.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }

          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
          for (const [name, value] of Object.entries(headers)) {
            response.headers.set(name, value)
          }
        },
      },
    },
  )

  try {
    const result = await client.auth.getUser()
    if (
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      isProviderOutage(result.error)
    ) {
      throw new AuthDependencyUnavailableError()
    }
  } catch (error) {
    if (error instanceof AuthDependencyUnavailableError) throw error
    throw new AuthDependencyUnavailableError()
  }
  return response
}

function isProviderOutage(error: unknown) {
  if (!error) return false
  if (typeof error !== "object") return true
  if (!("status" in error) || typeof error.status !== "number") {
    return true
  }
  return error.status >= 500
}

function getProxyDependencies(): ProxyDependencies {
  const { url, publishableKey } =
    getPublicSupabaseConfiguration()

  return {
    url,
    publishableKey,
    createClient: (supabaseUrl, key, options) =>
      createServerClient(supabaseUrl, key, options),
  }
}
