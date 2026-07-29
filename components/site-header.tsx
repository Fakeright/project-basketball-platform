"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"

import { AccountSessionControl } from "@/components/account-session-control"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetCloseButton,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Actor } from "@/features/identity/domain/actor"

const navigation = [
  { href: "/", label: "หน้าแรก" },
  { href: "/tournaments", label: "ทัวร์นาเมนต์" },
  { href: "/schedule", label: "ตารางแข่งขัน" },
  { href: "/bracket", label: "สายการแข่งขัน" },
]

export function SiteHeader({ actor = null }: { actor?: Actor | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <Link className="text-base font-semibold tracking-[0.08em]" href="/">
          COURTSIDE
        </Link>

        <nav aria-label="เมนูหลัก" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link
              className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 items-center gap-1">
          <div className="hidden md:block">
            {actor ? (
              <AccountSessionControl actor={actor} />
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Link className="px-2 py-2 hover:text-court" href="/login">
                  เข้าสู่ระบบ
                </Link>
                <Link
                  className="border border-foreground px-3 py-2 font-medium hover:bg-foreground hover:text-background"
                  href="/register"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
          <ThemeToggle />
          <Sheet onOpenChange={setMobileMenuOpen} open={mobileMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  aria-label="เปิดเมนูนำทาง"
                  className="md:hidden"
                  size="icon"
                  title="เปิดเมนูนำทาง"
                  variant="ghost"
                >
                  <Menu />
                </Button>
              }
            />
            <SheetContent className="w-[min(20rem,85vw)]" showCloseButton={false} side="right">
              <SheetCloseButton onClick={() => setMobileMenuOpen(false)} />
              <SheetHeader>
                <SheetTitle>เมนู</SheetTitle>
              </SheetHeader>
              <nav aria-label="เมนูหลักบนมือถือ" className="flex flex-col px-4 pb-6">
                {navigation.map((item) => (
                  <Link
                    className="flex min-h-6 items-center py-2 text-muted-foreground transition-colors hover:text-foreground"
                    href={item.href}
                    key={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mx-4 border-t border-border pt-5">
                {actor ? (
                  <AccountSessionControl
                    actor={actor}
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                ) : (
                  <div className="grid gap-2">
                    <Link
                      className="min-h-11 border border-border px-3 py-2 text-center text-sm font-medium"
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      เข้าสู่ระบบ
                    </Link>
                    <Link
                      className="min-h-11 bg-foreground px-3 py-2 text-center text-sm font-medium text-background"
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      สมัครสมาชิก
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
