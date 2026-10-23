/**
 * COURTSIDE: คำอธิบายไฟล์
 * สร้าง Supabase client สิทธิ์บริการสำหรับฝั่งเซิร์ฟเวอร์เท่านั้น ไม่ส่ง service key ไปเบราว์เซอร์
 * เรียกใช้จาก: features/identity/infrastructure/get-auth-handlers.ts
 * ตามการทำงานต่อ: lib/supabase/config.ts
 */

import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getAdminSupabaseConfiguration } from "./config"

// สร้าง client ฝั่งเซิร์ฟเวอร์ด้วย service key สำหรับงานที่ได้รับสิทธิ์แล้วเท่านั้น
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
