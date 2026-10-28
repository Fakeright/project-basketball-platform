/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจผู้ใช้ที่ยืนยันตัวตนกับ Supabase แล้วอ่านโปรไฟล์และบทบาทจากฐานข้อมูลของแอป
 * เรียกใช้จาก: features/identity/infrastructure/create-current-actor-provider.ts, features/identity/infrastructure/next-cookie-current-actor-provider.ts
 */

import type { UserProfileRepository } from "@/features/identity/application/ports/user-profile-repository"
import type {
  Actor,
  CurrentActorProvider,
} from "@/features/identity/domain/actor"

export interface AuthenticatedUserReader {
  getAuthenticatedUser(): Promise<{ id: string } | null>
}

export class SupabaseCurrentActorProvider implements CurrentActorProvider {
  constructor(
    private readonly authenticatedUserReader: AuthenticatedUserReader,
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  // แปลง Supabase user จาก session เป็น Actor ของแอป ซึ่ง use case ใช้ตรวจสิทธิ์
  async getCurrentActor(): Promise<Actor | null> {
    const authenticatedUser =
      await this.authenticatedUserReader.getAuthenticatedUser()
    if (!authenticatedUser) return null

    const profile =
      await this.userProfileRepository.findBySupabaseUserId(authenticatedUser.id)
    if (!profile) return null

    return {
      id: profile.id,
      role: profile.role,
      email: profile.email,
      displayName: profile.displayName,
    }
  }
}
