/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนดสัญญาสิทธิ์กู้รหัสผ่าน การใช้สิทธิ์ครั้งเดียว และบริการตรวจ recovery transaction
 * เรียกใช้จาก: features/identity/application/manage-recovery-grant.ts, features/identity/infrastructure/hmac-recovery-grant-service.ts
 */

export interface CreateAuthRecoveryGrantInput {
  nonceHash: string
  userId: string
  expiresAt: Date
}

export interface ConsumeAuthRecoveryGrantInput {
  nonceHash: string
  userId: string
  now: Date
}

export interface AuthRecoveryGrantRepository {
  create(input: CreateAuthRecoveryGrantInput): Promise<void>
  consume(input: ConsumeAuthRecoveryGrantInput): Promise<boolean>
}

export interface VerifiedRecoveryTransaction {
  emailHash: string
}

export interface RecoveryGrantService {
  issueTransactionState(email: string): Promise<string>
  verifyTransactionState(
    state: string,
  ): Promise<VerifiedRecoveryTransaction | null>
  matchesTransactionEmail(
    transaction: VerifiedRecoveryTransaction,
    email: string,
  ): boolean
  issue(userId: string): Promise<void>
  consume(userId: string): Promise<boolean>
}
