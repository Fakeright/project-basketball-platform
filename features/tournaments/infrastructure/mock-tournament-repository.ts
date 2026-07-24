import type { Tournament, TournamentSearchFilters } from "@/features/tournaments/domain/tournament"
import type { TournamentRepository } from "@/features/tournaments/infrastructure/tournament-repository"
import { mockTournamentData } from "@/features/tournaments/infrastructure/mock-tournament-data"

function normalize(value: string): string {
  return value.toLocaleLowerCase("th-TH")
}

function matchesText(value: string, filter: string): boolean {
  return normalize(value).includes(normalize(filter))
}

export class MockTournamentRepository implements TournamentRepository {
  async list(filters: TournamentSearchFilters): Promise<Tournament[]> {
    return mockTournamentData
      .filter((tournament) => {
        const searchText = [
          tournament.slug,
          tournament.title,
          tournament.province,
          tournament.venue,
          tournament.ageGroup,
          tournament.description,
          ...tournament.teams,
        ].join(" ")

        return (
          (!filters.query || matchesText(searchText, filters.query)) &&
          (!filters.province || matchesText(tournament.province, filters.province)) &&
          (!filters.format || tournament.format === filters.format) &&
          (!filters.ageGroup || matchesText(tournament.ageGroup, filters.ageGroup)) &&
          (!filters.venue || matchesText(tournament.venue, filters.venue)) &&
          (!filters.date || tournament.startsAt.startsWith(filters.date)) &&
          (!filters.status || tournament.status === filters.status)
        )
      })
      .sort((left, right) => right.startsAt.localeCompare(left.startsAt))
  }

  async findBySlug(slug: string): Promise<Tournament | null> {
    return mockTournamentData.find((tournament) => tournament.slug === slug) ?? null
  }
}
