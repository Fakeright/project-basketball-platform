import type { ReactNode } from "react"

export function AuthFormLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <section className="w-full py-10 sm:py-16">
      <div className="grid gap-8 border-t border-border pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase text-court">{eyebrow}</p>
          <h1 className="mt-3 max-w-xl text-3xl font-semibold sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <div>
          {children}
          <div className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </div>
    </section>
  )
}
