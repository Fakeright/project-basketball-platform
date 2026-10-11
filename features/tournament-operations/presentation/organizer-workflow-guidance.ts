import type { TournamentCompetitionIssueCode } from "@/features/competition/domain/tournament-competition-policy"
import { tournamentCompetitionIssueLabel } from "@/features/competition/presentation/tournament-competition-issue-label"
import type { WorkflowGuidanceView } from "@/features/workflow-guidance/presentation/workflow-guidance-view"
import type { TournamentGovernanceStatus } from "../domain/tournament-governance-policy"
import type { TournamentOperationStatus } from "../domain/tournament-operation"

const lifecycleGuidance: Record<
  TournamentOperationStatus,
  (id: string) => WorkflowGuidanceView
> = {
  DRAFT: (id) => withAction(
    "ฉบับร่าง",
    "กรอกข้อมูลรายการให้ครบก่อนส่งตรวจ",
    "ตรวจข้อมูลและส่งให้ Admin",
    detailsHref(id),
  ),
  CHANGES_REQUESTED: (id) => withAction(
    "ต้องแก้ไข",
    "ตรวจข้อเสนอแนะและปรับข้อมูลก่อนส่งใหม่",
    "แก้ไขตามข้อเสนอแนะ",
    detailsHref(id),
  ),
  SUBMITTED: () => readOnly("รอตรวจสอบ", "Admin กำลังตรวจข้อมูลรายการ"),
  APPROVED: (id) => withAction(
    "อนุมัติแล้ว",
    "ตรวจวันรับสมัครก่อนเผยแพร่",
    "ตรวจข้อมูลก่อนเผยแพร่",
    detailsHref(id),
  ),
  PUBLISHED: (id) => withAction(
    "เปิดรับสมัคร",
    "ติดตามและพิจารณาทีมที่สมัคร",
    "ตรวจทีมที่สมัคร",
    `${detailsHref(id)}/registrations`,
  ),
  REGISTRATION_CLOSED: (id) => withAction(
    "ปิดรับสมัคร",
    "เตรียมทีมและสายก่อนเริ่มแข่งขัน",
    "เตรียมสายการแข่งขัน",
    `${detailsHref(id)}/bracket`,
  ),
  IN_PROGRESS: (id) => withAction(
    "กำลังแข่งขัน",
    "จัดตารางและยืนยันผลแต่ละคู่",
    "บันทึกผลการแข่งขัน",
    `${detailsHref(id)}/results`,
  ),
  COMPLETED: (id) => withAction(
    "จบการแข่งขัน",
    "ตรวจ Winner, Runner-up และอันดับ",
    "ตรวจผลและอันดับ",
    `${detailsHref(id)}/results`,
  ),
  ARCHIVED: (id) => withAction(
    "เก็บถาวร",
    "รายการปิดการแก้ไขและยังดูผลได้",
    "ดูผลการแข่งขัน",
    `${detailsHref(id)}/results`,
  ),
  REJECTED: () => readOnly("ไม่อนุมัติ", "รายการนี้ไม่สามารถดำเนินการต่อ"),
  SUSPENDED: () => readOnly("ระงับแบบเดิม", "ต้องให้ Admin ตรวจสถานะเดิมก่อน"),
}

export function createOrganizerWorkflowGuidance(input: {
  id: string
  status: TournamentOperationStatus
  governanceStatus: TournamentGovernanceStatus
  governanceReason: string | null
  competitionIssues?: readonly TournamentCompetitionIssueCode[]
}): WorkflowGuidanceView {
  if (input.governanceStatus === "SUSPENDED") {
    return {
      stageLabel: "ระงับชั่วคราว",
      description: "รายการถูกหยุดดำเนินงานโดยผู้ดูแลระบบ",
      primaryAction: null,
      blockers: [
        input.governanceReason?.trim() || "รอผู้ดูแลระบบเปิดใช้งานรายการ",
      ],
    }
  }

  if (input.governanceStatus === "REMOVED") {
    return {
      stageLabel: "นำออกแล้ว",
      description: "รายการนี้ไม่อยู่ในพื้นที่ดำเนินงานของผู้จัด",
      primaryAction: null,
      blockers: ["ติดต่อผู้ดูแลระบบหากต้องการตรวจสอบประวัติ"],
    }
  }

  const guidance = lifecycleGuidance[input.status](input.id)

  return {
    ...guidance,
    blockers: (input.competitionIssues ?? [])
      .slice(0, 2)
      .map(tournamentCompetitionIssueLabel),
  }
}

export function tournamentOperationStatusLabel(
  status: TournamentOperationStatus,
): string {
  return lifecycleGuidance[status]("").stageLabel
}

function withAction(
  stageLabel: string,
  description: string,
  label: string,
  href: string,
): WorkflowGuidanceView {
  return {
    stageLabel,
    description,
    primaryAction: { label, href },
    blockers: [],
  }
}

function readOnly(
  stageLabel: string,
  description: string,
): WorkflowGuidanceView {
  return {
    stageLabel,
    description,
    primaryAction: null,
    blockers: [],
  }
}

function detailsHref(id: string): string {
  return `/organizer/tournaments/${id}`
}
