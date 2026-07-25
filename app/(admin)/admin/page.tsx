import { notFound } from "next/navigation"

import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export default async function AdminPage() {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (actor?.role !== "PLATFORM_ADMIN") notFound()

  return <AdminDashboard metrics={{ pendingReviews: 3, publishedTournaments: 8, activeTournaments: 2, registrations: 24 }} />
}
