"use client"

import type { FormEvent } from "react"
import { useState } from "react"

import { ProvinceCombobox } from "@/components/province-combobox"

export interface EditableTeam {
  id: string
  name: string
  provinceCode: string
  province: string
  format: "FIVE_V_FIVE" | "THREE_V_THREE"
  version: number
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
  const [version, setVersion] = useState(initialTeam?.version ?? 0)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const provinceCode = String(formData.get("provinceCode") ?? "").trim()
    const format = String(formData.get("format") ?? "")
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
          body: JSON.stringify({
            name,
            provinceCode,
            format,
            ...(initialTeam ? { expectedVersion: version } : {}),
          }),
        },
      )
      const result = (await response.json()) as {
        message?: string
        team?: { version: number }
      }
      if (response.ok) {
        if (initialTeam && result.team) setVersion(result.team.version)
        setMessage("บันทึกทีมแล้ว")
      } else {
        setMessage(
          result.message ??
            (response.status === 409
              ? "ข้อมูลทีมมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง"
              : "ไม่สามารถบันทึกทีมได้"),
        )
      }
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
        <label className="space-y-2 text-sm">
          <span>รูปแบบทีม</span>
          <select
            className={fieldClassName}
            defaultValue={initialTeam?.format ?? "FIVE_V_FIVE"}
            name="format"
            required
          >
            <option value="FIVE_V_FIVE">5v5</option>
            <option value="THREE_V_THREE">3v3</option>
          </select>
        </label>
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
