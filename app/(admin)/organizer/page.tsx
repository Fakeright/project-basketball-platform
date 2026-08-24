import Link from "next/link"
import { redirect } from "next/navigation"

import { WorkflowNextAction } from "@/components/workflow/workflow-next-action"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { listOwnedTournamentWorkflows } from "@/features/tournament-operations/application/list-owned-tournament-workflows"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"
import { createOrganizerWorkflowGuidance } from "@/features/tournament-operations/presentation/organizer-workflow-guidance"

export default async function OrganizerPage() {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) redirect("/login")

  const repository = await getTournamentOperationsRepository()
  const workflowItems = await listOwnedTournamentWorkflows(actor, { tournaments: repository })
  const rows = workflowItems.map(({ tournament, competitionIssues }) => ({
    tournament,
    guidance: createOrganizerWorkflowGuidance({ ...tournament, competitionIssues }),
  }))

  return (
    <section aria-labelledby="organizer-heading">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-court">ORGANIZER WORKSPACE</p>
          <h1 className="mt-2 text-2xl font-semibold" id="organizer-heading">
            รายการของฉัน
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            จัดการฉบับร่างและติดตามสถานะการตรวจสอบ
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center bg-foreground px-4 text-sm font-medium text-background"
          href="/organizer/tournaments/new"
        >
          สร้างรายการแข่งขัน
        </Link>
      </header>

      {rows.length ? (
        <div className="mt-5 divide-y divide-border border-y border-border">
          {rows.map(({ tournament, guidance }) => (
            <article
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              key={tournament.id}
            >
              <div className="min-w-0">
                <h2 className="font-medium">{tournament.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tournament.province}
                </p>
              </div>
              <WorkflowNextAction compact guidance={guidance} />
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 border-y border-border py-16 text-center">
          <p className="text-muted-foreground">ยังไม่มีรายการแข่งขัน</p>
          <Link
            className="text-sm font-medium text-foreground underline underline-offset-4"
            href="/organizer/tournaments/new"
          >
            สร้างรายการแข่งขัน
          </Link>
        </div>
      )}
    </section>
  )
}
