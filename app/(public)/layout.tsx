import { SiteHeader } from "@/components/site-header"
import { getCurrentActor } from "@/features/identity/infrastructure/get-current-actor"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const actor = await getCurrentActor()

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader actor={actor} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
