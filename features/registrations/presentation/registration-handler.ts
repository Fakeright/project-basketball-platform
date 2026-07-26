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

interface ApplyHandlerDependencies {
  actorProvider: CurrentActorProvider
  apply: (input: ApplyToTournamentInput, actor: Actor) => Promise<TournamentRegistration>
}

interface CancelHandlerDependencies {
  actorProvider: CurrentActorProvider
  cancel: (input: CancelRegistrationInput, actor: Actor) => Promise<TournamentRegistration>
}

interface DecisionHandlerDependencies {
  actorProvider: CurrentActorProvider
  decide: (input: DecideRegistrationInput, actor: Actor) => Promise<TournamentRegistration>
}

interface WithdrawalHandlerDependencies {
  actorProvider: CurrentActorProvider
  withdraw: (input: WithdrawRegistrationInput, actor: Actor) => Promise<TournamentRegistration>
}

export async function handleApplyToTournament(
  tournamentId: string,
  request: Request,
  dependencies: ApplyHandlerDependencies,
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) return unauthorizedResponse()

  const parsed = applySchema.safeParse(await parseJson(request))
  if (!parsed.success) return validationResponse()

  try {
    const registration = await dependencies.apply({ tournamentId, ...parsed.data }, actor)
    return Response.json({ registration }, { status: 201 })
  } catch (error) {
    return registrationFailureResponse(error)
  }
}

export async function handleCancelRegistration(
  registrationId: string,
  request: Request,
  dependencies: CancelHandlerDependencies,
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) return unauthorizedResponse()

  const parsed = cancelSchema.safeParse(await parseJson(request))
  if (!parsed.success) return validationResponse()

  try {
    await dependencies.cancel({ registrationId, ...parsed.data }, actor)
    return new Response(null, { status: 204 })
  } catch (error) {
    return registrationFailureResponse(error)
  }
}

export async function handleDecideRegistration(
  tournamentId: string,
  registrationId: string,
  request: Request,
  dependencies: DecisionHandlerDependencies,
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) return unauthorizedResponse()

  const parsed = decisionSchema.safeParse(await parseJson(request))
  if (!parsed.success) return validationResponse()

  try {
    const registration = await dependencies.decide(
      { tournamentId, registrationId, ...parsed.data },
      actor,
    )
    return Response.json({ registration })
  } catch (error) {
    return registrationFailureResponse(error)
  }
}

export async function handleWithdrawRegistration(
  tournamentId: string,
  registrationId: string,
  request: Request,
  dependencies: WithdrawalHandlerDependencies,
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) return unauthorizedResponse()

  const parsed = withdrawalSchema.safeParse(await parseJson(request))
  if (!parsed.success) return validationResponse()

  try {
    const registration = await dependencies.withdraw(
      { tournamentId, registrationId, ...parsed.data },
      actor,
    )
    return Response.json({ registration })
  } catch (error) {
    return registrationFailureResponse(error)
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

function registrationFailureResponse(error: unknown) {
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
  const response = responses[code] ?? { status: 500, message: "ไม่สามารถจัดการการสมัครได้" }
  return Response.json({ message: response.message }, { status: response.status })
}
