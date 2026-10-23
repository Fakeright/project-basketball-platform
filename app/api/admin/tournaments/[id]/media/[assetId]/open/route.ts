/**
 * COURTSIDE: คำอธิบายไฟล์
 * API GET /api/admin/tournaments/[id]/media/[assetId]/open: รับคำขอ HTTP และประสานบริการที่ใช้จัดการคำขอนี้
 * ตามการทำงานต่อ: features/identity/infrastructure/next-cookie-current-actor-provider.ts, features/shared/presentation/safe-http.ts, features/tournament-media/application/get-admin-review-media.ts
 */

import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"
import { getAdminReviewDocumentUrl } from "@/features/tournament-media/application/get-admin-review-media"
import { getTournamentMediaRepository } from "@/features/tournament-media/infrastructure/get-tournament-media-repository"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]/media/[assetId]/open">,
) {
  return withSafeRouteBoundary("tournament.media.admin_open", async () => {
    const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
    if (!actor) return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    if (actor.role !== "PLATFORM_ADMIN") {
      return Response.json({ message: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 })
    }

    const { id, assetId } = await context.params
    const media = await getTournamentMediaRepository()
    const storage = new SupabaseObjectStorage()

    try {
      const url = await getAdminReviewDocumentUrl(id, assetId, actor, {
        media,
        storage,
      })
      return new Response(null, {
        status: 302,
        headers: {
          Location: url,
          "Cache-Control": "private, no-store",
          "Referrer-Policy": "no-referrer",
        },
      })
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        return Response.json({ message: "ไม่พบเอกสาร" }, { status: 404 })
      }
      throw error
    }
  })
}
