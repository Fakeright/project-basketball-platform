import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ClipboardCheck } from "lucide-react"

import { TournamentEditor } from "@/components/admin/tournament-editor"
import { TournamentLifecycleActions } from "@/components/admin/tournament-lifecycle-actions"
import { utcToBangkokDateTimeLocal } from "@/features/admin/presentation/tournament-editor-time"
import { authorize } from "@/features/identity/application/authorize"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"
import { getTournamentMediaRepository } from "@/features/tournament-media/infrastructure/get-tournament-media-repository"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"

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
    <div className="space-y-8">
      <TournamentLifecycleActions
        status={tournament.status}
        tournamentId={tournament.id}
        version={tournament.version}
      />
      <section className="border-y border-border px-4 py-5 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">ทีมสมัครแข่งขัน</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ตรวจสอบรายชื่อทีมและจัดการผลการสมัคร
            </p>
          </div>
          <Link
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            href={`/organizer/tournaments/${id}/registrations`}
          >
            <ClipboardCheck aria-hidden="true" size={16} />
            ตรวจสอบการสมัคร
          </Link>
        </div>
      </section>
      <TournamentEditor
        initialTournament={{
          ...tournament,
          startsAt: utcToBangkokDateTimeLocal(tournament.startsAt),
          endsAt: utcToBangkokDateTimeLocal(tournament.endsAt),
          registrationDeadline: utcToBangkokDateTimeLocal(
            tournament.registrationDeadline,
          ),
          mediaAssets,
        }}
      />
    </div>
  )
}
