import { randomUUID } from "node:crypto"

import { NextResponse, type NextRequest } from "next/server"

import { AuthDependencyUnavailableError } from "@/features/identity/application/auth-errors"
import { refreshSupabaseSession } from "@/lib/supabase/proxy"
import { resolvePublicSupabaseConfigurationForRuntime } from "@/lib/supabase/config"

export async function proxy(request: NextRequest) {
  return handleProxyRequest(request)
}

interface ProxyBoundaryDependencies {
  resolveConfiguration: typeof resolvePublicSupabaseConfigurationForRuntime
  refreshSession: typeof refreshSupabaseSession
  createCorrelationId: () => string
  logger: {
    error(event: {
      operation: string
      correlationId: string
      errorType: string
    }): void
  }
}

export async function handleProxyRequest(
  request: NextRequest,
  dependencies: ProxyBoundaryDependencies = {
    resolveConfiguration:
      resolvePublicSupabaseConfigurationForRuntime,
    refreshSession: refreshSupabaseSession,
    createCorrelationId: randomUUID,
    logger: {
      error(event) {
        console.error(event)
      },
    },
  },
) {
  try {
    const configuration = dependencies.resolveConfiguration()
    if (!configuration) return NextResponse.next({ request })
    return await dependencies.refreshSession(request)
  } catch (error) {
    if (!(error instanceof AuthDependencyUnavailableError)) throw error

    const correlationId = dependencies.createCorrelationId()
    try {
      dependencies.logger.error({
        operation: "auth.proxy.refresh",
        correlationId,
        errorType: error.name,
      })
    } catch {}

    return Response.json(
      {
        message: "ระบบยืนยันตัวตนไม่พร้อมใช้งานในขณะนี้",
        correlationId,
      },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      },
    )
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
