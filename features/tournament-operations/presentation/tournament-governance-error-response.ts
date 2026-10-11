import {
  TournamentGovernancePolicyError,
  type TournamentGovernanceIssueCode,
} from "@/features/tournament-operations/domain/tournament-governance-policy"

const operationGuardIssues = new Set<TournamentGovernanceIssueCode>([
  "TOURNAMENT_SUSPENDED",
  "TOURNAMENT_REMOVED",
])

const commandStateConflictIssues = new Set<TournamentGovernanceIssueCode>([
  "GOVERNANCE_STATUS_INVALID",
  "TOURNAMENT_STATUS_INVALID",
  "LEGACY_SUSPENDED_STATUS_REQUIRES_REVIEW",
])

const permanentDeleteDependencyIssues = new Set<TournamentGovernanceIssueCode>([
  "TOURNAMENT_HAS_REVIEWS",
  "TOURNAMENT_HAS_REGISTRATIONS",
  "TOURNAMENT_HAS_BRACKETS",
  "TOURNAMENT_HAS_MATCHES",
  "TOURNAMENT_HAS_MEDIA_ASSETS",
])

export function tournamentGovernanceFailureResponse(error: unknown) {
  if (!(error instanceof TournamentGovernancePolicyError)) return null
  if (!error.issues.every((issue) => operationGuardIssues.has(issue))) {
    return null
  }

  return Response.json(
    {
      message: "รายการแข่งขันถูกระงับหรือถูกนำออก กรุณาตรวจสอบสถานะล่าสุด",
      issues: error.issues,
    },
    { status: 409 },
  )
}

export function tournamentGovernanceCommandFailureResponse(error: unknown) {
  if (!(error instanceof TournamentGovernancePolicyError)) return null

  if (error.issues.some((issue) => commandStateConflictIssues.has(issue))) {
    return Response.json(
      {
        message:
          "สถานะรายการแข่งขันไม่รองรับคำสั่งนี้ กรุณาตรวจสอบสถานะล่าสุด",
        issues: error.issues,
      },
      { status: 409 },
    )
  }

  return Response.json(
    {
      message: commandPolicyMessage(error.issues),
      issues: error.issues,
    },
    { status: 422 },
  )
}

function commandPolicyMessage(
  issues: readonly TournamentGovernanceIssueCode[],
) {
  if (issues.includes("CONFIRMATION_TITLE_MISMATCH")) {
    return "ชื่อยืนยันไม่ตรงกับชื่อรายการแข่งขัน"
  }
  if (issues.some((issue) => permanentDeleteDependencyIssues.has(issue))) {
    return "รายการแข่งขันยังมีข้อมูลสัมพันธ์ กรุณานำข้อมูลออกก่อนลบถาวร"
  }
  if (issues.includes("TOURNAMENT_ALREADY_STARTED")) {
    return "การแข่งขันเริ่มขึ้นแล้ว ไม่สามารถเปิดรับสมัครใหม่ได้"
  }
  if (issues.includes("BRACKET_PUBLISHED")) {
    return "กรุณายกเลิกการเผยแพร่สายการแข่งขันก่อนเปิดรับสมัครใหม่"
  }
  if (issues.includes("BRACKET_ENTRIES_LOCKED")) {
    return "กรุณาปลดล็อกรายชื่อทีมก่อนเปิดรับสมัครใหม่"
  }
  if (issues.includes("BRACKET_HAS_MATCHES")) {
    return "ต้องไม่มีคู่แข่งขันในสายก่อนเปิดรับสมัครใหม่"
  }
  if (issues.includes("GOVERNANCE_REASON_REQUIRED")) {
    return "กรุณาระบุเหตุผลของคำสั่งกำกับรายการ"
  }
  if (issues.includes("GOVERNANCE_REASON_TOO_LONG")) {
    return "เหตุผลต้องมีความยาวไม่เกิน 500 ตัวอักษร"
  }
  return "เงื่อนไขของคำสั่งกำกับรายการยังไม่ครบ"
}
