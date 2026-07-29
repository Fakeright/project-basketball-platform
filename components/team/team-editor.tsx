"use client"

import type { FormEvent } from "react"
import { useState } from "react"

import { ProvinceCombobox } from "@/components/province-combobox"

export interface EditableTeam {
  id: string
  name: string
  provinceCode: string
  province: string
}

const fieldClassName =
  "min-h-11 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"

export function TeamEditor({
  initialTeam,
  adminOverride = false,
}: {
  initialTeam: EditableTeam | null
  adminOverride?: boolean
}) {
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const provinceCode = String(formData.get("provinceCode") ?? "").trim()
    if (name.length < 2 || provinceCode.length !== 2) {
      setMessage("กรุณากรอกชื่อทีมและจังหวัดอย่างน้อย 2 ตัวอักษร")
      return
    }

    setPending(true)
    try {
      const response = await fetch(
        initialTeam ? `/api/teams/${initialTeam.id}` : "/api/teams",
        {
          method: initialTeam ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, provinceCode }),
        },
      )
      const result = (await response.json()) as { message?: string }
      setMessage(response.ok ? "บันทึกทีมแล้ว" : result.message ?? "ไม่สามารถบันทึกทีมได้")
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง")
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {adminOverride ? (
        <p className="border-l-4 border-court px-3 py-2 text-sm">
          ผู้ดูแลระบบกำลังจัดการทีมนี้ในโหมด Admin Override
        </p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>ชื่อทีม</span>
          <input
            className={fieldClassName}
            defaultValue={initialTeam?.name}
            name="name"
            required
          />
        </label>
        <ProvinceCombobox
          className="gap-2 text-sm [&>label]:text-sm"
          defaultValue={initialTeam?.provinceCode}
          id="provinceCode"
          label="จังหวัด"
          name="provinceCode"
          required
        />
      </div>

      {message ? (
        <p aria-live="polite" className="border-l-4 border-court px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      <div className="border-t border-border pt-5">
        <button
          className="min-h-11 border border-foreground px-5 text-sm font-medium disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "กำลังบันทึก" : "บันทึกทีม"}
        </button>
      </div>
    </form>
  )
}
