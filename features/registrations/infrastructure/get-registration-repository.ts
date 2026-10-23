/**
 * COURTSIDE: คำอธิบายไฟล์
 * ประกอบ Prisma repository สำหรับอ่านและจัดการใบสมัครแข่งขัน
 * เรียกใช้จาก: app/(admin)/organizer/tournaments/[id]/registrations/page.tsx, app/(admin)/team/[id]/page.tsx
 * ตามการทำงานต่อ: features/registrations/infrastructure/prisma-registration-repository.ts
 */

import "server-only"

import type { RegistrationRepository } from "../application/ports/registration-repository"
import { getPrismaClient } from "@/lib/server/prisma"

import { PrismaRegistrationRepository } from "./prisma-registration-repository"

export function getRegistrationRepository(): RegistrationRepository {
  return new PrismaRegistrationRepository(getPrismaClient())
}
