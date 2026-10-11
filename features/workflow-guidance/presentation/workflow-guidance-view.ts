export interface WorkflowPrimaryAction {
  label: string
  href: string
}

export interface WorkflowGuidanceView {
  stageLabel: string
  description: string
  primaryAction: WorkflowPrimaryAction | null
  blockers: string[]
}
