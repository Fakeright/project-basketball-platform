import { z } from "zod"

import {
  governTournament,
  type TournamentGovernanceCommand,
} from "@/features/tournament-operations/application/govern-tournament"
import type { CurrentActorProvider } from "@/features/identity/domain/actor"
import {
  parseJsonRequest,
  type SafeHttpDiagnostics,
  unexpectedFailureResponse,
} from "@/features/shared/presentation/safe-http"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

import { tournamentGovernanceFailureResponse } from "./tournament-governance-error-response"

const baseCommand = {
  version: z.number().int().nonnegative(),
  reason: z.string().trim().min(1).max(500),
}

const governanceCommandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("SUSPEND"), ...baseCommand }),
  z.object({ action: z.literal("RESUME"), ...baseCommand }),
  z.object({ action: z.literal("REMOVE"), ...baseCommand }),
  z.object({ action: z.literal("ARCHIVE"), ...baseCommand }),
  z.object({ action: z.literal("REOPEN_REGISTRATION"), ...baseCommand }),
  z.object({
    action: z.literal("PERMANENT_DELETE"),
    ...baseCommand,
    confirmationTitle: z.string().trim().min(1),
  }),
])

export interface TournamentGovernanceHandlerDependencies
  extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  repository: TournamentOperationsRepository
  now: () => Date
}

export async function handleTournamentGovernance(
  request: Request,
  tournamentId: string,
  dependencies: TournamentGovernanceHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) {
      return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const payload = await parseJsonRequest(request)
    if (!payload.ok) return governanceValidationResponse()

    const parsed = governanceCommandSchema.safeParse(payload.value)
    if (!parsed.success) return governanceValidationResponse(parsed.error.issues)

    try {
      const command: TournamentGovernanceCommand = {
        ...parsed.data,
        tournamentId,
      }
      const tournament = await governTournament(
        dependencies.repository,
        command,
        actor,
        { now: dependencies.now },
      )
      if (tournament === null) return new Response(null, { status: 204 })
      return Response.json({ tournament })
    } catch (error) {
      const governanceFailure = tournamentGovernanceFailureResponse(error)
      if (governanceFailure) return governanceFailure

      const code = error instanceof Error ? error.message : "UNKNOWN"
      if (code === "FORBIDDEN") {
        return Response.json(
          { message: "ไม่มีสิทธิ์ดำเนินการกับรายการนี้" },
          { status: 403 },
        )
      }
      if (code === "NOT_FOUND") {
        return Response.json({ message: "ไม่พบรายการแข่งขัน" }, { status: 404 })
      }
      if (code === "CONFLICT") {
        return Response.json(
          { message: "ข้อมูลถูกแก้ไขจากอีกหน้าต่าง กรุณาโหลดใหม่" },
          { status: 409 },
        )
      }
      return unexpectedFailureResponse(
        error,
        "tournament.governance",
        dependencies,
      )
    }
  } catch (error) {
    return unexpectedFailureResponse(error, "tournament.governance", dependencies)
  }
}

function governanceValidationResponse(issues: readonly unknown[] = []) {
  return Response.json(
    { message: "ข้อมูลคำสั่งกำกับรายการไม่ถูกต้อง", issues },
    { status: 422 },
  )
}
