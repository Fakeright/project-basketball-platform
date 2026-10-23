/**
 * COURTSIDE: คำอธิบายไฟล์
 * ประกอบ Prisma repository สำหรับโปรไฟล์ผู้ใช้ของแอป
 * เรียกใช้จาก: features/identity/infrastructure/get-auth-handlers.ts, features/identity/infrastructure/next-cookie-current-actor-provider.ts
 * ตามการทำงานต่อ: features/identity/infrastructure/prisma-user-profile-repository.ts
 */

import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import { PrismaUserProfileRepository } from "./prisma-user-profile-repository"

export function getUserProfileRepository() {
  return new PrismaUserProfileRepository(getPrismaClient())
}
