import { notFound } from "next/navigation"

import {
  TournamentGovernancePanel,
  type TournamentGovernanceActionView,
} from "@/components/admin/tournament-governance-panel"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import {
  getTournamentGovernanceIssues,
  type TournamentGovernanceAction,
  type TournamentGovernanceIssueCode,
  type TournamentGovernanceStatus,
} from "@/features/tournament-operations/domain/tournament-governance-policy"
import type { TournamentOperationStatus } from "@/features/tournament-operations/domain/tournament-operation"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

const tournamentStatusLabels: Record<TournamentOperationStatus, string> = {
  DRAFT: "ฉบับร่าง",
  SUBMITTED: "รอตรวจสอบ",
  CHANGES_REQUESTED: "ต้องแก้ไข",
  APPROVED: "อนุมัติแล้ว",
  PUBLISHED: "เปิดรับสมัคร",
  REGISTRATION_CLOSED: "ปิดรับสมัคร",
  IN_PROGRESS: "กำลังแข่งขัน",
  COMPLETED: "จบการแข่งขัน",
  ARCHIVED: "เก็บถาวร",
  REJECTED: "ไม่อนุมัติ",
  SUSPENDED: "สถานะระงับแบบเดิม",
}

const governanceStatusLabels: Record<TournamentGovernanceStatus, string> = {
  ACTIVE: "กำกับปกติ",
  SUSPENDED: "ระงับชั่วคราว",
  REMOVED: "นำออกแล้ว",
}

const actionDefinitions: Array<
  Omit<TournamentGovernanceActionView, "unavailableReasons">
> = [
  {
    action: "SUSPEND",
    label: "ระงับรายการ",
    dialogTitle: "ระงับรายการแข่งขัน",
    description: "ซ่อนรายการจากพื้นที่สาธารณะและหยุดการดำเนินงานชั่วคราว",
    confirmLabel: "ยืนยันการระงับ",
    destructive: true,
    requiresConfirmationTitle: false,
  },
  {
    action: "RESUME",
    label: "ยกเลิกการระงับ",
    dialogTitle: "ยกเลิกการระงับรายการ",
    description: "คืนรายการสู่สถานะการแข่งขันเดิมและเปิดการดำเนินงานอีกครั้ง",
    confirmLabel: "ยืนยันยกเลิกการระงับ",
    destructive: false,
    requiresConfirmationTitle: false,
  },
  {
    action: "REMOVE",
    label: "นำรายการออก",
    dialogTitle: "นำรายการออกจากระบบใช้งาน",
    description: "ซ่อนรายการอย่างถาวรโดยเก็บข้อมูลและประวัติไว้ตรวจสอบ",
    confirmLabel: "ยืนยันการนำออก",
    destructive: true,
    requiresConfirmationTitle: false,
  },
  {
    action: "ARCHIVE",
    label: "เก็บถาวร",
    dialogTitle: "เก็บรายการแข่งขันถาวร",
    description: "ปิดการแก้ไขรายการที่จบการแข่งขันแล้วโดยยังเปิดผลต่อสาธารณะ",
    confirmLabel: "ยืนยันการเก็บถาวร",
    destructive: false,
    requiresConfirmationTitle: false,
  },
  {
    action: "REOPEN_REGISTRATION",
    label: "เปิดรับสมัครใหม่",
    dialogTitle: "เปิดรับสมัครรายการอีกครั้ง",
    description: "กลับไปเปิดรับสมัครโดยคงใบสมัครเดิมและสายการแข่งขันไว้",
    confirmLabel: "ยืนยันการเปิดรับสมัครใหม่",
    destructive: false,
    requiresConfirmationTitle: false,
  },
  {
    action: "PERMANENT_DELETE",
    label: "ลบถาวร",
    dialogTitle: "ลบรายการแข่งขันถาวร",
    description: "ลบได้เฉพาะฉบับร่างที่ยังไม่มีข้อมูลสัมพันธ์หรือไฟล์ใด ๆ",
    confirmLabel: "ยืนยันการลบถาวร",
    destructive: true,
    requiresConfirmationTitle: true,
  },
]

