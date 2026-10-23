/**
 * COURTSIDE: คำอธิบายไฟล์
 * บันทึกและใช้สิทธิ์เปลี่ยนรหัสผ่านแบบครั้งเดียวผ่าน repository
 * เรียกใช้จาก: features/identity/infrastructure/hmac-recovery-grant-service.ts
 */

import type {
  AuthRecoveryGrantRepository,
  ConsumeAuthRecoveryGrantInput,
  CreateAuthRecoveryGrantInput,
} from "@/features/identity/application/ports/auth-recovery-grant-repository"

// สร้างข้อมูลสิทธิ์ recovery ที่ repository ใช้ตรวจตอนตั้งรหัสผ่านใหม่
export function recordRecoveryGrant(
  input: CreateAuthRecoveryGrantInput,
  repository: AuthRecoveryGrantRepository,
) {
  return repository.create(input)
}

// ใช้สิทธิ์ recovery เพียงครั้งเดียว โดยให้ repository ตรวจการหมดอายุและการถูกใช้ไปแล้ว
export function consumeRecoveryGrant(
  input: ConsumeAuthRecoveryGrantInput,
  repository: AuthRecoveryGrantRepository,
) {
  return repository.consume(input)
}
