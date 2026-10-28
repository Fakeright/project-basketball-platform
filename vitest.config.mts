/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนด Vitest ให้รันชุดทดสอบใน jsdom และแทน server-only ด้วย stub สำหรับการทดสอบ
 */

import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

export default defineConfig({
  resolve: {
    // Vite อ่าน alias จาก tsconfig ได้โดยตรง จึงไม่ต้องใช้ plugin เพิ่ม
    tsconfigPaths: true,
    alias: {
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
})
