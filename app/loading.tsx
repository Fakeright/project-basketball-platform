/**
 * COURTSIDE: คำอธิบายไฟล์
 * แสดงสถานะกำลังโหลดในขอบเขต / ระหว่าง Next.js รอข้อมูลหน้า
 * ตามการทำงานต่อ: components/state-panel.tsx
 */

import { StatePanel } from "@/components/state-panel"

export default function Loading() {
  return <StatePanel kind="empty" message="กำลังโหลดข้อมูลการแข่งขัน" title="กำลังโหลด" />
}
