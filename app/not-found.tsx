/**
 * COURTSIDE: คำอธิบายไฟล์
 * แสดงสถานะไม่พบหน้า/รายการในขอบเขต / และทางกลับไปใช้งานต่อ
 * ตามการทำงานต่อ: components/state-panel.tsx
 */

import { StatePanel } from "@/components/state-panel"

export default function NotFound() {
  return <StatePanel action={{ href: "/", label: "กลับหน้าแรก" }} kind="not-found" />
}
