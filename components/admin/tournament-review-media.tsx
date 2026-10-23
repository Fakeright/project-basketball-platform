/**
 * COURTSIDE: คำอธิบายไฟล์
 * แสดงโปสเตอร์และเอกสารที่แนบให้แอดมินตรวจ โดยเอกสารเปิดผ่าน endpoint ที่ตรวจสิทธิ์
 * เรียกใช้จาก: app/(admin)/admin/reviews/[id]/page.tsx
 * ตามการทำงานต่อ: components/tournaments/tournament-poster.tsx
 */

import { FileText, ExternalLink } from "lucide-react"

import { TournamentPoster } from "@/components/tournaments/tournament-poster"
import type { AdminReviewMedia } from "@/features/tournament-media/application/get-admin-review-media"

export function TournamentReviewMedia({
  media,
  tournamentId,
  tournamentTitle,
}: {
  media: AdminReviewMedia
  tournamentId: string
  tournamentTitle: string
}) {
  const hasMedia = Boolean(media.posterUrl || media.documents.length)

  return (
    <section aria-labelledby="review-media-heading" className="border-t border-border py-6">
      <h2 className="text-lg font-semibold" id="review-media-heading">
        โปสเตอร์และเอกสารประกอบ
      </h2>
      {!hasMedia ? (
        <p className="mt-4 text-sm text-muted-foreground">
          ยังไม่มีโปสเตอร์หรือเอกสารประกอบ
        </p>
      ) : (
        <div className="mt-4 grid gap-8 md:grid-cols-[14rem_minmax(0,1fr)]">
          <div>
            <h3 className="mb-3 text-sm font-medium">โปสเตอร์</h3>
            {media.posterUrl ? (
              <div className="max-w-56">
                <TournamentPoster
                  posterUrl={media.posterUrl}
                  tournamentTitle={tournamentTitle}
                />
                <a
                  className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium underline underline-offset-4"
                  href={media.posterUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  เปิดโปสเตอร์ขนาดเต็ม
                  <ExternalLink aria-hidden="true" size={16} />
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มีโปสเตอร์</p>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="mb-3 text-sm font-medium">เอกสาร</h3>
            {media.documents.length ? (
              <ul className="divide-y divide-border border-y border-border">
                {media.documents.map((document) => (
                  <li className="flex min-w-0 items-center gap-3 py-3" key={document.id}>
                    <FileText aria-hidden="true" className="shrink-0 text-court" size={18} />
                    <span className="min-w-0 flex-1 break-words text-sm">
                      {document.fileName}
                    </span>
                    <a
                      aria-label={`เปิด ${document.fileName}`}
                      className="inline-flex min-h-10 shrink-0 items-center gap-2 border border-foreground px-3 text-sm font-medium hover:bg-foreground hover:text-background"
                      href={`/api/admin/tournaments/${encodeURIComponent(tournamentId)}/media/${encodeURIComponent(document.id)}/open`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink aria-hidden="true" size={16} />
                      เปิด
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มีเอกสารประกอบ</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
