import { notFound, redirect } from "next/navigation"

import { TournamentEditor } from "@/components/admin/tournament-editor"
import { authorize } from "@/features/identity/application/authorize"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"
import { getTournamentMediaRepository } from "@/features/tournament-media/infrastructure/get-tournament-media-repository"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"

function toLocalDateTime(value: string) {
  return value.slice(0, 16)
}

export default async function EditTournamentPage({
  params,
}: PageProps<"/organizer/tournaments/[id]">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) redirect("/login")

  const { id } = await params
  const repository = await getTournamentOperationsRepository()
  const mediaRepository = await getTournamentMediaRepository()
  const tournament = await repository.findById(id)
  if (!tournament) notFound()

  try {
    authorize(actor, "tournament.update", {
      organizerId: tournament.organizerId,
    })
  } catch {
    notFound()
  }

  const storage = new SupabaseObjectStorage()
  const mediaAssets = (await mediaRepository.listActiveAssets(id)).map((asset) => ({
    ...asset,
    publicUrl:
      asset.kind === "POSTER"
        ? storage.getPublicUrl(asset.bucket, asset.objectPath)
        : undefined,
  }))

  return (
    <TournamentEditor
      initialTournament={{
        ...tournament,
        startsAt: toLocalDateTime(tournament.startsAt),
        endsAt: toLocalDateTime(tournament.endsAt),
        registrationDeadline: toLocalDateTime(
          tournament.registrationDeadline,
        ),
        mediaAssets,
      }}
    />
  )
}
