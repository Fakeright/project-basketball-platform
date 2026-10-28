/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจว่ารหัสจังหวัดอยู่ในรายการจังหวัดไทยที่ระบบรองรับก่อนบันทึกข้อมูล
 * เรียกใช้จาก: features/admin/presentation/tournament-editor-schema.ts, features/team-management/application/create-team.ts
 * ตามการทำงานต่อ: features/provinces/domain/thai-provinces.ts
 */

import { findProvinceByCode } from "@/features/provinces/domain/thai-provinces"

// ปฏิเสธรหัสจังหวัดที่ไม่ได้อยู่ในชุดข้อมูลกลางก่อนเข้าสู่ขั้นตอนบันทึก
export function assertProvinceCode(code: string): string {
  if (!findProvinceByCode(code)) {
    throw new Error("INVALID_PROVINCE_CODE")
  }

  return code
}
