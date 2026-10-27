/**
 * COURTSIDE: คำอธิบายไฟล์
 * หน้า /admin/reviews: อ่านคิวรายการที่ส่งตรวจให้แอดมินเลือกพิจารณา
 * ตามการทำงานต่อ: features/identity/infrastructure/next-cookie-current-actor-provider.ts, features/tournament-operations/infrastructure/get-tournament-operations-repository.ts
 */

import { notFound } from "next/navigation"

import { TournamentReviewQueue, type ReviewQueueItem } from "@/components/admin/tournament-review-queue"
import { getCurrentActor } from "@/features/identity/infrastructure/get-current-actor"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

export default async function AdminReviewsPage() {
  const actor = await getCurrentActor()
  if (actor?.role !== "PLATFORM_ADMIN") notFound()

  const repository = await getTournamentOperationsRepository()
  const submissions = await repository.listByStatus("SUBMITTED")
  const dateFormatter = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
  })
  const reviewItems: ReviewQueueItem[] = submissions.map((tournament) => ({
    id: tournament.id,
    title: tournament.title,
    organizerName: tournament.organizerName ?? tournament.organizerId,
    submittedAt: dateFormatter.format(new Date(tournament.updatedAt)),
    version: tournament.version,
  }))

  return <TournamentReviewQueue items={reviewItems} />
}
