import { getAuthRouteContext } from "@/features/identity/infrastructure/get-auth-handlers"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function POST(request: Request) {
  return withSafeRouteBoundary("auth.reset_password.route", async () => {
    const context = await getAuthRouteContext()
    return context.finalizeResponse(
      await context.handlers.resetPassword(request),
    )
  })
}
