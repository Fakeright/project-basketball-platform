import { z } from "zod"

import type { CurrentActorProvider } from "@/features/identity/domain/actor"
import { reviewTournament } from "@/features/tournament-operations/application/review-tournament"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

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

export interface ReviewDependencies {
  actorProvider: CurrentActorProvider
  repository: TournamentOperationsRepository
}

export async function handleReviewRequest(
  request: Request,
  tournamentId: string,
  dependencies: ReviewDependencies,
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) {
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const parsed = reviewSchema.safeParse(payload)
  if (!parsed.success) {
    return Response.json(
      { error: "ข้อมูลการตรวจสอบไม่ถูกต้อง", issues: parsed.error.issues },
      { status: 422 },
    )
  }

  try {
    const tournament = await reviewTournament(
      dependencies.repository,
      tournamentId,
      parsed.data,
      actor,
    )
    return Response.json({ tournament })
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN"
    const statusByError: Record<string, number> = {
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      REVIEW_NOTE_REQUIRED: 422,
      INVALID_REVIEW_STATUS: 422,
    }
    const status = statusByError[message] ?? 500
    return Response.json(
      {
        error:
          status === 500
            ? "ไม่สามารถดำเนินการได้ในขณะนี้"
            : "ไม่สามารถตรวจสอบรายการนี้ได้",
      },
      { status },
    )
  }
}
