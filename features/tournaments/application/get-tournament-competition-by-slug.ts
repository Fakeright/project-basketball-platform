import type { TournamentRepository } from "@/features/tournaments/infrastructure/tournament-repository"

export function getTournamentCompetitionBySlug(
  repository: TournamentRepository,
  slug: string,
) {
  return repository.findCompetitionBySlug(slug)
}
