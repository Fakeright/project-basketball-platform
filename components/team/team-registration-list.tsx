"use client"

import { useState } from "react"

export interface TeamRegistrationListItem {
  id: string
  tournamentName: string
  submittedAt: string
  status: string
  organizerNote: string | null
  version: number
}

export function TeamRegistrationList({
  registrations,
}: {
  registrations: TeamRegistrationListItem[]
}) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function cancelRegistration(registration: TeamRegistrationListItem) {
    setPendingId(registration.id)
    setFeedback(null)
    try {
      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ version: registration.version }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.message ?? "ไม่สามารถยกเลิกการสมัครได้")
      }
      setFeedback("ยกเลิกการสมัครแล้ว")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "ไม่สามารถยกเลิกการสมัครได้")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="border-t border-border pt-8">
      <p className="text-xs font-semibold text-court">REGISTRATIONS</p>
      <h2 className="mt-2 text-xl font-semibold">รายการสมัครแข่งขัน</h2>
      {registrations.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">ยังไม่มีรายการสมัครแข่งขัน</p>
      ) : (
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {registrations.map((registration) => (
            <li className="grid gap-2 py-4 text-sm sm:grid-cols-[minmax(0,1.5fr)_1fr_1fr_minmax(0,1.25fr)_auto]" key={registration.id}>
              <span className="font-medium">{registration.tournamentName}</span>
              <span>{registration.submittedAt}</span>
              <span>{registration.status}</span>
              <span>{registration.organizerNote ?? "-"}</span>
              {registration.status === "PENDING" ? (
                <button
                  aria-label={`ยกเลิกการสมัคร ${registration.tournamentName}`}
                  className="w-fit border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                  disabled={pendingId === registration.id}
                  onClick={() => cancelRegistration(registration)}
                  type="button"
                >
                  {pendingId === registration.id ? "กำลังยกเลิก" : "ยกเลิก"}
                </button>
              ) : <span aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-muted-foreground">
        {feedback}
      </p>
    </section>
  )
}
