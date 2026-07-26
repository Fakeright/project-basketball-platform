import type { Tournament, TournamentSearchFilters } from "@/features/tournaments/domain/tournament"

export interface TournamentRepository {
  list(filters: TournamentSearchFilters): Promise<Tournament[]>
  findBySlug(slug: string): Promise<Tournament | null>
  findCompetitionBySlug(slug: string): Promise<Tournament | null>
}
