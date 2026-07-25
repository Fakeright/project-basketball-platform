import type { TournamentOperation, TournamentOperationInput, TournamentOperationStatus, TournamentReviewInput } from "@/features/tournament-operations/domain/tournament-operation"

export interface TournamentOperationsRepository {
  create(input: TournamentOperationInput & { organizerId: string }): Promise<TournamentOperation>
  findById(id: string): Promise<TournamentOperation | null>
  listByOrganizer(organizerId: string): Promise<TournamentOperation[]>
  updateWithVersion(id: string, version: number, changes: Partial<TournamentOperation>): Promise<TournamentOperation>
  appendReview(input: { tournamentId: string; reviewerId: string; decision: TournamentReviewInput["decision"]; note: string }): Promise<void>
}

export type TournamentOperationChanges = Partial<Pick<TournamentOperation, "status" | "version">>
export type TournamentStatus = TournamentOperationStatus
