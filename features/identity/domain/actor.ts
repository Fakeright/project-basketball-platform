/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนดบทบาทและข้อมูลผู้กระทำปัจจุบัน รวมสัญญาอ่านผู้ใช้จาก session
 * เรียกใช้จาก: app/(admin)/team/[id]/page.tsx, app/(public)/tournaments/[slug]/page.tsx
 */

export const roles = [
  "PLATFORM_ADMIN",
  "TOURNAMENT_ORGANIZER",
  "TEAM_MANAGER_COACH",
  "PLAYER",
] as const;

export type Role = (typeof roles)[number];

export interface Actor {
  id: string;
  role: Role;
  email: string;
  displayName: string;
}

export interface CurrentActorProvider {
  getCurrentActor(): Promise<Actor | null>;
}
