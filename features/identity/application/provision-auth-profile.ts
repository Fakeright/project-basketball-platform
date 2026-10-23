/**
 * COURTSIDE: คำอธิบายไฟล์
 * สร้างหรือเชื่อมโปรไฟล์ของแอปกับบัญชี Supabase โดยจำกัดบทบาทที่ผู้สมัครเลือกเองได้
 * เรียกใช้จาก: features/identity/presentation/auth-handler.ts
 */

import type {
  AuthProfileInput,
  UserProfileRepository,
} from "@/features/identity/application/ports/user-profile-repository"

// เชื่อม user ID ของ Supabase กับโปรไฟล์ในแอป และไม่รับบทบาทแอดมินจากผู้สมัครเอง
export async function provisionAuthProfile(
  input: AuthProfileInput,
  repository: UserProfileRepository,
) {
  if (input.role === "PLATFORM_ADMIN") {
    throw new Error("ROLE_NOT_SELF_ASSIGNABLE")
  }

  const existingProfile = await repository.findBySupabaseUserId(
    input.supabaseUserId,
  )
  return existingProfile ?? repository.create({
    supabaseUserId: input.supabaseUserId,
    email: input.email,
    displayName: input.displayName,
    role: input.role,
  })
}
