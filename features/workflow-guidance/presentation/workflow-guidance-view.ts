/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนดรูปแบบข้อมูลสถานะและปุ่มขั้นถัดไปที่พื้นที่ทีมและผู้จัดใช้ร่วมกัน
 * เรียกใช้จาก: components/team/team-list.tsx, components/workflow/workflow-next-action.tsx
 */

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
