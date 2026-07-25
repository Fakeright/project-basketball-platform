import type { Actor } from "@/features/identity/domain/actor"
import { authorize } from "@/features/identity/application/authorize"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"
import { applyReviewDecision } from "@/features/tournament-operations/domain/tournament-workflow"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

export async function reviewTournament(repository: TournamentOperationsRepository, id: string, input: { decision: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED"; note: string; version: number }, actor: Actor): Promise<TournamentOperation> {
  const tournament = await repository.findById(id)
  if (!tournament) throw new Error("NOT_FOUND")
  authorize(actor, "tournament.review", { organizerId: tournament.organizerId })
  if (input.decision !== "APPROVED" && !input.note.trim()) throw new Error("REVIEW_NOTE_REQUIRED")
  const status = applyReviewDecision(tournament, input.decision)
  const updated = await repository.updateWithVersion(id, input.version, { status })
  await repository.appendReview({ tournamentId: id, reviewerId: actor.id, decision: input.decision, note: input.note })
  return updated
}
