"use client"

import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { KeyRound } from "lucide-react"

import {
  getAllowedMessage,
  getSafeRedirect,
  readAuthResponse,
} from "@/components/auth/auth-response"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const resetMessages = [
  "ข้อมูลรหัสผ่านใหม่ไม่ถูกต้อง",
  "ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว",
  "ไม่สามารถตั้งรหัสผ่านใหม่ได้ในขณะนี้",
  "ตั้งรหัสผ่านใหม่สำเร็จ",
] as const

export function ResetPasswordForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get("password") ?? "")
    const passwordConfirmation = String(
      form.get("passwordConfirmation") ?? "",
    )

    if (password !== passwordConfirmation) {
      setFeedback("รหัสผ่านทั้งสองช่องไม่ตรงกัน")
      return
    }

    setSubmitting(true)
    setFeedback("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, passwordConfirmation }),
      })
      const body = await readAuthResponse(response)
      const message = getAllowedMessage(
        body,
        resetMessages,
        "ไม่สามารถตั้งรหัสผ่านใหม่ได้ในขณะนี้",
      )
      setFeedback(message)

      if (response.ok) {
        router.push(getSafeRedirect(body, "/login"))
        router.refresh()
      }
    } catch {
      setFeedback("ไม่สามารถตั้งรหัสผ่านใหม่ได้ในขณะนี้")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="reset-password">
          รหัสผ่านใหม่
        </label>
        <Input
          autoComplete="new-password"
          className="h-11"
          id="reset-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-sm font-medium"
          htmlFor="reset-password-confirmation"
        >
          ยืนยันรหัสผ่านใหม่
        </label>
        <Input
          autoComplete="new-password"
          className="h-11"
          id="reset-password-confirmation"
          minLength={8}
          name="passwordConfirmation"
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
        <KeyRound data-icon="inline-start" />
        {submitting ? "กำลังตั้งรหัสผ่าน..." : "ตั้งรหัสผ่านใหม่"}
      </Button>
    </form>
  )
}
