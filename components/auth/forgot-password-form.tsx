"use client"

import { type FormEvent, useState } from "react"
import { Mail } from "lucide-react"

import {
  getAllowedMessage,
  readAuthResponse,
} from "@/components/auth/auth-response"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const genericSuccess =
  "หากมีบัญชีอยู่ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ทางอีเมล"

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback("")
    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      })
      const body = await readAuthResponse(response)
      setFeedback(
        getAllowedMessage(
          body,
          ["กรุณากรอกอีเมลให้ถูกต้อง", genericSuccess],
          response.ok
            ? genericSuccess
            : "ไม่สามารถส่งลิงก์ได้ในขณะนี้ กรุณาลองอีกครั้ง",
        ),
      )
    } catch {
      setFeedback("ไม่สามารถส่งลิงก์ได้ในขณะนี้ กรุณาลองอีกครั้ง")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="forgot-email">
          อีเมล
        </label>
        <Input
          autoComplete="email"
          className="h-11"
          id="forgot-email"
          name="email"
          required
          type="email"
        />
      </div>
      <p
        aria-live="polite"
        className="min-h-6 text-sm leading-6 text-muted-foreground"
        role="status"
      >
        {feedback}
      </p>
      <Button className="h-11 w-full" disabled={submitting} type="submit">
        <Mail data-icon="inline-start" />
        {submitting ? "กำลังส่ง..." : "ส่งลิงก์ตั้งรหัสผ่าน"}
      </Button>
    </form>
  )
}
