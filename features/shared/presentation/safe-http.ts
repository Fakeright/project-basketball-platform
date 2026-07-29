import { randomUUID } from "node:crypto"

export interface SafeHttpDiagnostics {
  createCorrelationId?: () => string
  logger?: {
    error(event: {
      operation: string
      correlationId: string
      errorType: string
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
  status = 500,
) {
  const correlationId = createCorrelationId(diagnostics.createCorrelationId)
  const event = {
    operation,
    correlationId,
    errorType: safeErrorType(error),
  }
  try {
    ;(diagnostics.logger ?? defaultSafeHttpLogger).error(event)
  } catch {}

  return Response.json(
    {
      message: "ไม่สามารถดำเนินการได้ในขณะนี้",
      correlationId,
    },
    { status },
  )
}

export async function withSafeRouteBoundary(
  operation: string,
  execute: () => Promise<Response>,
  diagnostics: SafeHttpDiagnostics = {},
) {
  try {
    return await execute()
  } catch (error) {
    return unexpectedFailureResponse(error, operation, diagnostics)
  }
}

function createCorrelationId(factory?: () => string) {
  if (factory) {
    try {
      return factory()
    } catch {}
  }
  return randomUUID()
}

function safeErrorType(error: unknown) {
  if (!(error instanceof Error)) return "NonError"
  return /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(error.name)
    ? error.name
    : "Error"
}

const defaultSafeHttpLogger: NonNullable<SafeHttpDiagnostics["logger"]> = {
  error(event) {
    console.error(event)
  },
}
