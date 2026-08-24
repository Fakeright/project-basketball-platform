"use client"

import { useState } from "react"

type ReviewDecision = "APPROVED" | "CHANGES_REQUESTED" | "REJECTED"

interface ReviewTournament {
  id: string
  title: string
  version: number
}

const decisionCopy: Record<
  ReviewDecision,
  { confirmation: string; success: string }
> = {
  APPROVED: {
    confirmation: "ยืนยันการอนุมัติรายการแข่งขัน?",
    success: "อนุมัติรายการแล้ว",
  },
  CHANGES_REQUESTED: {
    confirmation: "ยืนยันการส่งรายการกลับให้ผู้จัดแก้ไข?",
    success: "ส่งรายการกลับให้ผู้จัดแก้ไขแล้ว",
  },
  REJECTED: {
    confirmation: "ยืนยันการปฏิเสธรายการแข่งขัน?",
    success: "ปฏิเสธรายการแล้ว",
  },
}

export function TournamentReviewPanel({
  tournament,
}: {
  tournament: ReviewTournament
}) {
  const [note, setNote] = useState("")
  const [pendingDecision, setPendingDecision] =
    useState<ReviewDecision | null>(null)
  const [completed, setCompleted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submitDecision(decision: ReviewDecision) {
    const trimmedNote = note.trim()
    if (decision !== "APPROVED" && !trimmedNote) {
      setMessage("กรุณาระบุเหตุผล")
      return
    }
    if (!window.confirm(decisionCopy[decision].confirmation)) return

    setPendingDecision(decision)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournament.id}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            note: trimmedNote,
            version: tournament.version,
          }),
        },
      )
      const result = (await response.json().catch(() => ({}))) as {
        message?: string
        error?: string
      }
      if (!response.ok) {
        setMessage(
          result.message ??
            result.error ??
            "ไม่สามารถบันทึกผลการพิจารณาได้ กรุณาลองอีกครั้ง",
        )
        return
      }

      setCompleted(true)
      setMessage(decisionCopy[decision].success)
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองอีกครั้ง")
    } finally {
      setPendingDecision(null)
    }
  }

  return (
    <section
      aria-labelledby="review-decision-heading"
      className="border-t border-border pt-6"
    >
      <h2 className="text-lg font-semibold" id="review-decision-heading">
        ผลการพิจารณา
      </h2>
      <label className="mt-4 block space-y-2 text-sm">
        <span>เหตุผลประกอบการพิจารณา</span>
        <textarea
          className="min-h-28 w-full border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
          disabled={completed || pendingDecision !== null}
          maxLength={500}
          onChange={(event) => setNote(event.target.value)}
          value={note}
        />
      </label>
      <p className="mt-2 text-xs text-muted-foreground">
        ต้องระบุเหตุผลเมื่อขอแก้ไขหรือปฏิเสธรายการ
      </p>
      {message ? (
        <p
          aria-live="polite"
          className="mt-4 border-l-4 border-court px-3 py-2 text-sm"
        >
          {message}
        </p>
      ) : null}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <ReviewButton
          disabled={completed || pendingDecision !== null}
          label="อนุมัติ"
          onClick={() => submitDecision("APPROVED")}
          pending={pendingDecision === "APPROVED"}
        />
        <ReviewButton
          disabled={completed || pendingDecision !== null}
          label="ขอแก้ไข"
          onClick={() => submitDecision("CHANGES_REQUESTED")}
          pending={pendingDecision === "CHANGES_REQUESTED"}
        />
        <ReviewButton
          disabled={completed || pendingDecision !== null}
          label="ปฏิเสธ"
          onClick={() => submitDecision("REJECTED")}
          pending={pendingDecision === "REJECTED"}
        />
      </div>
    </section>
  )
}

function ReviewButton({
  disabled,
  label,
  onClick,
  pending,
}: {
  disabled: boolean
  label: string
  onClick: () => void
  pending: boolean
}) {
  return (
    <button
      className="min-h-11 border border-foreground px-4 text-sm font-medium hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {pending ? "กำลังบันทึก" : label}
    </button>
  )
}
