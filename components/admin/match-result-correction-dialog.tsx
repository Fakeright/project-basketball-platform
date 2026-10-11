"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface AdminCorrectableMatch {
  id: string
  roundName: string
  sequence: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  winnerTeam: string
  version: number
}

export function MatchResultCorrectionDialog({
  tournamentId,
  match,
}: {
  tournamentId: string
  match: AdminCorrectableMatch
}) {
  const router = useRouter()
  const [homeScore, setHomeScore] = useState(String(match.homeScore))
  const [awayScore, setAwayScore] = useState(String(match.awayScore))
  const [reason, setReason] = useState("")
  const [pending, setPending] = useState(false)
  const [conflicted, setConflicted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const parsedHomeScore = Number(homeScore)
  const parsedAwayScore = Number(awayScore)
  const scoresValid =
    homeScore !== "" &&
    awayScore !== "" &&
    Number.isInteger(parsedHomeScore) &&
    Number.isInteger(parsedAwayScore) &&
    parsedHomeScore >= 0 &&
    parsedAwayScore >= 0
  const winnerPreview = !scoresValid
    ? null
    : parsedHomeScore === parsedAwayScore
      ? "ผลเสมอไม่สามารถยืนยันได้"
      : `ผู้ชนะหลังแก้: ${
          parsedHomeScore > parsedAwayScore ? match.homeTeam : match.awayTeam
        }`

  async function submitCorrection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      setMessage("กรุณาระบุเหตุผล")
      return
    }
    if (!scoresValid || parsedHomeScore === parsedAwayScore) {
      setMessage("คะแนนต้องเป็นจำนวนเต็มไม่ติดลบและห้ามเสมอ")
      return
    }
    if (
      !window.confirm(
        "ยืนยันการแก้ผลการแข่งขัน? การเปลี่ยนผู้ชนะอาจเปลี่ยนทีมในรอบถัดไป",
      )
    ) {
      return
    }

    setPending(true)
    setConflicted(false)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournamentId}/matches/${match.id}/result-correction`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homeScore: parsedHomeScore,
            awayScore: parsedAwayScore,
            expectedVersion: match.version,
            reason: trimmedReason,
            confirm: true,
          }),
        },
      )
      const result = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      if (!response.ok) {
        setConflicted(response.status === 409)
        setMessage(result.message ?? "ไม่สามารถแก้ผลการแข่งขันได้")
        return
      }
      setMessage("แก้ไขผลการแข่งขันแล้ว")
      router.refresh()
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองใหม่")
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      className="grid gap-5 py-6 lg:grid-cols-[10rem_minmax(12rem,1fr)_minmax(16rem,1.2fr)]"
      onSubmit={(event) => void submitCorrection(event)}
    >
      <div>
        <p className="text-xs text-muted-foreground">{match.roundName}</p>
        <p className="mt-1 text-sm font-semibold">คู่ที่ {match.sequence}</p>
        <p className="mt-3 text-xs text-muted-foreground">ผู้ชนะปัจจุบัน</p>
        <p className="mt-1 text-sm font-medium">{match.winnerTeam}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="min-w-0 text-sm font-medium">
          <span className="block truncate">คะแนน {match.homeTeam}</span>
          <Input
            className="mt-1 min-h-10 tabular-nums"
            disabled={pending}
            min={0}
            onChange={(event) => setHomeScore(event.target.value)}
            required
            type="number"
            value={homeScore}
          />
        </label>
        <label className="min-w-0 text-sm font-medium">
          <span className="block truncate">คะแนน {match.awayTeam}</span>
          <Input
            className="mt-1 min-h-10 tabular-nums"
            disabled={pending}
            min={0}
            onChange={(event) => setAwayScore(event.target.value)}
            required
            type="number"
            value={awayScore}
          />
        </label>
        <p className="col-span-2 min-h-5 text-sm font-medium text-court">
          {winnerPreview}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">
          เหตุผลการแก้ผล
          <textarea
            className="mt-1 min-h-20 w-full border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            disabled={pending}
            maxLength={500}
            onChange={(event) => setReason(event.target.value)}
            required
            value={reason}
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          ระบบบันทึกเหตุผลและผู้แก้ไขในประวัติการตรวจสอบ
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled={pending} type="submit">
            <ShieldCheck aria-hidden="true" />
            {pending ? "กำลังแก้ไข" : "ยืนยันการแก้ผล"}
          </Button>
          {conflicted ? (
            <Button onClick={() => router.refresh()} type="button" variant="outline">
              <RotateCcw aria-hidden="true" />
              โหลดข้อมูลล่าสุด
            </Button>
          ) : null}
        </div>
        {message ? (
          <p aria-live="polite" className="mt-3 text-sm text-destructive">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  )
}
