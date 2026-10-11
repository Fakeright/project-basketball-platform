import type { TournamentSearchFilters } from "@/features/tournaments/domain/tournament"
import type { TournamentRepository } from "@/features/tournaments/infrastructure/tournament-repository"

export function searchTournaments(repository: TournamentRepository, filters: TournamentSearchFilters) {
  return repository.list(filters)
}
