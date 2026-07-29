import { z } from "zod"

import type { CurrentActorProvider } from "@/features/identity/domain/actor"
import {
  closeTournamentRegistration,
  publishTournament,
} from "@/features/tournament-operations/application/transition-tournament-lifecycle"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

type TournamentLifecycleAction = "PUBLISH" | "CLOSE_REGISTRATION"

const lifecycleSchema = z.object({
  version: z.number().int().nonnegative(),
})

export async function handleTournamentLifecycleRequest(
  request: Request,
  tournamentId: string,
  action: TournamentLifecycleAction,
  dependencies: {
    actorProvider: CurrentActorProvider
    repository: TournamentOperationsRepository
    now: () => Date
  },
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) {
    return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const parsed = lifecycleSchema.safeParse(payload)
  if (!parsed.success) {
    return Response.json(
      { message: "ข้อมูลสถานะรายการไม่ถูกต้อง" },
      { status: 422 },
    )
  }

  try {
    const tournament =
      action === "PUBLISH"
        ? await publishTournament(
            dependencies.repository,
            { tournamentId, version: parsed.data.version },
            actor,
            { now: dependencies.now },
          )
        : await closeTournamentRegistration(
            dependencies.repository,
            { tournamentId, version: parsed.data.version },
            actor,
          )
    return Response.json({ tournament })
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN"
    if (code === "FORBIDDEN") {
      return Response.json(
        { message: "ไม่พบรายการแข่งขัน" },
        { status: actor.role === "TOURNAMENT_ORGANIZER" ? 404 : 403 },
      )
    }
    const statusByCode: Record<string, number> = {
      NOT_FOUND: 404,
      CONFLICT: 409,
      INVALID_PUBLISH_STATUS: 409,
      INVALID_CLOSE_REGISTRATION_STATUS: 409,
      REGISTRATION_WINDOW_CLOSED: 422,
      TOURNAMENT_ALREADY_STARTED: 422,
      TOURNAMENT_INCOMPLETE: 422,
    }
    const status = statusByCode[code] ?? 500
    return Response.json(
      {
        message:
          status === 500
            ? "ไม่สามารถดำเนินการได้ในขณะนี้"
            : lifecycleErrorMessage(code),
      },
      { status },
    )
  }
}

function lifecycleErrorMessage(code: string) {
  const messageByCode: Record<string, string> = {
    NOT_FOUND: "ไม่พบรายการแข่งขัน",
    CONFLICT: "ข้อมูลถูกแก้ไขจากอีกหน้าต่าง กรุณาโหลดใหม่",
    INVALID_PUBLISH_STATUS: "สถานะปัจจุบันยังไม่สามารถเผยแพร่ได้",
    INVALID_CLOSE_REGISTRATION_STATUS: "รายการนี้ไม่ได้อยู่ในช่วงเปิดรับสมัคร",
    REGISTRATION_WINDOW_CLOSED: "วันปิดรับสมัครผ่านไปแล้ว",
    TOURNAMENT_ALREADY_STARTED: "การแข่งขันเริ่มขึ้นแล้ว",
    TOURNAMENT_INCOMPLETE: "ข้อมูลรายการแข่งขันยังไม่ครบ",
  }
  return messageByCode[code] ?? "ไม่สามารถเปลี่ยนสถานะรายการได้"
}
