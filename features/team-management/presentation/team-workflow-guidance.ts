import type { TeamSummary } from "@/features/team-management/domain/team"
import { getMinimumRosterSize } from "@/features/team-management/domain/team-policy"
import type { TeamRegistrationListItem } from "@/features/registrations/application/ports/registration-repository"
import type { WorkflowGuidanceView } from "@/features/workflow-guidance/presentation/workflow-guidance-view"

export interface TeamWorkflowGuidanceInput {
  team: Pick<TeamSummary, "id" | "format" | "isActive">
  activePlayerCount: number
  registrations: ReadonlyArray<Pick<
    TeamRegistrationListItem,
    | "status"
    | "tournamentSlug"
    | "tournamentStatus"
    | "tournamentGovernanceStatus"
  >>
}

const browseTournamentGuidance: WorkflowGuidanceView = {
  stageLabel: "พร้อมสมัครแข่งขัน",
  description: "ค้นหารายการที่เหมาะกับทีมของคุณ",
  primaryAction: { label: "ค้นหารายการแข่งขัน", href: "/tournaments" },
  blockers: [],
}

const readOnlyTeamGuidance: WorkflowGuidanceView = {
  stageLabel: "ปิดใช้งาน",
  description: "ทีมนี้ปิดใช้งานและดูข้อมูลได้เท่านั้น",
  primaryAction: null,
  blockers: [],
}

export function createTeamWorkflowGuidance(
  input: TeamWorkflowGuidanceInput,
): WorkflowGuidanceView {
  if (!input.team.isActive) return readOnlyTeamGuidance

  const minimum = getMinimumRosterSize(input.team.format)
  if (input.activePlayerCount < minimum) {
    return incompleteRosterGuidance(input, minimum)
  }

  const pending = input.registrations.find((item) => item.status === "PENDING")
  if (pending) return pendingRegistrationGuidance(input.team.id)

  const approved = input.registrations.find(
    (item) =>
      item.status === "APPROVED" && item.tournamentGovernanceStatus === "ACTIVE",
  )

  return approved ? approvedTournamentGuidance(approved) : browseTournamentGuidance
}

function incompleteRosterGuidance(
  input: TeamWorkflowGuidanceInput,
  minimum: number,
): WorkflowGuidanceView {
  return {
    stageLabel: "รายชื่อผู้เล่นยังไม่ครบ",
    description: `มีผู้เล่น ${input.activePlayerCount}/${minimum} คน`,
    primaryAction: { label: "เพิ่มผู้เล่น", href: `/team/${input.team.id}` },
    blockers: [`ต้องมีผู้เล่นอย่างน้อย ${minimum} คนก่อนสมัครแข่งขัน`],
  }
}

function pendingRegistrationGuidance(teamId: string): WorkflowGuidanceView {
  return {
    stageLabel: "รอพิจารณา",
    description: "มีรายการสมัครที่รอผู้จัดพิจารณา",
    primaryAction: {
      label: "ตรวจสถานะการสมัคร",
      href: `/team/${teamId}#registrations`,
    },
    blockers: [],
  }
}

function approvedTournamentGuidance(
  registration: Pick<
    TeamRegistrationListItem,
    "tournamentSlug" | "tournamentStatus"
  >,
): WorkflowGuidanceView {
  switch (registration.tournamentStatus) {
    case "REGISTRATION_CLOSED":
      return publicTournamentGuidance(
        "ปิดรับสมัคร",
        "รายการกำลังเตรียมสายการแข่งขัน",
        "ดูสายการแข่งขัน",
        `/bracket?tournament=${registration.tournamentSlug}`,
      )
    case "IN_PROGRESS":
      return publicTournamentGuidance(
        "กำลังแข่งขัน",
        "ติดตามกำหนดการแข่งขันของทีม",
        "ดูตารางแข่งขัน",
        `/schedule?tournament=${registration.tournamentSlug}`,
      )
    case "COMPLETED":
    case "ARCHIVED":
      return publicTournamentGuidance(
        "จบการแข่งขัน",
        "ตรวจผลการแข่งขันของทีม",
        "ดูผลการแข่งขัน",
        `/results?tournament=${registration.tournamentSlug}`,
      )
    default:
      return publicTournamentGuidance(
        "สมัครแล้ว",
        "ตรวจรายละเอียดรายการแข่งขันของทีม",
        "ดูรายการแข่งขัน",
        `/tournaments/${registration.tournamentSlug}`,
      )
  }
}

function publicTournamentGuidance(
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
