// ยอมให้ตรึงทีมเมื่อปิดรับสมัครแล้ว และจำนวนทีมที่อนุมัติไม่ซ้ำ/ไม่เกินความจุ
/**
 * COURTSIDE: คำอธิบายไฟล์
 * รวมกฎตรึงทีม ลำดับทีม และข้อจำกัดการแก้สาย; สายระบบปัจจุบันใช้ 8, 16 หรือ 32 ทีม
 * เรียกใช้จาก: features/competition/application/generate-bracket.ts, features/competition/application/lock-bracket-entries.ts
 */

export function assertEntriesCanBeLocked(input: {
  tournamentStatus: string
  approvedTeamIds: readonly string[]
  capacity: number
}): void {
  if (input.tournamentStatus !== "REGISTRATION_CLOSED") {
    throw new Error("BRACKET_ENTRY_LOCK_UNAVAILABLE")
  }

  const entryCount = input.approvedTeamIds.length
  const uniqueTeamCount = new Set(input.approvedTeamIds).size
  const hasValidCapacity =
    Number.isInteger(input.capacity) && input.capacity >= 2 && input.capacity <= 32

  if (
    !hasValidCapacity ||
    entryCount < 2 ||
    entryCount > 32 ||
    entryCount > input.capacity ||
    uniqueTeamCount !== entryCount
  ) {
    throw new Error("BRACKET_ENTRY_COUNT_INVALID")
  }
}

// ห้ามเปลี่ยนโครงสร้างสายหลังมีคู่เริ่มแข่ง เพื่อรักษาความหมายของผลเดิม
export function assertBracketStructureMutable(input: {
  hasStartedMatch: boolean
}): void {
  if (input.hasStartedMatch) {
    throw new Error("BRACKET_STRUCTURE_LOCKED")
  }
}

// จำกัดโหมดจัดสายปัจจุบันไว้ที่ 8, 16, 32 ทีม เพื่อจับคู่ครบโดยไม่ต้องมีบาย
export function assertSystemBracketEntryCount(count: number): void {
  if (count !== 8 && count !== 16 && count !== 32) {
    throw new Error("BRACKET_ENTRY_COUNT_UNSUPPORTED")
  }
}

// ตรวจ ID ทีมและตำแหน่งว่าไม่ซ้ำ และตำแหน่งอยู่ครบในช่วง 1 ถึงจำนวนทีม
export function validateOrderedPositions(
  entries: readonly { entryId: string; position: number }[],
): void {
  const positions = entries.map((entry) => entry.position)
  if (
    new Set(entries.map((entry) => entry.entryId)).size !== entries.length ||
    new Set(positions).size !== entries.length ||
    positions.some((position) =>
      !Number.isInteger(position) || position < 1 || position > entries.length
    )
  ) {
    throw new Error("BRACKET_ORDER_INVALID")
  }
}

// ตรวจ seed ต่อเนื่องและไม่ซ้ำสำหรับเส้นทางจัดสายแบบเดิม
export function validateSeeds(
  entries: readonly { entryId: string; seed: number }[],
): void {
  const entryCount = entries.length
  const seedValues = entries.map((entry) => entry.seed)
  const entryIds = entries.map((entry) => entry.entryId)
  const hasValidSeeds = seedValues.every(
    (seed) => Number.isInteger(seed) && seed >= 1 && seed <= entryCount,
  )

  if (
    entryCount < 2 ||
    entryCount > 32 ||
    new Set(seedValues).size !== entryCount ||
    new Set(entryIds).size !== entryCount ||
    !hasValidSeeds
  ) {
    throw new Error("BRACKET_SEED_INVALID")
  }
}
