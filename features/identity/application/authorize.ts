/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจสิทธิ์ตามบทบาทและความเป็นเจ้าของทรัพยากรบนเซิร์ฟเวอร์ โดยแอดมินมีสิทธิ์ข้ามการตรวจเจ้าของ
 * เรียกใช้จาก: app/(admin)/organizer/tournaments/[id]/page.tsx, features/competition/application/correct-match-result.ts
 * ตามการทำงานต่อ: features/identity/domain/permission.ts
 */

import type { Actor } from "@/features/identity/domain/actor";
import {
  permissionsByRole,
  type Permission,
} from "@/features/identity/domain/permission";

export interface AuthorizationResource {
  organizerId?: string;
}

// ตรวจทั้งสิทธิ์ของบทบาทและเจ้าของทรัพยากร; เรียกบน server ก่อนแก้ข้อมูล
export function authorize(
  actor: Actor,
  action: Permission,
  resource: AuthorizationResource = {},
): void {
  if (actor.role === "PLATFORM_ADMIN") {
    return;
  }

  const canPerformAction = permissionsByRole[actor.role].has(action);
  const ownsResource = resource.organizerId === actor.id;

  if (!canPerformAction || !ownsResource) {
    throw new Error("FORBIDDEN");
  }
}
