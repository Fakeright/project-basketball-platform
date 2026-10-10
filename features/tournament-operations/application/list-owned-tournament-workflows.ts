import {
  getCompletionIssues,
  getStartIssues,
  type TournamentCompetitionIssueCode,
} from "@/features/competition/domain/tournament-competition-policy"
import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

export interface OwnedTournamentWorkflowItem {
  tournament: TournamentOperation
  competitionIssues: TournamentCompetitionIssueCode[]
}

export async function listOwnedTournamentWorkflows(
  actor: Actor,
  dependencies: {
    tournaments: Pick<
      TournamentOperationsRepository,
      "listByOrganizer" | "findCompetitionLifecycleContext"
    >
  },
): Promise<OwnedTournamentWorkflowItem[]> {
  authorize(actor, "tournament.read", { organizerId: actor.id })

  const tournaments = await dependencies.tournaments.listByOrganizer(actor.id)

  return Promise.all(
    tournaments.map(async (tournament) => {
      if (
        tournament.status !== "REGISTRATION_CLOSED" &&
        tournament.status !== "IN_PROGRESS"
      ) {
        return { tournament, competitionIssues: [] }
      }

      const context = await dependencies.tournaments.findCompetitionLifecycleContext(
        tournament.id,
      )
      const competitionIssues = !context
        ? []
        : tournament.status === "REGISTRATION_CLOSED"
          ? getStartIssues(context)
          : getCompletionIssues(context)

      return { tournament, competitionIssues }
    }),
  )
}
