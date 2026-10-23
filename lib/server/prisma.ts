/**
 * COURTSIDE: คำอธิบายไฟล์
 * สร้างและใช้ Prisma client กับ PostgreSQL ร่วมกันในฝั่งเซิร์ฟเวอร์
 * เรียกใช้จาก: app/api/teams/route.ts, features/admin/infrastructure/get-admin-dashboard-repository.ts
 * ตามการทำงานต่อ: lib/generated/prisma/client.ts
 */

import "server-only"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/lib/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  courtsidePrisma?: PrismaClient
}

// ใช้ Prisma client ร่วมกันตามสภาพแวดล้อม เพื่อลดการสร้าง connection ซ้ำเมื่อโหลดโมดูล
export function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL_NOT_CONFIGURED")
  }

  return globalForPrisma.courtsidePrisma ??= new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    }),
  })
}
