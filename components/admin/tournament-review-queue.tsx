"use client"

import Link from "next/link"
import { useState } from "react"

export interface ReviewQueueItem {
  id: string
  title: string
  organizerName: string
  submittedAt: string
  version: number
}

export function TournamentReviewQueue({ items }: { items: ReviewQueueItem[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function approve(item: ReviewQueueItem) {
    setPendingId(item.id)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/tournaments/${item.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: "APPROVED",
          note: "",
          version: item.version,
        }),
      })

      setMessage(
        response.ok
          ? "อนุมัติรายการแล้ว"
          : "ไม่สามารถอนุมัติรายการได้ กรุณาลองอีกครั้ง",
      )
    } catch {
      setMessage("ไม่สามารถอนุมัติรายการได้ กรุณาลองอีกครั้ง")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section aria-labelledby="review-queue-heading">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" id="review-queue-heading">
            คิวตรวจสอบรายการ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ตรวจข้อมูลจากผู้จัดก่อนเผยแพร่สู่สาธารณะ
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {items.length} รายการ
        </span>
      </div>
      {message ? (
        <p aria-live="polite" className="mt-4 border-l-4 border-court px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}
      {items.length ? (
        <div className="mt-4 divide-y divide-border border-y border-border">
          {items.map((item) => (
            <article
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              key={item.id}
            >
              <div>
                <h2 className="font-medium">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  โดย {item.organizerName} · ส่งเมื่อ {item.submittedAt}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  className="inline-flex min-h-9 items-center border border-foreground px-3 text-sm hover:bg-foreground hover:text-background"
                  href={`/admin/reviews/${item.id}`}
                >
                  ตรวจรายการ
                </Link>
                <button
                  className="min-h-9 border border-border px-3 text-sm hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={pendingId === item.id}
                  onClick={() => approve(item)}
                  type="button"
                >
                  {pendingId === item.id ? "กำลังอนุมัติ" : "อนุมัติ"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          ไม่มีรายการรอตรวจ
        </p>
      )}
    </section>
  )
}
