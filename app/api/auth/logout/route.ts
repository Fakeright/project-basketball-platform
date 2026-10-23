/**
 * COURTSIDE: คำอธิบายไฟล์
 * API POST /api/auth/logout: รับคำขอ HTTP และประสานบริการที่ใช้จัดการคำขอนี้
 * ตามการทำงานต่อ: features/identity/infrastructure/get-auth-handlers.ts, features/shared/presentation/safe-http.ts
 */

import { getAuthRouteContext } from "@/features/identity/infrastructure/get-auth-handlers"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function POST() {
  return withSafeRouteBoundary("auth.logout.route", async () => {
    const context = await getAuthRouteContext()
    return context.finalizeResponse(
      await context.handlers.logout(),
    )
  })
}
