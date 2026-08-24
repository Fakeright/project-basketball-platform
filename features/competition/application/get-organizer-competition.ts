import type { Actor } from "@/features/identity/domain/actor"
import {
  getCompletionIssues,
  getStartIssues,
  type TournamentCompetitionIssueCode,
} from "@/features/competition/domain/tournament-competition-policy"
import type { TournamentCompetitionLifecycleContext } from "@/features/competition/domain/competition"

import type {
  CompetitionRepository,
  OrganizerCompetitionWorkspace,
} from "./ports/competition-repository"

export interface OrganizerCompetitionView extends OrganizerCompetitionWorkspace {
  lifecycle: {
    startIssues: TournamentCompetitionIssueCode[]
    completionIssues: TournamentCompetitionIssueCode[]
  }
}

export async function getOrganizerCompetition(
  tournamentId: string,
  actor: Actor,
  dependencies: { competitions: CompetitionRepository },
): Promise<OrganizerCompetitionView> {
  const workspace = await dependencies.competitions.findOrganizerWorkspace(
    tournamentId,
  )
  if (
    !workspace ||
    (actor.role !== "PLATFORM_ADMIN" &&
      workspace.tournament.organizerId !== actor.id)
  ) {
    throw new Error("NOT_FOUND")
  }
  if (
    actor.role !== "PLATFORM_ADMIN" &&
    actor.role !== "TOURNAMENT_ORGANIZER"
  ) {
    throw new Error("FORBIDDEN")
  }
  const lifecycleContext: TournamentCompetitionLifecycleContext = {
    tournamentId: workspace.tournament.id,
    organizerId: workspace.tournament.organizerId,
    tournamentGovernanceStatus:
      workspace.tournament.tournamentGovernanceStatus,
    status: workspace.tournament.status,
    version: workspace.tournament.version,
    activeBracket: workspace.bracket
      ? {
          id: workspace.bracket.id,
          status: workspace.bracket.status,
          entriesLockedAt: workspace.bracket.entriesLockedAt,
          entryCount: workspace.bracket.entries.length,
          matches: workspace.bracket.rounds.flatMap((round) =>
            round.matches.map((match) => ({
              id: match.id,
              purpose: match.purpose,
              status: match.status,
              homeTeamId: match.homeTeamId,
              awayTeamId: match.awayTeamId,
              winnerTeamId: match.winnerTeamId,
              resultConfirmed: match.resultConfirmed,
            })),
          ),
        }
      : null,
  }

  return {
    ...workspace,
    lifecycle: {
      startIssues: getStartIssues(lifecycleContext),
      completionIssues: getCompletionIssues(lifecycleContext),
    },
  }
}
