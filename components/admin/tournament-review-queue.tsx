"use client"

import Link from "next/link"

export interface ReviewQueueItem {
  id: string
  title: string
  organizerName: string
  submittedAt: string
  version: number
}

export function TournamentReviewQueue({ items }: { items: ReviewQueueItem[] }) {
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
              <Link
                className="inline-flex min-h-9 items-center border border-foreground px-3 text-sm hover:bg-foreground hover:text-background"
                href={`/admin/reviews/${item.id}`}
              >
                ตรวจรายการ
              </Link>
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
