import type { Tournament, TournamentSearchFilters } from "@/features/tournaments/domain/tournament"
import { toBangkokCalendarDate } from "@/features/tournaments/domain/tournament-calendar"
import type { TournamentRepository } from "@/features/tournaments/infrastructure/tournament-repository"
import { mockTournamentData } from "@/features/tournaments/infrastructure/mock-tournament-data"

function normalize(value: string): string {
  return value.toLocaleLowerCase("th-TH")
}

function matchesText(value: string, filter: string): boolean {
  return normalize(value).includes(normalize(filter))
}

function matchesExactText(value: string, filter: string): boolean {
  return normalize(value) === normalize(filter)
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
          (!filters.provinceCode || tournament.provinceCode === filters.provinceCode) &&
          (!filters.format || tournament.format === filters.format) &&
          (!filters.ageGroup || matchesExactText(tournament.ageGroup, filters.ageGroup)) &&
          (!filters.venue || matchesText(tournament.venue, filters.venue)) &&
          (!filters.date ||
            toBangkokCalendarDate(tournament.startsAt) === filters.date) &&
          (!filters.status || tournament.status === filters.status)
        )
      })
      .sort((left, right) => right.startsAt.localeCompare(left.startsAt))
  }

  async findBySlug(slug: string): Promise<Tournament | null> {
    return mockTournamentData.find((tournament) => tournament.slug === slug) ?? null
  }

  async findCompetitionBySlug(slug: string): Promise<Tournament | null> {
    const tournament = await this.findBySlug(slug)
    return tournament ? { ...tournament, documents: [] } : null
  }
}
