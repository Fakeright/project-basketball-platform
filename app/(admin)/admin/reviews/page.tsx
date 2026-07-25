import { notFound } from "next/navigation"

import { TournamentReviewQueue, type ReviewQueueItem } from "@/components/admin/tournament-review-queue"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

const reviewItems: ReviewQueueItem[] = [
  { id: "tournament-1", title: "Bangkok Community Cup", organizerName: "Bangkok Hoops", submittedAt: "25 ก.ค. 2026", version: 1 },
  { id: "tournament-2", title: "North Court U18", organizerName: "North Court", submittedAt: "24 ก.ค. 2026", version: 1 },
  { id: "tournament-3", title: "Chonburi Coast League", organizerName: "Coast Basketball", submittedAt: "23 ก.ค. 2026", version: 1 },
]

export default async function AdminReviewsPage() {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (actor?.role !== "PLATFORM_ADMIN") notFound()

  return <TournamentReviewQueue items={reviewItems} />
}
