import { randomUUID } from "node:crypto"

export interface SafeHttpDiagnostics {
  createCorrelationId?: () => string
  logger?: {
    error(event: {
      operation: string
      correlationId: string
      errorType: "Error" | "NonError"
    }): void
  }
}

export async function parseJsonRequest(
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false }> {
  try {
    return { ok: true, value: await request.json() }
  } catch (error) {
    if (error instanceof SyntaxError) return { ok: false }
    throw error
  }
}

export function unexpectedFailureResponse(
  error: unknown,
  operation: string,
  diagnostics: SafeHttpDiagnostics = {},
) {
  const correlationId = createCorrelationId(diagnostics.createCorrelationId)
  const event = {
    operation,
    correlationId,
    errorType: error instanceof Error ? ("Error" as const) : ("NonError" as const),
  }
  try {
    ;(diagnostics.logger ?? defaultSafeHttpLogger).error(event)
  } catch {}

  return Response.json(
    {
      message: "ไม่สามารถดำเนินการได้ในขณะนี้",
      correlationId,
    },
    { status: 500 },
  )
}

function createCorrelationId(factory?: () => string) {
  if (factory) {
    try {
      return factory()
    } catch {}
  }
  return randomUUID()
}

const defaultSafeHttpLogger: NonNullable<SafeHttpDiagnostics["logger"]> = {
  error(event) {
    console.error(event)
  },
}
