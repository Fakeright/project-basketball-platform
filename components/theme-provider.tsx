"use client"

/**
 * COURTSIDE: คำอธิบายไฟล์
 * เชื่อม next-themes ให้ component ใต้ต้นไม้เลือกธีมและอ่านค่าธีมร่วมกัน
 * เรียกใช้จาก: app/layout.tsx
 * ตามการทำงานต่อ: components/ui/tooltip.tsx
 */

import { ThemeProvider as NextThemesProvider } from "next-themes"

import { TooltipProvider } from "@/components/ui/tooltip"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>{children}</TooltipProvider>
    </NextThemesProvider>
  )
}
