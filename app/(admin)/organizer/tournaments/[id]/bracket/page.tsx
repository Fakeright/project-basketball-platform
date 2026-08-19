import { notFound, redirect } from "next/navigation"

import { BracketWorkspace } from "@/components/organizer/bracket-workspace"
import { CompetitionWorkspaceNav } from "@/components/organizer/competition-workspace-nav"
import { getOrganizerCompetition } from "@/features/competition/application/get-organizer-competition"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export default async function OrganizerBracketPage({
  params,
}: PageProps<"/organizer/tournaments/[id]/bracket">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) redirect("/login")

  const { id } = await params
  let workspace
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
      <BracketWorkspace workspace={workspace} />
    </section>
  )
}
