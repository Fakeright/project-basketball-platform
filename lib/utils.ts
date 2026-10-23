/**
 * COURTSIDE: คำอธิบายไฟล์
 * รวมตัวช่วย className สำหรับ component โดยใช้ clsx และ tailwind-merge
 * เรียกใช้จาก: components/organizer/bracket-mode-control.tsx, components/province-combobox.tsx
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// รวม className และแก้คลาส Tailwind ที่ชนกัน ให้ component กำหนดรูปแบบเพิ่มเติมได้
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
