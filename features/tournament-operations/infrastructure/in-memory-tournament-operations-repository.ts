import type { TournamentOperation, TournamentOperationInput, TournamentReviewInput } from "@/features/tournament-operations/domain/tournament-operation"
import type { TournamentOperationsRepository } from "./tournament-operations-repository"

export class InMemoryTournamentOperationsRepository implements TournamentOperationsRepository {
  private readonly tournaments = new Map<string, TournamentOperation>()
  readonly reviews: Array<{ tournamentId: string; reviewerId: string; decision: TournamentReviewInput["decision"]; note: string }> = []

  async create(input: TournamentOperationInput & { organizerId: string }): Promise<TournamentOperation> {
    const now = new Date().toISOString()
    const tournament: TournamentOperation = { ...input, id: `tournament-${this.tournaments.size + 1}`, status: "DRAFT", version: 0, createdAt: now, updatedAt: now }
    this.tournaments.set(tournament.id, tournament)
    return tournament
  }

  async findById(id: string) { return this.tournaments.get(id) ?? null }

  async updateWithVersion(id: string, version: number, changes: Partial<TournamentOperation>) {
    const current = this.tournaments.get(id)
    if (!current) throw new Error("NOT_FOUND")
    if (current.version !== version) throw new Error("CONFLICT")
    const updated = { ...current, ...changes, version: version + 1, updatedAt: new Date().toISOString() }
    this.tournaments.set(id, updated)
    return updated
  }

  async appendReview(input: { tournamentId: string; reviewerId: string; decision: TournamentReviewInput["decision"]; note: string }) {
    this.reviews.push(input)
  }
}
