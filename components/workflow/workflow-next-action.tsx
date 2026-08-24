import Link from "next/link"
import { CircleAlert } from "lucide-react"

import type { WorkflowGuidanceView } from "@/features/workflow-guidance/presentation/workflow-guidance-view"

export function WorkflowNextAction({
  guidance,
  compact = false,
}: {
  guidance: WorkflowGuidanceView
  compact?: boolean
}) {
  return (
    <div className={compact ? "grid min-w-0 gap-2" : "border-y border-border py-5"}>
      <p className="text-xs font-semibold text-court">{guidance.stageLabel}</p>
      <p className="text-sm text-muted-foreground">{guidance.description}</p>
      {guidance.blockers.map((blocker) => (
        <p className="flex items-start gap-2 text-sm" key={blocker}>
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-court" />
          <span>{blocker}</span>
        </p>
      ))}
      {guidance.primaryAction ? (
        <Link className="text-sm font-medium text-foreground underline underline-offset-4" href={guidance.primaryAction.href}>
          {guidance.primaryAction.label}
        </Link>
      ) : null}
    </div>
  )
}
