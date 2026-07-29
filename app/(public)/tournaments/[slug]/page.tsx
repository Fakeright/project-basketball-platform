import Link from "next/link"
import { notFound } from "next/navigation"

import { TournamentRegistrationAction } from "@/components/tournaments/tournament-registration-action"
import { TournamentDocumentList } from "@/components/tournaments/tournament-document-list"
import { TournamentPoster } from "@/components/tournaments/tournament-poster"
import type { Actor } from "@/features/identity/domain/actor"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getRegistrationRepository } from "@/features/registrations/infrastructure/get-registration-repository"
import { getTeamRepository } from "@/features/team-management/infrastructure/get-team-repository"
import { getTournamentBySlug } from "@/features/tournaments/application/get-tournament-by-slug"
import {
  getTournamentRegistrationAvailability,
  type TournamentRegistrationAvailability,
} from "@/features/tournaments/application/get-tournament-registration-options"
import { getTournamentRepository } from "@/features/tournaments/infrastructure/get-tournament-repository"
import {
  formatThaiCalendarDate,
  formatTournamentDateRange,
  formatTournamentFormat,
} from "@/features/tournaments/presentation/tournament-view-model"

const statusLabels = {
  OPEN: "เปิดรับสมัคร",
  CLOSED: "ปิดรับสมัคร",
  ONGOING: "กำลังแข่งขัน",
  COMPLETED: "แข่งขันจบแล้ว",
} as const

export default async function TournamentDetailPage({
  params,
}: PageProps<"/tournaments/[slug]">) {
  const { slug } = await params
  const repository = getTournamentRepository()
  const tournament = await getTournamentBySlug(repository, slug)

  if (!tournament) {
    notFound()
  }

  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  const registrationAvailability = await loadRegistrationAvailability(
    tournament,
    actor,
  )

  return (
    <div className="py-8 sm:py-12">
      <header className="border-b border-border pb-7">
        <div
          className={
            tournament.posterUrl
              ? "grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start"
              : undefined
          }
        >
          <TournamentPoster
            posterUrl={tournament.posterUrl}
            tournamentTitle={tournament.title}
          />
          <div>
            <p className="text-sm font-medium text-court">
              {statusLabels[tournament.status]}
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              {tournament.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {tournament.description}
            </p>
            <dl className="mt-7 grid gap-5 border-t border-border pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">วันแข่งขัน</dt>
                <dd className="mt-1 font-medium">
                  {formatTournamentDateRange(tournament.startsAt, tournament.endsAt)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">รูปแบบ</dt>
                <dd className="mt-1 font-medium">
                  {formatTournamentFormat(tournament.format)} / {tournament.ageGroup}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">สถานที่</dt>
                <dd className="mt-1 font-medium">
                  {tournament.venue}, {tournament.province}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">ปิดรับสมัคร</dt>
                <dd className="mt-1 font-medium">
                  {formatThaiCalendarDate(tournament.registrationDeadline)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {registrationAvailability.state !== "HIDDEN" ? (
        <div className="mt-8">
          <TournamentRegistrationAction
            availability={registrationAvailability.state}
            teams={registrationAvailability.teams}
            tournamentId={tournament.id}
          />
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          <h2 className="text-xl font-semibold">ทีมที่เข้าร่วม</h2>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {tournament.teams.map((team) => (
              <li className="px-4 py-4 font-medium sm:px-6" key={team}>
                {team}
              </li>
            ))}
          </ul>
        </section>
        <nav
          aria-label="ข้อมูลการแข่งขัน"
          className="border-y border-border py-2 lg:border-y-0 lg:border-l lg:pl-6"
        >
          <Link
            className="block border-b border-border py-4 text-sm font-medium underline underline-offset-4"
            href={`/schedule?tournament=${tournament.slug}`}
          >
            ตารางแข่งขัน
          </Link>
          <Link
            className="block py-4 text-sm font-medium underline underline-offset-4"
            href={`/bracket?tournament=${tournament.slug}`}
          >
            Bracket
          </Link>
        </nav>
      </div>

      <div className="mt-8">
        <TournamentDocumentList documents={tournament.documents} />
      </div>
    </div>
  )
}

async function loadRegistrationAvailability(
  tournament: Parameters<typeof getTournamentRegistrationAvailability>[0],
  actor: Actor | null,
): Promise<{
  state: TournamentRegistrationAvailability
  teams: Array<{ id: string; name: string }>
}> {
  if (actor?.role !== "TEAM_MANAGER") {
    return { state: "HIDDEN", teams: [] }
  }
  if (!process.env.DATABASE_URL) {
    return { state: "ERROR", teams: [] }
  }

  try {
    return await getTournamentRegistrationAvailability(tournament, actor, {
      teams: getTeamRepository(),
      registrations: getRegistrationRepository(),
    })
  } catch {
    return { state: "ERROR", teams: [] }
  }
}
