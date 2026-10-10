import { z } from "zod"

import type { CurrentActorProvider } from "@/features/identity/domain/actor"
import {
  parseJsonRequest,
  type SafeHttpDiagnostics,
  unexpectedFailureResponse,
} from "@/features/shared/presentation/safe-http"
import { reviewTournament } from "@/features/tournament-operations/application/review-tournament"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"
import { tournamentGovernanceFailureResponse } from "@/features/tournament-operations/presentation/tournament-governance-error-response"

const reviewSchema = z
  .object({
    decision: z.enum(["APPROVED", "CHANGES_REQUESTED", "REJECTED"]),
    note: z.string().trim(),
    version: z.number().int().nonnegative(),
  })
  .superRefine((value, context) => {
    if (value.decision !== "APPROVED" && !value.note) {
      context.addIssue({
        code: "custom",
        message: "กรุณาระบุเหตุผล",
        path: ["note"],
      })
    }
  })

export interface ReviewDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  repository: TournamentOperationsRepository
}

export async function handleReviewRequest(
  request: Request,
  tournamentId: string,
  dependencies: ReviewDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const payload = await parseJsonRequest(request)
    if (!payload.ok) {
      return Response.json(
        { error: "ข้อมูลการตรวจสอบไม่ถูกต้อง" },
        { status: 422 },
      )
    }

    const parsed = reviewSchema.safeParse(payload.value)
    if (!parsed.success) {
      return Response.json(
        { error: "ข้อมูลการตรวจสอบไม่ถูกต้อง", issues: parsed.error.issues },
        { status: 422 },
      )
    }

    const tournament = await reviewTournament(
      dependencies.repository,
      tournamentId,
      parsed.data,
      actor,
    )
    return Response.json({ tournament })
  } catch (error) {
    const governanceFailure = tournamentGovernanceFailureResponse(error)
    if (governanceFailure) return governanceFailure

    const message = error instanceof Error ? error.message : "UNKNOWN"
    const statusByError: Record<string, number> = {
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      REVIEW_NOTE_REQUIRED: 422,
      INVALID_REVIEW_STATUS: 422,
    }
    const status = statusByError[message]
    if (!status) {
      return unexpectedFailureResponse(
        error,
        "tournament.review",
        dependencies,
      )
    }
    return Response.json(
      { error: "ไม่สามารถตรวจสอบรายการนี้ได้" },
      { status },
    )
  }
}
