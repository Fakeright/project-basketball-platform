/**
 * COURTSIDE: คำอธิบายไฟล์
 * เรียงทีมด้วยค่า hash จาก token และ ID ทีม ทำให้ token เดิมได้ลำดับเดิมสำหรับตรวจย้อนหลัง
 * เรียกใช้จาก: app/api/organizer/tournaments/[id]/bracket/generate/route.ts
 */

import { createHash } from "node:crypto"

import type { LockedBracketEntry } from "@/features/competition/domain/competition"

// สร้างลำดับที่ทำซ้ำได้จาก token; token ใหม่ให้การจับสลากใหม่ ส่วน token เดิมใช้ตรวจย้อนหลัง
export function tokenizedBracketShuffle(
  entries: readonly LockedBracketEntry[],
  token: string,
): LockedBracketEntry[] {
  return [...entries].sort((left, right) => {
    const hashOrder = hashEntry(token, left.id).localeCompare(
      hashEntry(token, right.id),
    )
    return hashOrder || left.id.localeCompare(right.id)
  })
}

// ผสม token กับ ID entry เพื่อให้แต่ละทีมมีค่าที่นำไปเรียงลำดับได้
function hashEntry(token: string, entryId: string) {
  return createHash("sha256").update(token).update(":").update(entryId).digest("hex")
}
