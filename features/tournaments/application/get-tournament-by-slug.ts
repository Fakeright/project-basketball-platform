import type { TournamentRepository } from "@/features/tournaments/infrastructure/tournament-repository"

export function getTournamentBySlug(repository: TournamentRepository, slug: string) {
  return repository.findBySlug(slug)
}
