import { randomUUID } from "node:crypto"

import { z } from "zod"

import type { Actor, CurrentActorProvider } from "@/features/identity/domain/actor"
import type { ApplyToTournamentInput } from "@/features/registrations/application/apply-to-tournament"
import type { CancelRegistrationInput } from "@/features/registrations/application/cancel-registration"
import type { DecideRegistrationInput } from "@/features/registrations/application/decide-registration"
import type { WithdrawRegistrationInput } from "@/features/registrations/application/withdraw-registration"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"

const applySchema = z.object({ teamId: z.string().min(1) })
const cancelSchema = z.object({ version: z.number().int().nonnegative() })
const decisionSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  note: z.string().trim().max(500),
  version: z.number().int().nonnegative(),
})
const withdrawalSchema = z.object({
  reason: z.string().trim().min(1).max(500),
  version: z.number().int().nonnegative(),
})

type RegistrationOperation =
  | "registration.apply"
  | "registration.cancel"
  | "registration.decide"
  | "registration.withdraw"

interface UnexpectedRegistrationFailure {
  operation: RegistrationOperation
  correlationId: string
  errorType: "Error" | "NonError"
}

interface RegistrationHandlerDiagnostics {
  createCorrelationId?: () => string
  logger?: {
    error: (event: UnexpectedRegistrationFailure) => void
  }
}

interface ApplyHandlerDependencies extends RegistrationHandlerDiagnostics {
  actorProvider: CurrentActorProvider
  apply: (input: ApplyToTournamentInput, actor: Actor) => Promise<TournamentRegistration>
}

interface CancelHandlerDependencies extends RegistrationHandlerDiagnostics {
  actorProvider: CurrentActorProvider
  cancel: (input: CancelRegistrationInput, actor: Actor) => Promise<TournamentRegistration>
}

interface DecisionHandlerDependencies extends RegistrationHandlerDiagnostics {
  actorProvider: CurrentActorProvider
  decide: (input: DecideRegistrationInput, actor: Actor) => Promise<TournamentRegistration>
}

interface WithdrawalHandlerDependencies extends RegistrationHandlerDiagnostics {
  actorProvider: CurrentActorProvider
  withdraw: (input: WithdrawRegistrationInput, actor: Actor) => Promise<TournamentRegistration>
}

export async function handleApplyToTournament(
  tournamentId: string,
  request: Request,
  dependencies: ApplyHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const parsed = applySchema.safeParse(await parseJson(request))
    if (!parsed.success) return validationResponse()

    let registration: TournamentRegistration
    try {
      registration = await dependencies.apply({ tournamentId, ...parsed.data }, actor)
    } catch (error) {
      return registrationFailureResponse(error, "registration.apply", dependencies)
    }
    return Response.json({ registration }, { status: 201 })
  } catch (error) {
    return unexpectedRegistrationFailureResponse(error, "registration.apply", dependencies)
  }
}

export async function handleCancelRegistration(
  registrationId: string,
  request: Request,
  dependencies: CancelHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const parsed = cancelSchema.safeParse(await parseJson(request))
    if (!parsed.success) return validationResponse()

    try {
      await dependencies.cancel({ registrationId, ...parsed.data }, actor)
    } catch (error) {
      return registrationFailureResponse(error, "registration.cancel", dependencies)
    }
    return new Response(null, { status: 204 })
  } catch (error) {
    return unexpectedRegistrationFailureResponse(error, "registration.cancel", dependencies)
  }
}

export async function handleDecideRegistration(
  tournamentId: string,
  registrationId: string,
  request: Request,
  dependencies: DecisionHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const parsed = decisionSchema.safeParse(await parseJson(request))
    if (!parsed.success) return validationResponse()

    let registration: TournamentRegistration
    try {
      registration = await dependencies.decide(
        { tournamentId, registrationId, ...parsed.data },
        actor,
      )
    } catch (error) {
      return registrationFailureResponse(error, "registration.decide", dependencies)
    }
    return Response.json({ registration })
  } catch (error) {
    return unexpectedRegistrationFailureResponse(error, "registration.decide", dependencies)
  }
}

