"use client"

import { createBrowserClient } from "@supabase/ssr"

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) {
    throw new Error("SUPABASE_PUBLIC_CONFIGURATION_MISSING")
  }

  return createBrowserClient(
    url,
    publishableKey,
  )
}
