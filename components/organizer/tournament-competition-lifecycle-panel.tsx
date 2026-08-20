"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CircleAlert, Flag, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { TournamentCompetitionIssueCode } from "@/features/competition/domain/tournament-competition-policy"

const issueLabels: Record<TournamentCompetitionIssueCode, string> = {
  TOURNAMENT_STATUS_INVALID: "สถานะรายการไม่พร้อมสำหรับขั้นตอนนี้",
  BRACKET_MISSING: "ยังไม่มีสายการแข่งขัน",
  BRACKET_NOT_PUBLISHED: "ยังไม่ได้เผยแพร่สายการแข่งขัน",
  ENTRIES_NOT_LOCKED: "ยังไม่ได้ล็อกรายชื่อทีม",
  ENTRY_COUNT_INVALID: "ต้องมีทีมอย่างน้อย 2 ทีม",
  MATCH_MISSING: "ยังไม่มีคู่แข่งขัน",
  CHAMPIONSHIP_MISSING: "ยังไม่มีคู่ชิงชนะเลิศ",
  CHAMPIONSHIP_DUPLICATE: "มีคู่ชิงชนะเลิศมากกว่าหนึ่งคู่",
  THIRD_PLACE_DUPLICATE: "มีคู่ชิงอันดับ 3 มากกว่าหนึ่งคู่",
  PLACEMENT_TEAMS_INCOMPLETE: "คู่จัดอันดับยังมีทีมไม่ครบ",
  MATCH_RESULT_PENDING: "ยังมีคู่แข่งขันที่ไม่ได้ยืนยันผล",
  MATCH_RESULT_INVALID: "มีผลการแข่งขันที่ไม่สมบูรณ์",
}

const statusLabels: Record<string, string> = {
  REGISTRATION_CLOSED: "ปิดรับสมัครแล้ว",
  IN_PROGRESS: "กำลังแข่งขัน",
  COMPLETED: "จบการแข่งขันแล้ว",
}

export interface TournamentCompetitionLifecyclePanelProps {
  tournamentId: string
  status: string
  version: number
  startIssues: readonly TournamentCompetitionIssueCode[]
  completionIssues: readonly TournamentCompetitionIssueCode[]
  requiresOverrideReason: boolean
}

export function TournamentCompetitionLifecyclePanel({
  tournamentId,
  status,
  version,
  startIssues,
  completionIssues,
  requiresOverrideReason,
}: TournamentCompetitionLifecyclePanelProps) {
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const action =
    status === "REGISTRATION_CLOSED"
      ? "start"
      : status === "IN_PROGRESS"
        ? "complete"
        : null
  const issues =
    action === "start" ? startIssues : action === "complete" ? completionIssues : []
  const commandLabel = action === "start" ? "เริ่มการแข่งขัน" : "จบการแข่งขัน"

  async function submitCommand() {
    if (!action || issues.length > 0) return
    const trimmedReason = reason.trim()
    if (requiresOverrideReason && !trimmedReason) return
    const confirmation =
      action === "start"
        ? "ยืนยันเริ่มการแข่งขัน? หลังจากนี้จึงจะบันทึกผลได้"
        : "ยืนยันจบการแข่งขัน? ผลและอันดับจะถูกสรุปเป็นทางการ"
    if (!window.confirm(confirmation)) return

    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/organizer/tournaments/${tournamentId}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            version,
            ...(requiresOverrideReason ? { reason: trimmedReason } : {}),
          }),
        },
      )
      const result = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      if (!response.ok) {
        setMessage(result.message ?? "ไม่สามารถเปลี่ยนสถานะการแข่งขันได้")
        return
      }
      router.refresh()
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองใหม่")
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="border-b border-border py-7" aria-labelledby="competition-readiness-title">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold text-court">TOURNAMENT STATUS</p>
          <h2 className="mt-1 text-base font-semibold" id="competition-readiness-title">
            ความพร้อมของการแข่งขัน
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {statusLabels[status] ?? "ยังไม่อยู่ในขั้นดำเนินการแข่งขัน"}
          </p>
        </div>
        {action ? (
          <Button
            disabled={
              pending ||
              issues.length > 0 ||
              (requiresOverrideReason && !reason.trim())
            }
            onClick={() => void submitCommand()}
            type="button"
          >
            {action === "start" ? (
              <Play aria-hidden="true" />
            ) : (
              <Flag aria-hidden="true" />
            )}
            {pending ? "กำลังดำเนินการ" : commandLabel}
          </Button>
        ) : null}
      </div>

      {issues.length > 0 ? (
        <ul className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {issues.map((issue) => (
            <li className="flex items-start gap-2" key={issue}>
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span>{issueLabels[issue]}</span>
            </li>
          ))}
        </ul>
      ) : action ? (
        <p className="mt-5 text-sm text-muted-foreground">
          ตรวจสอบเงื่อนไขครบแล้ว พร้อมดำเนินการขั้นถัดไป
        </p>
      ) : null}

      {requiresOverrideReason && action ? (
        <div className="mt-5 grid max-w-xl gap-1.5">
          <label className="text-sm font-medium" htmlFor="competition-override-reason">
            เหตุผลที่ดำเนินการแทนผู้จัด
          </label>
          <textarea
            className="min-h-24 w-full border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            id="competition-override-reason"
            maxLength={500}
            onChange={(event) => setReason(event.target.value)}
            required
            value={reason}
          />
        </div>
      ) : null}

      {message ? (
        <p aria-live="polite" className="mt-4 text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </section>
  )
}
