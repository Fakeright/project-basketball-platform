"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarClock, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { bangkokDateTimeLocalToUtc } from "@/features/admin/presentation/tournament-editor-time"

export interface EditableMatchSchedule {
  id: string
  roundName: string
  sequence: number
  homeTeam: string
  awayTeam: string
  scheduledAt: string
  court: string
  status: string
  version: number
}

export function MatchScheduleEditor({
  tournamentId,
  matches,
}: {
  tournamentId: string
  matches: EditableMatchSchedule[]
}) {
  const router = useRouter()
  const [pendingMatchId, setPendingMatchId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function saveMatch(match: EditableMatchSchedule, form: HTMLFormElement) {
    const formData = new FormData(form)
    const scheduledAt = String(formData.get("scheduledAt") ?? "")
    const court = String(formData.get("court") ?? "").trim()
    let utcScheduledAt: string
    try {
      utcScheduledAt = bangkokDateTimeLocalToUtc(scheduledAt)
    } catch {
      setMessage("กรุณาระบุวันและเวลาแข่งขันให้ถูกต้อง")
      return
    }
    if (!court) {
      setMessage("กรุณาระบุสนามแข่งขัน")
      return
    }

    setPendingMatchId(match.id)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/organizer/tournaments/${tournamentId}/matches/${match.id}/schedule`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduledAt: utcScheduledAt,
            court,
            expectedVersion: match.version,
          }),
        },
      )
      const result = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      if (!response.ok) {
        setMessage(result.message ?? "ไม่สามารถบันทึกตารางแข่งขันได้")
        return
      }
      router.refresh()
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองใหม่")
    } finally {
      setPendingMatchId(null)
    }
  }

  if (matches.length === 0) {
    return (
      <p className="border-y border-border py-8 text-sm text-muted-foreground">
        ยังไม่มีคู่แข่งขัน กรุณาสร้างและเผยแพร่สายการแข่งขันก่อน
      </p>
    )
  }

  return (
    <div>
      <div className="divide-y divide-border border-y border-border">
        {matches.map((match) => (
          <form
            className="grid gap-4 py-5 lg:grid-cols-[12rem_minmax(12rem,1fr)_13rem_12rem_auto] lg:items-end"
            key={match.id}
            onSubmit={(event) => {
              event.preventDefault()
              void saveMatch(match, event.currentTarget)
            }}
          >
            <div>
              <p className="text-xs text-muted-foreground">{match.roundName}</p>
              <p className="mt-1 text-sm font-semibold">คู่ที่ {match.sequence}</p>
            </div>
            <div className="min-w-0 text-sm">
              <p className="break-words font-medium">{match.homeTeam}</p>
              <p className="mt-1 break-words text-muted-foreground">{match.awayTeam}</p>
            </div>
            <label className="text-sm font-medium">
              วันและเวลา
              <Input
                className="mt-1 min-h-10"
                defaultValue={match.scheduledAt}
                disabled={match.status !== "SCHEDULED"}
                name="scheduledAt"
                required
                type="datetime-local"
              />
            </label>
            <label className="text-sm font-medium">
              สนาม
              <Input
                className="mt-1 min-h-10"
                defaultValue={match.court}
                disabled={match.status !== "SCHEDULED"}
                maxLength={120}
                name="court"
                required
              />
            </label>
            <Button
              disabled={pendingMatchId !== null || match.status !== "SCHEDULED"}
              size="lg"
              type="submit"
            >
              {pendingMatchId === match.id ? (
                <CalendarClock aria-hidden="true" />
              ) : (
                <Save aria-hidden="true" />
              )}
              {pendingMatchId === match.id ? "กำลังบันทึก" : "บันทึก"}
            </Button>
          </form>
        ))}
      </div>
      {message ? (
        <p aria-live="polite" className="mt-4 text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  )
}
