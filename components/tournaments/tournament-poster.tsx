/**
 * COURTSIDE: คำอธิบายไฟล์
 * แสดงโปสเตอร์รายการตามข้อมูลภาพที่ได้รับ พร้อมการจัดขนาดให้พอดีกับพื้นที่
 * เรียกใช้จาก: app/(public)/tournaments/[slug]/page.tsx, components/admin/tournament-review-media.tsx
 */

import Image from "next/image"

export function TournamentPoster({
  posterUrl,
  tournamentTitle,
}: {
  posterUrl?: string
  tournamentTitle: string
}) {
  if (!posterUrl) return null

  return (
    <figure className="relative aspect-[4/5] overflow-hidden border border-border bg-muted">
      <Image
        alt={`โปสเตอร์การแข่งขัน ${tournamentTitle}`}
        className="object-cover"
        fill
        priority
        sizes="(min-width: 1024px) 18rem, 100vw"
        src={posterUrl}
      />
    </figure>
  )
}
