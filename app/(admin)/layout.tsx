import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) redirect("/login")

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8 lg:py-12">
      <AdminSidebar actor={actor} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
