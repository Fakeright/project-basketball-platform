import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { AccountSessionControl } from "@/components/account-session-control"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) redirect("/login")

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-[0.08em]">
            COURTSIDE OPERATIONS
          </p>
          <div className="flex min-w-0 items-start justify-between gap-2 sm:items-center">
            <AccountSessionControl actor={actor} />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8 lg:py-12">
        <AdminSidebar actor={actor} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
