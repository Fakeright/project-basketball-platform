import "server-only"

import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptions,
} from "@supabase/ssr"
import { cookies } from "next/headers"
import { getPublicSupabaseConfiguration } from "./config"

interface CookieReader {
  getAll(): Promise<Array<{ name: string; value: string }>> | Array<{
    name: string
    value: string
  }>
}

interface MutableCookieAdapterInput extends CookieReader {
  setCookie(name: string, value: string, options: CookieOptions): void
  setHeader(name: string, value: string): void
}

export function createReadOnlyCookieMethods(
  reader: CookieReader,
): CookieMethodsServer {
  return {
    getAll: () => reader.getAll(),
    setAll: async () => undefined,
  }
}

export function createMutableCookieMethods(
  adapter: MutableCookieAdapterInput,
): CookieMethodsServer {
  return {
    getAll: () => adapter.getAll(),
    setAll(cookiesToSet, headers) {
      for (const { name, value, options } of cookiesToSet) {
        adapter.setCookie(name, value, options)
      }
      for (const [name, value] of Object.entries(headers)) {
        adapter.setHeader(name, value)
      }
    },
  }
}

export async function createServerComponentSupabaseClient() {
  const cookieStore = await cookies()
  const config = getPublicSupabaseConfiguration()

  return createServerClient(config.url, config.publishableKey, {
    cookies: createReadOnlyCookieMethods({
      getAll: () => cookieStore.getAll(),
    }),
  })
}

export async function createRouteHandlerSupabaseContext() {
  const cookieStore = await cookies()
  const responseHeaders = new Headers()
  const config = getPublicSupabaseConfiguration()

  const client = createServerClient(config.url, config.publishableKey, {
    cookies: createMutableCookieMethods({
      getAll: () => cookieStore.getAll(),
      setCookie(name, value, options) {
        cookieStore.set(name, value, options)
      },
      setHeader(name, value) {
        responseHeaders.set(name, value)
      },
    }),
  })

  return {
    client,
    finalizeResponse(response: Response) {
      const headers = new Headers(response.headers)
      responseHeaders.forEach((value, name) => headers.set(name, value))
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    },
  }
}

export async function createServerSupabaseClient() {
  return createServerComponentSupabaseClient()
}
