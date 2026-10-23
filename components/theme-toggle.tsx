"use client"

/**
 * COURTSIDE: คำอธิบายไฟล์
 * ปุ่มเปลี่ยนธีมสว่าง/มืดโดยใช้สถานะจาก ThemeProvider
 * เรียกใช้จาก: app/(admin)/layout.tsx, components/site-header.tsx
 * ตามการทำงานต่อ: components/ui/button.tsx, components/ui/tooltip.tsx
 */

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const subscribeToHydration = () => () => undefined

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? "ใช้โหมดสว่าง" : "ใช้โหมดมืด"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            size="icon"
            variant="ghost"
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
