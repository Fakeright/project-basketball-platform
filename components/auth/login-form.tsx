"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { LogIn } from "lucide-react"

import {
  getAllowedMessage,
  getSafeRedirect,
  readAuthResponse,
} from "@/components/auth/auth-response"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const loginMessages = [
  "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง",
  "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "บัญชีนี้ยังไม่พร้อมใช้งาน",
  "ไม่สามารถเข้าสู่ระบบได้ในขณะนี้",
] as const

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback("")
    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          ...(nextPath ? { next: nextPath } : {}),
        }),
      })
      const body = await readAuthResponse(response)

      if (!response.ok) {
        setFeedback(
          getAllowedMessage(
            body,
            loginMessages,
            "ไม่สามารถเข้าสู่ระบบได้ในขณะนี้",
          ),
        )
        return
      }

      setFeedback("เข้าสู่ระบบสำเร็จ")
      router.push(getSafeRedirect(body, "/"))
      router.refresh()
    } catch {
      setFeedback("ไม่สามารถเข้าสู่ระบบได้ในขณะนี้")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="login-email">
          อีเมล
        </label>
        <Input
          autoComplete="email"
          className="h-11"
          id="login-email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-medium" htmlFor="login-password">
            รหัสผ่าน
          </label>
          <Link
            className="text-sm text-court hover:underline"
            href="/forgot-password"
          >
            ลืมรหัสผ่าน
          </Link>
        </div>
        <Input
          autoComplete="current-password"
          className="h-11"
          id="login-password"
          name="password"
          required
          type="password"
        />
      </div>
      <p
        aria-live="polite"
        className="min-h-6 text-sm text-muted-foreground"
        role="status"
      >
        {feedback}
      </p>
      <Button className="h-11 w-full" disabled={submitting} type="submit">
        <LogIn data-icon="inline-start" />
        {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  )
}
