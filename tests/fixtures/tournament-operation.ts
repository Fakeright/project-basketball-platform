/**
 * COURTSIDE: คำอธิบายไฟล์
 * สร้างข้อมูลรายการจำลองที่ครบตาม domain ใช้ร่วมกันในเทสต์โดยไม่เชื่อมฐานข้อมูล
 */
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"

export function createTestTournamentOperation(
  overrides: Partial<TournamentOperation> = {},
): TournamentOperation {
  return {
    id: "tournament-1", title: "Test Cup", description: "", rules: "",
    provinceCode: "10", province: "กรุงเทพมหานคร", venue: "Test Arena",
    organizerId: "organizer-1", format: "FIVE_V_FIVE", ageGroup: "Open",
    startsAt: "2026-11-15T02:00:00Z", endsAt: "2026-11-16T11:00:00Z",
    registrationDeadline: "2026-11-01T16:59:00Z", capacity: 8,
    status: "DRAFT", governanceStatus: "ACTIVE", governanceReason: null,
    governanceUpdatedAt: null, version: 0,
    createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  }
}
