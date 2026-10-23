/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจข้อมูลรายการและกฎส่งตรวจ/เผยแพร่/ปิดรับสมัคร โดยแยกจากโค้ดฐานข้อมูล
 * เรียกใช้จาก: features/tournament-operations/application/create-tournament.ts, features/tournament-operations/application/review-tournament.ts
 * ตามการทำงานต่อ: features/tournament-operations/domain/tournament-age-group.ts, features/tournament-operations/domain/tournament-capacity.ts
 */

import type { TournamentOperation, TournamentOperationInput, TournamentOperationStatus } from "./tournament-operation"
import { isTournamentAgeGroup } from "./tournament-age-group"
import { isLegacyTournamentCapacity, isValidTournamentCapacity } from "./tournament-capacity"

const requiredFields: Array<keyof TournamentOperationInput> = [
  "title", "provinceCode", "venue", "startsAt", "endsAt", "registrationDeadline",
]

// ตรวจช่องที่จำเป็น รุ่นอายุ จำนวนทีม และลำดับวันเวลา; รหัสจังหวัดตรวจแยกใน use case
export function validateTournamentInput(
  input: TournamentOperationInput,
  options: { existingCapacity?: number } = {},
): void {
  for (const field of requiredFields) {
    if (!String(input[field]).trim()) throw new Error(`FIELD_REQUIRED:${field}`)
  }
  if (!isTournamentAgeGroup(input.ageGroup)) {
    throw new Error("AGE_GROUP_INVALID")
  }
  const unchangedLegacyCapacity =
    input.capacity === options.existingCapacity &&
    isLegacyTournamentCapacity(input.capacity)
  if (!isValidTournamentCapacity(input.capacity) && !unchangedLegacyCapacity) {
    throw new Error("CAPACITY_INVALID")
  }
  const startsAt = Date.parse(input.startsAt)
  const endsAt = Date.parse(input.endsAt)
  const deadline = Date.parse(input.registrationDeadline)
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || !Number.isFinite(deadline)) throw new Error("DATE_INVALID")
  if (endsAt <= startsAt) throw new Error("DATE_RANGE_INVALID")
  if (deadline >= startsAt) throw new Error("REGISTRATION_DEADLINE_INVALID")
}

// อนุญาตส่งตรวจได้เฉพาะฉบับร่างหรือรายการที่ถูกขอให้แก้ไข
export function canSubmit(status: TournamentOperationStatus): boolean {
  return status === "DRAFT" || status === "CHANGES_REQUESTED"
}

// ใช้ผลตรวจได้ต่อเมื่อรายการอยู่ในสถานะส่งตรวจแล้ว
export function applyReviewDecision(tournament: TournamentOperation, decision: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED"): TournamentOperationStatus {
  if (tournament.status !== "SUBMITTED") throw new Error("INVALID_REVIEW_STATUS")
  return decision
}

// รายการต้องอนุมัติและยังมีช่วงเวลารับสมัคร/วันเริ่มที่ใช้ได้ก่อนเปิดเผยแพร่
export function assertCanPublish(
  tournament: TournamentOperation,
  now: Date,
): void {
  if (tournament.status !== "APPROVED") {
    throw new Error("INVALID_PUBLISH_STATUS")
  }
  validateTournamentInput(tournament, { existingCapacity: tournament.capacity })
  if (Date.parse(tournament.registrationDeadline) <= now.getTime()) {
    throw new Error("REGISTRATION_WINDOW_CLOSED")
  }
  if (Date.parse(tournament.startsAt) <= now.getTime()) {
    throw new Error("TOURNAMENT_ALREADY_STARTED")
  }
}

// ตรวจว่ารายการกำลังเผยแพร่ก่อนปิดการรับสมัคร
export function assertCanCloseRegistration(
  tournament: TournamentOperation,
): void {
  if (tournament.status !== "PUBLISHED") {
    throw new Error("INVALID_CLOSE_REGISTRATION_STATUS")
  }
}