export async function handleWithdrawRegistration(
  tournamentId: string,
  registrationId: string,
  request: Request,
  dependencies: WithdrawalHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const parsed = withdrawalSchema.safeParse(await parseJson(request))
    if (!parsed.success) return validationResponse()

    let registration: TournamentRegistration
    try {
      registration = await dependencies.withdraw(
        { tournamentId, registrationId, ...parsed.data },
        actor,
      )
    } catch (error) {
      return registrationFailureResponse(error, "registration.withdraw", dependencies)
    }
    return Response.json({ registration })
  } catch (error) {
    return unexpectedRegistrationFailureResponse(error, "registration.withdraw", dependencies)
  }
}

async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

function unauthorizedResponse() {
  return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
}

function validationResponse() {
  return Response.json({ message: "ข้อมูลการสมัครไม่ถูกต้อง" }, { status: 422 })
}

function registrationFailureResponse(
  error: unknown,
  operation: RegistrationOperation,
  diagnostics: RegistrationHandlerDiagnostics,
) {
  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    REGISTRATION_DECISION_UNAVAILABLE: {
      status: 409,
      message: "ไม่สามารถเปลี่ยนสถานะการสมัครรายการนี้ได้",
    },
    TOURNAMENT_CAPACITY_REACHED: {
      status: 409,
      message: "จำนวนทีมที่อนุมัติเต็มความจุการแข่งขันแล้ว",
    },
    REASON_REQUIRED: { status: 422, message: "กรุณาระบุเหตุผล" },
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์ดำเนินการนี้" },
    NOT_FOUND: { status: 404, message: "ไม่พบรายการสมัคร" },
    REGISTRATION_ALREADY_ACTIVE: { status: 409, message: "ทีมนี้สมัครรายการนี้อยู่แล้ว" },
    CONFLICT: { status: 409, message: "รายการสมัครมีการเปลี่ยนแปลง กรุณาลองใหม่" },
    INVALID_REGISTRATION_TRANSITION: { status: 409, message: "ไม่สามารถยกเลิกรายการสมัครนี้ได้" },
    TOURNAMENT_NOT_PUBLISHED: { status: 422, message: "ยังไม่เปิดรับสมัคร" },
    REGISTRATION_DEADLINE_PASSED: { status: 422, message: "เลยกำหนดรับสมัครแล้ว" },
    ROSTER_INCOMPLETE: { status: 422, message: "รายชื่อผู้เล่นในทีมยังไม่ครบ" },
    ROSTER_COACH_LIMIT_EXCEEDED: { status: 422, message: "ทีมมีโค้ชเกินจำนวนที่กำหนด" },
  }
  const response = responses[code]
  if (!response) {
    return unexpectedRegistrationFailureResponse(error, operation, diagnostics)
  }
  return Response.json({ message: response.message }, { status: response.status })
}

function unexpectedRegistrationFailureResponse(
  error: unknown,
  operation: RegistrationOperation,
  diagnostics: RegistrationHandlerDiagnostics,
) {
  const correlationId = createRegistrationCorrelationId(diagnostics.createCorrelationId)
  const event: UnexpectedRegistrationFailure = {
    operation,
    correlationId,
    errorType: error instanceof Error ? "Error" : "NonError",
  }
  logUnexpectedRegistrationFailure(event, diagnostics.logger)
  return Response.json(
    { message: "ไม่สามารถจัดการการสมัครได้", correlationId },
    { status: 500 },
  )
}

function createRegistrationCorrelationId(factory?: () => string) {
  if (factory) {
    try {
      return factory()
    } catch {}
  }
  return randomUUID()
}

function logUnexpectedRegistrationFailure(
  event: UnexpectedRegistrationFailure,
  logger?: RegistrationHandlerDiagnostics["logger"],
) {
  if (logger) {
    try {
      logger.error(event)
      return
    } catch {}
  }

  try {
    defaultRegistrationLogger.error(event)
  } catch {}
}

const defaultRegistrationLogger = {
  error(event: UnexpectedRegistrationFailure) {
    console.error(event)
  },
}
