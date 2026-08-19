"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface EditableMatchResult {
  id: string
  roundName: string
  sequence: number
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  winnerTeam: string | null
  status: string
  version: number
  teamsComplete: boolean
}

export function MatchResultEditor({
  tournamentId,
  matches,
}: {
  tournamentId: string
  matches: EditableMatchResult[]
}) {
  const router = useRouter()
  const [pendingMatchId, setPendingMatchId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function submitResult(
    event: FormEvent<HTMLFormElement>,
    match: EditableMatchResult,
  ) {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null
    const shouldConfirm = submitter?.value === "confirm"
    const formData = new FormData(event.currentTarget)
    const homeScore = Number(formData.get("homeScore"))
    const awayScore = Number(formData.get("awayScore"))
    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      awayScore < 0
    ) {
      setMessage("คะแนนต้องเป็นจำนวนเต็มไม่ติดลบ")
      return
    }
    if (shouldConfirm && homeScore === awayScore) {
      setMessage("ผลที่ยืนยันต้องมีทีมชนะ")
      return
    }
    if (
      shouldConfirm &&
      !window.confirm("ยืนยันผลการแข่งขัน? ระบบจะเลื่อนทีมชนะเข้าสู่คู่ถัดไป")
    ) {
      return
    }

    setPendingMatchId(match.id)
    setMessage(null)
    try {
      const action = shouldConfirm ? "confirm" : "score"
      const response = await fetch(
        `/api/organizer/tournaments/${tournamentId}/matches/${match.id}/${action}`,
        {
          method: shouldConfirm ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homeScore,
            awayScore,
            expectedVersion: match.version,
            ...(shouldConfirm ? { confirm: true } : {}),
          }),
        },
      )
      const result = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      if (!response.ok) {
        setMessage(result.message ?? "ไม่สามารถบันทึกผลการแข่งขันได้")
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
        ยังไม่มีคู่แข่งขันสำหรับบันทึกผล
      </p>
    )
  }

  return (
    <div>
      <div className="divide-y divide-border border-y border-border">
        {matches.map((match) => {
          const disabled =
            pendingMatchId !== null ||
            match.status === "COMPLETED" ||
            !match.teamsComplete
          return (
            <form
              className="grid gap-4 py-5 lg:grid-cols-[10rem_minmax(12rem,1fr)_6rem_6rem_auto] lg:items-end"
              key={match.id}
              onSubmit={(event) => void submitResult(event, match)}
            >
              <div>
                <p className="text-xs text-muted-foreground">{match.roundName}</p>
                <p className="mt-1 text-sm font-semibold">คู่ที่ {match.sequence}</p>
              </div>
              <div className="min-w-0 text-sm">
                <p className="break-words font-medium">{match.homeTeam}</p>
                <p className="mt-1 break-words text-muted-foreground">{match.awayTeam}</p>
                {match.winnerTeam ? (
                  <p className="mt-2 text-xs font-medium text-court">
                    ผู้ชนะ {match.winnerTeam}
                  </p>
                ) : null}
              </div>
              <label className="text-sm font-medium">
                คะแนนทีมแรก
                <Input
                  className="mt-1 min-h-10 tabular-nums"
                  defaultValue={match.homeScore ?? ""}
                  disabled={disabled}
                  min={0}
                  name="homeScore"
                  required
                  type="number"
                />
              </label>
              <label className="text-sm font-medium">
                คะแนนทีมสอง
                <Input
                  className="mt-1 min-h-10 tabular-nums"
                  defaultValue={match.awayScore ?? ""}
                  disabled={disabled}
                  min={0}
                  name="awayScore"
                  required
                  type="number"
                />
              </label>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button disabled={disabled} name="action" type="submit" value="draft" variant="outline">
                  <Save aria-hidden="true" />
                  บันทึกร่าง
                </Button>
                <Button disabled={disabled} name="action" type="submit" value="confirm">
                  <CheckCircle2 aria-hidden="true" />
                  ยืนยันผล
                </Button>
              </div>
            </form>
          )
        })}
      </div>
      {message ? (
        <p aria-live="polite" className="mt-4 text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  )
}
