import { getAuthRouteContext } from "@/features/identity/infrastructure/get-auth-handlers"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function GET(request: Request) {
  return withSafeRouteBoundary("auth.callback.route", async () => {
    const context = await getAuthRouteContext()
    return context.finalizeResponse(
      await context.handlers.callback(request),
    )
  })
}
