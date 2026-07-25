import { TournamentReviewQueue, type ReviewQueueItem } from "@/components/admin/tournament-review-queue"

const reviewItems: ReviewQueueItem[] = [
  { id: "review-1", title: "Bangkok Community Cup", organizerName: "Bangkok Hoops", submittedAt: "25 ก.ค. 2026" },
  { id: "review-2", title: "North Court U18", organizerName: "North Court", submittedAt: "24 ก.ค. 2026" },
  { id: "review-3", title: "Chonburi Coast League", organizerName: "Coast Basketball", submittedAt: "23 ก.ค. 2026" },
]

export default function AdminReviewsPage() {
  return <TournamentReviewQueue items={reviewItems} />
}
