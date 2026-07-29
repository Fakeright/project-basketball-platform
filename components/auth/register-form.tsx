"use client"

import Link from "next/link"
import { type FormEvent, useState } from "react"
import { UserPlus } from "lucide-react"

import {
  getAllowedMessage,
  readAuthResponse,
} from "@/components/auth/auth-response"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const roles = [
  { value: "PLAYER", label: "ผู้เล่น" },
  { value: "COACH", label: "โค้ช" },
  { value: "TEAM_MANAGER", label: "ผู้จัดการทีม" },
  { value: "TOURNAMENT_ORGANIZER", label: "ผู้จัดการแข่งขัน" },
] as const

const registerMessages = [
  "ข้อมูลสมัครสมาชิกไม่ถูกต้อง",
  "หากสมัครได้สำเร็จ กรุณาเข้าสู่ระบบ",
  "ไม่สามารถสมัครสมาชิกได้ในขณะนี้",
] as const

export function RegisterForm() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [successful, setSuccessful] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get("password") ?? "")
    const passwordConfirmation = String(
      form.get("passwordConfirmation") ?? "",
    )

    if (password !== passwordConfirmation) {
      setSuccessful(false)
      setFeedback("รหัสผ่านทั้งสองช่องไม่ตรงกัน")
      return
    }

    setSubmitting(true)
    setFeedback("")
    setSuccessful(false)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: form.get("displayName"),
          email: form.get("email"),
          password,
          passwordConfirmation,
          role: form.get("role"),
        }),
      })
      const body = await readAuthResponse(response)
      const message = getAllowedMessage(
        body,
        registerMessages,
        response.ok
          ? "หากสมัครได้สำเร็จ กรุณาเข้าสู่ระบบ"
          : "ไม่สามารถสมัครสมาชิกได้ในขณะนี้",
      )
      setSuccessful(response.ok)
      setFeedback(message)
    } catch {
      setFeedback("ไม่สามารถสมัครสมาชิกได้ในขณะนี้")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="register-display-name">
          ชื่อที่ใช้แสดง
        </label>
        <Input
          autoComplete="name"
          className="h-11"
          id="register-display-name"
          maxLength={100}
          name="displayName"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="register-email">
          อีเมล
        </label>
        <Input
          autoComplete="email"
          className="h-11"
          id="register-email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="register-role">
          บทบาท
        </label>
        <select
          className="h-11 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          defaultValue="PLAYER"
          id="register-role"
          name="role"
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <p className="text-xs leading-5 text-muted-foreground">
          เลือกบทบาทหลักที่ตรงกับการใช้งาน บทบาทผู้ดูแลระบบไม่ได้เปิดให้สมัครเอง
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="register-password">
            รหัสผ่าน
          </label>
          <Input
            autoComplete="new-password"
            className="h-11"
            id="register-password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="register-password-confirmation"
          >
            ยืนยันรหัสผ่าน
          </label>
          <Input
            autoComplete="new-password"
            className="h-11"
            id="register-password-confirmation"
            minLength={8}
            name="passwordConfirmation"
            required
            type="password"
          />
        </div>
      </div>
      <div
        aria-live="polite"
        className="min-h-6 text-sm text-muted-foreground"
        role="status"
      >
        {feedback}
        {successful ? (
          <>
            {" "}
            <Link className="font-medium text-court hover:underline" href="/login">
              ไปหน้าเข้าสู่ระบบ
            </Link>
          </>
        ) : null}
      </div>
      <Button className="h-11 w-full" disabled={submitting} type="submit">
        <UserPlus data-icon="inline-start" />
        {submitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </Button>
    </form>
  )
}
