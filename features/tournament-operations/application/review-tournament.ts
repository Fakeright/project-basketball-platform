import type { Actor } from "@/features/identity/domain/actor"
import { authorize } from "@/features/identity/application/authorize"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"
import { applyReviewDecision } from "@/features/tournament-operations/domain/tournament-workflow"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

export async function reviewTournament(repository: TournamentOperationsRepository, id: string, input: { decision: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED"; note: string; version: number }, actor: Actor): Promise<TournamentOperation> {
  const tournament = await repository.findById(id)
  if (!tournament) throw new Error("NOT_FOUND")
  authorize(actor, "tournament.review", { organizerId: tournament.organizerId })
  assertTournamentGovernanceAllowsOperation(tournament.governanceStatus)
  if (input.version !== tournament.version) throw new Error("CONFLICT")
  if (input.decision !== "APPROVED" && !input.note.trim()) throw new Error("REVIEW_NOTE_REQUIRED")
  const status = applyReviewDecision(tournament, input.decision)
  return repository.reviewWithVersion({
    tournamentId: id,
    version: tournament.version,
    sourceStatus: tournament.status,
    status,
    reviewerId: actor.id,
    decision: input.decision,
    note: input.note,
  })
}
