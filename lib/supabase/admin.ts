import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getAdminSupabaseConfiguration } from "./config"

export function createAdminSupabaseClient() {
  const { url, serviceRoleKey } =
    getAdminSupabaseConfiguration()

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}
