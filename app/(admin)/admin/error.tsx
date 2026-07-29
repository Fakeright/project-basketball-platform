"use client"

import { RotateCcw } from "lucide-react"

export default function AdminDashboardError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="border-y border-destructive/40 py-10">
      <p className="text-sm font-semibold text-destructive">
        โหลดข้อมูลไม่สำเร็จ
      </p>
      <h1 className="mt-2 text-2xl font-semibold">
        ไม่สามารถแสดงภาพรวมระบบได้
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        กรุณาลองใหม่อีกครั้ง หากปัญหายังคงอยู่ให้ตรวจสอบการเชื่อมต่อฐานข้อมูล
      </p>
      <button
        className="mt-5 inline-flex min-h-10 items-center gap-2 border border-foreground px-4 text-sm font-medium hover:bg-foreground hover:text-background"
        onClick={reset}
        type="button"
      >
        <RotateCcw aria-hidden="true" size={17} />
        ลองใหม่
      </button>
    </section>
  )
}
