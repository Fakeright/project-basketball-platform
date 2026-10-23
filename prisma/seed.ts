/**
 * COURTSIDE: คำอธิบายไฟล์
 * จุดเริ่มต้นสคริปต์สร้างข้อมูลสาธิตหลัก โดยตรวจ environment และใช้ขั้นตอน seed ที่กำหนดไว้
 * ตามการทำงานต่อ: features/demo-data/infrastructure/prisma-demo-seed-port.ts, features/demo-data/infrastructure/demo-seed-orchestration.ts, features/demo-data/infrastructure/demo-seed-safety.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"

import { createPrismaDemoSeedPort } from "../features/demo-data/infrastructure/prisma-demo-seed-port"
import { runBaseDemoSeed } from "../features/demo-data/infrastructure/demo-seed-orchestration"
import { createDemoSeedClient } from "../features/demo-data/infrastructure/demo-seed-safety"
import { PrismaClient } from "../lib/generated/prisma/client"

config({ path: ".env.local" })
config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL_NOT_CONFIGURED")
}

const prisma = createDemoSeedClient(process.env, () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  }),
)

runBaseDemoSeed(createPrismaDemoSeedPort(prisma))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
