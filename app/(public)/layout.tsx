import { SiteHeader } from "@/components/site-header"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader actor={actor} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
