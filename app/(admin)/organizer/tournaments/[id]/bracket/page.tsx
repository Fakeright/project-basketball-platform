import { notFound, redirect } from "next/navigation"

import { BracketWorkspace } from "@/components/organizer/bracket-workspace"
import { CompetitionWorkspaceNav } from "@/components/organizer/competition-workspace-nav"
import { ExternalBracketWorkspace } from "@/components/organizer/external-bracket-workspace"
import { SuspendedTournamentWorkspace } from "@/components/admin/tournament-governance-read-only"
import { getOrganizerExternalBracketWorkspace } from "@/features/competition/application/get-organizer-external-bracket-workspace"
import { getOrganizerCompetition } from "@/features/competition/application/get-organizer-competition"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { getExternalBracketRepository } from "@/features/competition/infrastructure/get-external-bracket-repository"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"

export default async function OrganizerBracketPage({
  params,
}: PageProps<"/organizer/tournaments/[id]/bracket">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) redirect("/login")

  const { id } = await params
  let workspace
  let externalBracketState = null
  try {
    workspace = await getOrganizerCompetition(id, actor, {
      competitions: getCompetitionRepository(),
    })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "NOT_FOUND" || error.message === "FORBIDDEN")
    ) {
      notFound()
    }
    throw error
  }

  if (workspace.tournament.tournamentGovernanceStatus === "REMOVED") notFound()
  if (workspace.tournament.tournamentGovernanceStatus === "SUSPENDED") {
    return <SuspendedTournamentWorkspace title={workspace.tournament.title} />
  }

  if (workspace.bracket) {
    try {
      externalBracketState = await getOrganizerExternalBracketWorkspace(id, actor, {
        externalBrackets: getExternalBracketRepository(),
        storage: new SupabaseObjectStorage(),
      })
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "NOT_FOUND" || error.message === "FORBIDDEN")
      ) {
        notFound()
      }
      throw error
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl">
      <header className="pb-6">
        <p className="text-xs font-semibold text-court">TOURNAMENT OPERATIONS</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">จัดการสายการแข่งขัน</h1>
        <p className="mt-2 break-words text-sm text-muted-foreground">
          {workspace.tournament.title}
        </p>
      </header>
      <CompetitionWorkspaceNav tournamentId={workspace.tournament.id} />
      {!externalBracketState ||
      externalBracketState.modeContext.bracketMode === "SYSTEM_GENERATED" ? (
        <BracketWorkspace
          modeContext={externalBracketState?.modeContext}
          workspace={workspace}
        />
      ) : (
        <ExternalBracketWorkspace
          state={externalBracketState}
          tournamentId={workspace.tournament.id}
        />
      )}
    </section>
  )
}
