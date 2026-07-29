"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Actor, Role } from "@/features/identity/domain/actor"

const accountDestination: Record<
  Role,
  { href: string; label: string; roleLabel: string }
> = {
  PLAYER: {
    href: "/tournaments",
    label: "ค้นหารายการแข่งขัน",
    roleLabel: "ผู้เล่น",
  },
  COACH: {
    href: "/tournaments",
    label: "ค้นหารายการแข่งขัน",
    roleLabel: "โค้ช",
  },
  TEAM_MANAGER: {
    href: "/team",
    label: "จัดการทีม",
    roleLabel: "ผู้จัดการทีม",
  },
  TOURNAMENT_ORGANIZER: {
    href: "/organizer",
    label: "จัดการรายการ",
    roleLabel: "ผู้จัดการแข่งขัน",
  },
  PLATFORM_ADMIN: {
    href: "/admin",
    label: "จัดการแพลตฟอร์ม",
    roleLabel: "ผู้ดูแลแพลตฟอร์ม",
  },
}

export function AccountSessionControl({
  actor,
  onNavigate,
}: {
  actor: Actor
  onNavigate?: () => void
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState("")
  const destination = accountDestination[actor.role]

  async function logout() {
    setSubmitting(true)
    setFeedback("")

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (!response.ok) {
        setFeedback("ไม่สามารถออกจากระบบได้ในขณะนี้")
        return
      }

      onNavigate?.()
      router.push("/")
      router.refresh()
    } catch {
      setFeedback("ไม่สามารถออกจากระบบได้ในขณะนี้")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center">
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold">{actor.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{actor.email}</p>
        <p className="mt-1 text-xs font-medium text-court">
          กำลังใช้งาน: {destination.roleLabel}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          className="inline-flex min-h-9 items-center border-b border-foreground text-sm font-medium hover:text-court"
          href={destination.href}
          onClick={onNavigate}
        >
          {destination.label}
        </Link>
        <Button
          aria-label="ออกจากระบบ"
          disabled={submitting}
          onClick={logout}
          size="icon"
          title="ออกจากระบบ"
          type="button"
          variant="ghost"
        >
          <LogOut />
        </Button>
      </div>
      <p aria-live="polite" className="text-xs text-destructive" role="status">
        {feedback}
      </p>
    </div>
  )
}
