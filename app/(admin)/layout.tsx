import type { ReactNode } from "react"

import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8 lg:py-12"><AdminSidebar /><main className="min-w-0 flex-1">{children}</main></div>
}
