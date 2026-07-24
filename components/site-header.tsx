"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"

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

const navigation = [
  { href: "/", label: "หน้าแรก" },
  { href: "/tournaments", label: "ทัวร์นาเมนต์" },
  { href: "/schedule", label: "ตารางแข่งขัน" },
  { href: "/bracket", label: "สายการแข่งขัน" },
]

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="text-base font-semibold tracking-[0.08em]" href="/">
          COURTSIDE
        </Link>

        <nav aria-label="เมนูหลัก" className="hidden items-center gap-1 md:flex">
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

        <div className="flex items-center gap-1">
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
