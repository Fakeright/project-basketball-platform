import Link from "next/link"

import type { TournamentOperationStatus } from "@/features/tournament-operations/domain/tournament-operation"
import { tournamentOperationStatusLabel } from "@/features/tournament-operations/presentation/organizer-workflow-guidance"

export type TournamentWorkflowSection =
  | "details"
  | "registrations"
  | "bracket"
  | "schedule"
  | "results"

const workflowSteps: ReadonlyArray<{
  id: TournamentWorkflowSection
  label: string
  suffix: string
}> = [
  { id: "details", label: "ข้อมูลรายการ", suffix: "" },
  { id: "registrations", label: "ทีมสมัคร", suffix: "/registrations" },
  { id: "bracket", label: "สายการแข่งขัน", suffix: "/bracket" },
  { id: "schedule", label: "ตารางแข่งขัน", suffix: "/schedule" },
  { id: "results", label: "ผลการแข่งขัน", suffix: "/results" },
]

export function TournamentWorkflowProgress({
  currentSection,
  status,
  tournamentId,
}: {
  currentSection: TournamentWorkflowSection
  status: string
  tournamentId: string
}) {
  const baseHref = `/organizer/tournaments/${tournamentId}`
  const statusLabel = isTournamentOperationStatus(status)
    ? tournamentOperationStatusLabel(status)
    : "ยังไม่อยู่ในขั้นดำเนินการแข่งขัน"

  return (
    <nav
      aria-label="ความคืบหน้าการจัดการแข่งขัน"
      className="overflow-x-auto border-y border-border"
    >
      <div className="flex min-w-max items-center gap-6 px-4 sm:px-6">
        <p className="border-r border-border py-3 pr-6 text-sm text-muted-foreground">
          {statusLabel}
        </p>
        <ol className="flex min-w-max gap-6">
          {workflowSteps.map((step) => {
            const isCurrent = step.id === currentSection

            return (
              <li key={step.id}>
                <Link
                  aria-current={isCurrent ? "step" : undefined}
                  className={
                    isCurrent
                      ? "border-b-2 border-foreground py-3 text-sm font-semibold text-foreground"
                      : "border-b-2 border-transparent py-3 text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
                  }
                  href={`${baseHref}${step.suffix}`}
                >
                  {step.label}
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

function isTournamentOperationStatus(
  status: string,
): status is TournamentOperationStatus {
  return [
    "DRAFT",
    "SUBMITTED",
    "CHANGES_REQUESTED",
    "APPROVED",
    "PUBLISHED",
    "REGISTRATION_CLOSED",
    "IN_PROGRESS",
    "COMPLETED",
    "ARCHIVED",
    "REJECTED",
    "SUSPENDED",
  ].includes(status)
}
