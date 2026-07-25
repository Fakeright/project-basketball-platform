import { notFound, redirect } from "next/navigation"

import { TournamentEditor } from "@/components/admin/tournament-editor"
import { authorize } from "@/features/identity/application/authorize"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getDevelopmentTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/development-tournament-operations-repository"

function toLocalDateTime(value: string) {
  return value.slice(0, 16)
}

export default async function EditTournamentPage({
  params,
}: PageProps<"/organizer/tournaments/[id]">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) redirect("/login")

  const { id } = await params
  const repository = await getDevelopmentTournamentOperationsRepository()
  const tournament = await repository.findById(id)
  if (!tournament) notFound()

  try {
    authorize(actor, "tournament.update", {
      organizerId: tournament.organizerId,
    })
  } catch {
    notFound()
  }

  return (
    <TournamentEditor
      initialTournament={{
        ...tournament,
        startsAt: toLocalDateTime(tournament.startsAt),
        endsAt: toLocalDateTime(tournament.endsAt),
        registrationDeadline: toLocalDateTime(
          tournament.registrationDeadline,
        ),
      }}
    />
  )
}
