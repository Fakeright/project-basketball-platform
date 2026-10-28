/**
 * COURTSIDE: คำอธิบายไฟล์
 * รวมการอ่าน JSON และขอบเขตดักข้อผิดพลาดที่คืนรหัสติดตาม โดยไม่ส่งรายละเอียดภายในให้ผู้ใช้
 * เรียกใช้จาก: app/api/admin/tournaments/[id]/close-registration/route.ts, app/api/admin/tournaments/[id]/governance/route.ts
 */

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

// แยกกรณี JSON ใช้ไม่ได้ออกจากข้อมูลที่ parse สำเร็จ เพื่อให้ handler ตอบ validation error ได้
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

// คืนข้อความทั่วไปพร้อมรหัสติดตาม และบันทึกเหตุผิดพลาดสำหรับผู้พัฒนาโดยไม่ส่งรายละเอียดภายในไปหน้าเว็บ
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

// ห่อการทำงานของ route เพื่อแปลงข้อผิดพลาดที่หลุดออกมาเป็น Response ที่ควบคุมได้
export async function withSafeRouteBoundary(
  operation: string,
  execute: () => Promise<Response>,
  diagnostics: SafeHttpDiagnostics = {},
) {
  try {
    return await execute()
  } catch (error) {
    return unexpectedFailureResponse(
      error,
      operation,
      diagnostics,
      safeFailureStatus(error),
    )
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

function safeFailureStatus(error: unknown) {
  if (typeof error !== "object" || error === null) return 500
  try {
    return "safeHttpStatus" in error && error.safeHttpStatus === 503
      ? 503
      : 500
  } catch {
    return 500
  }
}

const defaultSafeHttpLogger: NonNullable<SafeHttpDiagnostics["logger"]> = {
  error(event) {
    console.error(event)
  },
}
