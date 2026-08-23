import { notFound, redirect } from "next/navigation"

import { RegistrationReviewList } from "@/components/organizer/registration-review-list"
import { SuspendedTournamentWorkspace } from "@/components/admin/tournament-governance-read-only"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import {
  listTournamentRegistrations,
  type TournamentRegistrationReview,
} from "@/features/registrations/application/list-tournament-registrations"
import { getRegistrationRepository } from "@/features/registrations/infrastructure/get-registration-repository"

const submittedDateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
})

export default async function TournamentRegistrationsPage({
  params,
}: PageProps<"/organizer/tournaments/[id]/registrations">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) redirect("/login")

  const { id } = await params
  let review: TournamentRegistrationReview
  try {
    review = await listTournamentRegistrations(id, actor, {
      registrations: getRegistrationRepository(),
    })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "FORBIDDEN" || error.message === "NOT_FOUND")
    ) {
      notFound()
    }
    throw error
  }

  if (review.tournament.governanceStatus === "REMOVED") notFound()
  if (review.tournament.governanceStatus === "SUSPENDED") {
    return <SuspendedTournamentWorkspace title={review.tournament.title} />
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-border pb-7">
        <p className="text-xs font-semibold text-court">
          REGISTRATION REVIEW
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          ตรวจสอบทีมสมัครแข่งขัน
        </h1>
        <p className="mt-2 break-words text-sm text-muted-foreground">
          {review.tournament.title}
        </p>
      </header>
      <RegistrationReviewList
        registrations={review.registrations.map((registration) => ({
          ...registration,
          submittedAt: submittedDateFormatter.format(
            new Date(registration.submittedAt),
          ),
        }))}
        tournamentId={review.tournament.id}
      />
    </section>
  )
}
