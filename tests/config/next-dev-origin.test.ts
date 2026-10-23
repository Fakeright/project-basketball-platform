/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ next.config.ts โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { describe, expect, it } from "vitest"

import nextConfig from "../../next.config"

describe("Next.js development origins", () => {
  it("allows the 127.0.0.1 hostname used by the local login page", () => {
    expect(nextConfig.allowedDevOrigins).toContain("127.0.0.1")
  })
})
