/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ prisma โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  adapterConfig: undefined as unknown,
}))

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: class {
    constructor(config: unknown) {
      mocks.adapterConfig = config
    }
  },
}))

vi.mock("@/lib/generated/prisma/client", () => ({
  PrismaClient: class {},
}))

afterEach(() => {
  delete (globalThis as { courtsidePrisma?: unknown }).courtsidePrisma
  mocks.adapterConfig = undefined
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe("getPrismaClient", () => {
  it("limits each runtime instance to one database connection", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/courtside")
    const { getPrismaClient } = await import("@/lib/server/prisma")

    getPrismaClient()

    expect(mocks.adapterConfig).toMatchObject({
      connectionString: "postgresql://localhost:5432/courtside",
      max: 1,
    })
  })
})
