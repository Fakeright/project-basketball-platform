import { z } from "zod"

import {
  TournamentCompetitionPolicyError,
  type TournamentCompetitionIssueCode,
} from "@/features/competition/domain/tournament-competition-policy"
import type {
  Actor,
  CurrentActorProvider,
} from "@/features/identity/domain/actor"
import {
  parseJsonRequest,
  type SafeHttpDiagnostics,
  withSafeRouteBoundary,
} from "@/features/shared/presentation/safe-http"
import { tournamentGovernanceFailureResponse } from "@/features/tournament-operations/presentation/tournament-governance-error-response"

type TournamentCompetitionLifecycleAction = "START" | "COMPLETE"

const lifecycleCommandSchema = z.object({
  version: z.number().int().nonnegative(),
  reason: z.string().trim().min(1).max(500).nullable().optional(),
})

interface TournamentCompetitionLifecycleDependencies
  extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  transition: (
    input: { tournamentId: string; version: number; reason?: string | null },
    actor: Actor,
  ) => Promise<unknown>
}

export function handleTournamentCompetitionLifecycle(
  request: Request,
  tournamentId: string,
  action: TournamentCompetitionLifecycleAction,
  dependencies: TournamentCompetitionLifecycleDependencies,
) {
  return withSafeRouteBoundary(
    `tournament.competition.${action.toLocaleLowerCase()}`,
    async () => {
      const actor = await dependencies.actorProvider.getCurrentActor()
      if (!actor) {
        return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
      }

      const body = await parseJsonRequest(request)
      const parsed = body.ok
        ? lifecycleCommandSchema.safeParse(body.value)
        : null
      if (!parsed?.success) {
        return Response.json(
          { message: "ข้อมูลคำสั่งการแข่งขันไม่ถูกต้อง" },
          { status: 422 },
        )
      }

      try {
        const tournament = await dependencies.transition(
          {
            tournamentId,
            version: parsed.data.version,
            ...(parsed.data.reason !== undefined
              ? { reason: parsed.data.reason }
              : {}),
          },
          actor,
        )
        return Response.json({ tournament })
      } catch (error) {
        const governanceFailure = tournamentGovernanceFailureResponse(error)
        if (governanceFailure) return governanceFailure

        if (error instanceof TournamentCompetitionPolicyError) {
          return policyFailureResponse(error.issues, action)
        }
        const knownResponse = lifecycleFailureResponse(error)
        if (knownResponse) return knownResponse
        throw error
      }
    },
    dependencies,
  )
}

function policyFailureResponse(
  issues: readonly TournamentCompetitionIssueCode[],
  action: TournamentCompetitionLifecycleAction,
) {
  const status = issues.includes("TOURNAMENT_STATUS_INVALID") ? 409 : 422
  return Response.json(
    {
      message:
        action === "START"
          ? "ยังไม่สามารถเริ่มการแข่งขันได้"
          : "ยังไม่สามารถจบการแข่งขันได้",
      issues,
    },
    { status },
  )
}

function lifecycleFailureResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    NOT_FOUND: { status: 404, message: "ไม่พบรายการแข่งขัน" },
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์ดำเนินการนี้" },
    CONFLICT: {
      status: 409,
      message: "ข้อมูลรายการแข่งขันมีการเปลี่ยนแปลง กรุณาโหลดใหม่",
    },
    REASON_REQUIRED: {
      status: 422,
      message: "กรุณาระบุเหตุผลที่ดำเนินการแทนผู้จัด",
    },
  }
  const response = responses[code]
  return response
    ? Response.json({ message: response.message }, { status: response.status })
    : null
}
