import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  return <AdminDashboard metrics={{ pendingReviews: 3, publishedTournaments: 8, activeTournaments: 2, registrations: 24 }} />
}
