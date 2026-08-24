"use client"

import { useState } from "react"

import type { TournamentOperationStatus } from "@/features/tournament-operations/domain/tournament-operation"

type LifecycleAction = "publish" | "close-registration"

const actionCopy: Record<
  LifecycleAction,
  { confirmation: string; label: string; success: string }
> = {
  publish: {
    confirmation: "ยืนยันการเผยแพร่รายการแข่งขันสู่สาธารณะ?",
    label: "เผยแพร่รายการ",
    success: "เผยแพร่รายการแล้ว",
  },
  "close-registration": {
    confirmation: "ยืนยันการปิดรับสมัคร? ทีมใหม่จะไม่สามารถส่งใบสมัครได้",
    label: "ปิดรับสมัคร",
    success: "ปิดรับสมัครแล้ว",
  },
}

export function TournamentLifecycleActions({
  tournamentId,
  status,
  version,
}: {
  tournamentId: string
  status: TournamentOperationStatus
  version: number
}) {
  const action =
    status === "APPROVED"
      ? "publish"
      : status === "PUBLISHED"
        ? "close-registration"
        : null
  const [pending, setPending] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (!action) return null

  async function transition() {
    if (!action || !window.confirm(actionCopy[action].confirmation)) return

    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournamentId}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version }),
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
            "ไม่สามารถเปลี่ยนสถานะรายการได้ กรุณาลองอีกครั้ง",
        )
        return
      }

      setCompleted(true)
      setMessage(actionCopy[action].success)
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองอีกครั้ง")
    } finally {
      setPending(false)
    }
  }

  return (
    <section
      aria-labelledby="tournament-lifecycle-heading"
      className="border-y border-border px-4 py-5 sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="text-sm font-semibold"
            id="tournament-lifecycle-heading"
          >
            สถานะรายการแข่งขัน
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {status === "APPROVED"
              ? "รายการผ่านการอนุมัติแล้ว และพร้อมเผยแพร่"
              : "รายการกำลังเปิดรับสมัคร"}
          </p>
          {message ? (
            <p aria-live="polite" className="mt-2 text-sm">
              {message}
            </p>
          ) : null}
        </div>
        <button
          className="min-h-11 border border-foreground px-4 text-sm font-medium hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pending || completed}
          onClick={transition}
          type="button"
        >
          {pending ? "กำลังดำเนินการ" : actionCopy[action].label}
        </button>
      </div>
    </section>
  )
}
