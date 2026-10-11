"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import type { BracketMode } from "@/features/competition/domain/competition"

const modes: Array<{ value: BracketMode; label: string }> = [
  { value: "SYSTEM_GENERATED", label: "สร้างอัตโนมัติ" },
  { value: "EXTERNAL_DOCUMENT", label: "ใช้ไฟล์ภายนอก" },
]

export function BracketModeControl({
  tournamentId,
  currentMode,
  expectedVersion,
  locked,
}: {
  tournamentId: string
  currentMode: BracketMode
  expectedVersion: number
  locked: boolean
}) {
  const router = useRouter()
  const [pendingMode, setPendingMode] = useState<BracketMode | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function selectMode(mode: BracketMode) {
    if (locked || pendingMode || mode === currentMode) return
    setPendingMode(mode)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/organizer/tournaments/${tournamentId}/bracket/mode`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetMode: mode, expectedVersion }),
        },
      )
      const result = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      if (!response.ok) {
        setMessage(result.message ?? "ไม่สามารถเปลี่ยนรูปแบบสายการแข่งขันได้")
        return
      }
      router.refresh()
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองใหม่")
    } finally {
      setPendingMode(null)
    }
  }

  return (
    <div>
      <div
        aria-label="รูปแบบสายการแข่งขัน"
        className="inline-grid grid-cols-2 border border-border p-1"
        role="radiogroup"
      >
        {modes.map((mode) => {
          const selected = mode.value === currentMode
          return (
            <button
              aria-checked={selected}
              className={cn(
                "min-h-10 px-4 text-sm font-medium transition-colors",
                selected
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              disabled={locked || pendingMode !== null}
              key={mode.value}
              onClick={() => void selectMode(mode.value)}
              role="radio"
              type="button"
            >
              {pendingMode === mode.value ? "กำลังเปลี่ยน" : mode.label}
            </button>
          )
        })}
      </div>
      {locked ? (
        <p className="mt-2 text-sm text-muted-foreground">
          ไม่สามารถเปลี่ยนรูปแบบหลังเริ่มการแข่งขันแล้ว
        </p>
      ) : null}
      {message ? (
        <p aria-live="polite" className="mt-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  )
}