export default async function AdminTournamentGovernancePage({
  params,
}: PageProps<"/admin/tournaments/[id]">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (actor?.role !== "PLATFORM_ADMIN") notFound()

  const { id } = await params
  const repository = await getTournamentOperationsRepository()
  const [context, tournament] = await Promise.all([
    repository.findGovernanceContext(id),
    repository.findById(id),
  ])
  if (!context || !tournament) notFound()

  const now = new Date()
  const actions = actionDefinitions.map((definition) => {
    const issues = getTournamentGovernanceIssues(
      definition.action,
      context,
      now,
      definition.action === "PERMANENT_DELETE" ? context.title : undefined,
    )
    return {
      ...definition,
      unavailableReasons: issues.map((issue) =>
        governanceIssueLabel(definition.action, issue),
      ),
    }
  })

  return (
    <TournamentGovernancePanel
      actions={actions}
      dependencies={[
        { label: "ใบสมัคร", value: `${context.registrationCount} ใบสมัคร` },
        { label: "สายการแข่งขัน", value: `${context.bracketCount} สาย` },
        { label: "คู่แข่งขัน", value: `${context.matchCount} คู่` },
        { label: "ไฟล์", value: `${context.mediaAssetCount} ไฟล์` },
        { label: "ประวัติตรวจสอบ", value: `${context.reviewCount} รายการ` },
        {
          label: "เหตุผลกำกับล่าสุด",
          value: tournament.governanceReason ?? "ไม่มีเหตุผลกำกับล่าสุด",
        },
      ]}
      governanceStatus={governanceStatusLabels[context.governanceStatus]}
      identity={[
        {
          label: "ผู้จัด",
          value: tournament.organizerName ?? tournament.organizerId,
        },
        { label: "จังหวัด", value: tournament.province },
        {
          label: "ประเภท",
          value: tournament.format === "FIVE_V_FIVE" ? "5v5" : "3v3",
        },
        { label: "รุ่นอายุ", value: tournament.ageGroup },
        { label: "เวอร์ชัน", value: String(context.version) },
      ]}
      operationsAvailable={context.governanceStatus === "ACTIVE"}
      tournament={{
        id: context.tournamentId,
        title: context.title,
        version: context.version,
      }}
      tournamentStatus={tournamentStatusLabels[context.status]}
    />
  )
}

function governanceIssueLabel(
  action: TournamentGovernanceAction,
  issue: TournamentGovernanceIssueCode,
): string {
  if (issue === "GOVERNANCE_STATUS_INVALID") {
    if (action === "RESUME") return "รายการต้องอยู่ในสถานะระงับชั่วคราว"
    if (action === "REMOVE") return "รายการถูกนำออกแล้วและไม่สามารถนำออกซ้ำ"
    return "รายการต้องอยู่ในสถานะกำกับปกติ"
  }
  if (issue === "TOURNAMENT_STATUS_INVALID") {
    if (action === "ARCHIVE") return "ต้องจบการแข่งขันก่อนจึงเก็บถาวรได้"
    if (action === "REOPEN_REGISTRATION") return "ต้องอยู่ในสถานะปิดรับสมัคร"
    if (action === "PERMANENT_DELETE") return "ต้องเป็นรายการฉบับร่าง"
    return "รายการที่เก็บถาวรแล้วไม่รองรับคำสั่งนี้"
  }

  const issueLabels: Partial<Record<TournamentGovernanceIssueCode, string>> = {
    TOURNAMENT_ALREADY_STARTED: "วันเริ่มแข่งขันผ่านไปแล้ว",
    BRACKET_PUBLISHED: "ต้องยกเลิกการเผยแพร่สายการแข่งขันก่อน",
    BRACKET_ENTRIES_LOCKED: "ต้องปลดล็อกรายชื่อทีมก่อน",
    BRACKET_HAS_MATCHES: "ต้องไม่มีคู่แข่งขันในสาย",
    TOURNAMENT_HAS_REVIEWS: "ต้องไม่มีประวัติการตรวจสอบ",
    TOURNAMENT_HAS_REGISTRATIONS: "ต้องไม่มีใบสมัคร",
    TOURNAMENT_HAS_BRACKETS: "ต้องไม่มีสายการแข่งขัน",
    TOURNAMENT_HAS_MATCHES: "ต้องไม่มีคู่แข่งขัน",
    TOURNAMENT_HAS_MEDIA_ASSETS: "ต้องไม่มีไฟล์หรือสื่อ",
    LEGACY_SUSPENDED_STATUS_REQUIRES_REVIEW:
      "สถานะระงับแบบเดิมต้องตรวจสอบข้อมูลก่อน",
    CONFIRMATION_TITLE_MISMATCH: "ต้องพิมพ์ชื่อรายการให้ตรงกัน",
    TOURNAMENT_SUSPENDED: "รายการถูกระงับชั่วคราว",
    TOURNAMENT_REMOVED: "รายการถูกนำออกแล้ว",
    GOVERNANCE_REASON_REQUIRED: "ต้องระบุเหตุผล",
    GOVERNANCE_REASON_TOO_LONG: "เหตุผลต้องไม่เกิน 500 ตัวอักษร",
  }
  return issueLabels[issue] ?? "เงื่อนไขของคำสั่งยังไม่ครบ"
}
