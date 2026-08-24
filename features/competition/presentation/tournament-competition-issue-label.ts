import type { TournamentCompetitionIssueCode } from "@/features/competition/domain/tournament-competition-policy"

const issueLabels: Record<TournamentCompetitionIssueCode, string> = {
  TOURNAMENT_STATUS_INVALID: "สถานะรายการไม่พร้อมสำหรับขั้นตอนนี้",
  BRACKET_MISSING: "ยังไม่มีสายการแข่งขัน",
  BRACKET_NOT_PUBLISHED: "ยังไม่ได้เผยแพร่สายการแข่งขัน",
  ENTRIES_NOT_LOCKED: "ยังไม่ได้ล็อกรายชื่อทีม",
  ENTRY_COUNT_INVALID: "ต้องมีทีมอย่างน้อย 2 ทีม",
  MATCH_MISSING: "ยังไม่มีคู่แข่งขัน",
  CHAMPIONSHIP_MISSING: "ยังไม่มีคู่ชิงชนะเลิศ",
  CHAMPIONSHIP_DUPLICATE: "มีคู่ชิงชนะเลิศมากกว่าหนึ่งคู่",
  THIRD_PLACE_DUPLICATE: "มีคู่ชิงอันดับ 3 มากกว่าหนึ่งคู่",
  PLACEMENT_TEAMS_INCOMPLETE: "คู่จัดอันดับยังมีทีมไม่ครบ",
  MATCH_RESULT_PENDING: "ยังมีคู่แข่งขันที่ไม่ได้ยืนยันผล",
  MATCH_RESULT_INVALID: "มีผลการแข่งขันที่ไม่สมบูรณ์",
}

export function tournamentCompetitionIssueLabel(
  issue: TournamentCompetitionIssueCode,
): string {
  return issueLabels[issue]
}
