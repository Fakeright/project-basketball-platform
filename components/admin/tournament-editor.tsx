"use client"

import type { FormEvent } from "react"
import { useState } from "react"

import {
  tournamentEditorSchema,
  type TournamentEditorInput,
} from "@/features/admin/presentation/tournament-editor-schema"
import {
  TournamentMediaManager,
  type TournamentMediaManagerAsset,
} from "./tournament-media-manager"

export interface EditableTournament extends TournamentEditorInput {
  id: string
  version: number
  mediaAssets?: TournamentMediaManagerAsset[]
}

const fieldClassName =
  "min-h-11 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"

export function TournamentEditor({
  initialTournament,
}: {
  initialTournament: EditableTournament | null
}) {
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const parsed = tournamentEditorSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      province: formData.get("province"),
      venue: formData.get("venue"),
      format: formData.get("format"),
      ageGroup: formData.get("ageGroup"),
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
      registrationDeadline: formData.get("registrationDeadline"),
      capacity: formData.get("capacity"),
      rules: formData.get("rules"),
      version: initialTournament?.version,
    })

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "กรุณาตรวจสอบข้อมูล")
      return
    }

    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    )?.value

    if (action === "submit" && !initialTournament) {
      setMessage("กรุณาบันทึกฉบับร่างก่อนส่งตรวจสอบ")
      return
    }

    setPending(true)
    try {
      const endpoint =
        action === "submit"
          ? `/api/admin/tournaments/${initialTournament?.id}/submit`
          : initialTournament
            ? `/api/admin/tournaments/${initialTournament.id}`
            : "/api/admin/tournaments"
      const response = await fetch(endpoint, {
        method: action === "submit" ? "POST" : initialTournament ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "submit" ? undefined : JSON.stringify(parsed.data),
      })
      const result = (await response.json()) as { message?: string }

      setMessage(
        response.ok
          ? action === "submit"
            ? "ส่งรายการให้ผู้ดูแลตรวจสอบแล้ว"
            : "บันทึกฉบับร่างแล้ว"
          : result.message ?? "ไม่สามารถดำเนินการได้",
      )
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองอีกครั้ง")
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <header className="border-b border-border pb-5">
        <p className="text-xs font-semibold text-court">TOURNAMENT EDITOR</p>
        <h1 className="mt-2 text-2xl font-semibold">
          {initialTournament ? "แก้ไขรายการแข่งขัน" : "สร้างรายการแข่งขัน"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          บันทึกฉบับร่างได้ตลอด และส่งตรวจสอบเมื่อข้อมูลครบ
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="ชื่อรายการ" name="title" defaultValue={initialTournament?.title} />
        <Field label="จังหวัด" name="province" defaultValue={initialTournament?.province} />
        <Field label="สถานที่" name="venue" defaultValue={initialTournament?.venue} />
        <Field label="รุ่นอายุ" name="ageGroup" defaultValue={initialTournament?.ageGroup} />
        <label className="space-y-2 text-sm">
          <span>ประเภทการแข่งขัน</span>
          <select
            className={fieldClassName}
            defaultValue={initialTournament?.format ?? "FIVE_V_FIVE"}
            name="format"
          >
            <option value="FIVE_V_FIVE">5v5</option>
            <option value="THREE_V_THREE">3v3</option>
          </select>
        </label>
        <Field
          defaultValue={String(initialTournament?.capacity ?? 16)}
          label="จำนวนทีมสูงสุด"
          max="64"
          min="2"
          name="capacity"
          type="number"
        />
        <Field
          defaultValue={initialTournament?.startsAt}
          label="วันเริ่มแข่งขัน"
          name="startsAt"
          type="datetime-local"
        />
        <Field
          defaultValue={initialTournament?.endsAt}
          label="วันสิ้นสุดการแข่งขัน"
          name="endsAt"
          type="datetime-local"
        />
        <Field
          defaultValue={initialTournament?.registrationDeadline}
          label="วันปิดรับสมัคร"
          name="registrationDeadline"
          type="datetime-local"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextArea
          defaultValue={initialTournament?.description}
          label="รายละเอียด"
          name="description"
        />
        <TextArea
          defaultValue={initialTournament?.rules}
          label="กติกา"
          name="rules"
        />
      </div>

      {initialTournament ? (
        <TournamentMediaManager
          assets={initialTournament.mediaAssets ?? []}
          tournamentId={initialTournament.id}
        />
      ) : (
        <section className="border-t border-border pt-8">
          <h2 className="text-xl font-semibold">สื่อและเอกสาร</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            บันทึกฉบับร่างก่อน แล้วจึงอัปโหลดโปสเตอร์และเอกสารประกอบได้
          </p>
        </section>
      )}

      {message ? (
        <p aria-live="polite" className="border-l-4 border-court px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
        <button
          className="min-h-11 border border-foreground px-5 text-sm font-medium disabled:opacity-50"
          disabled={pending}
          type="submit"
          value="save"
        >
          {pending ? "กำลังบันทึก" : "บันทึกฉบับร่าง"}
        </button>
        <button
          className="min-h-11 bg-foreground px-5 text-sm font-medium text-background disabled:opacity-50"
          disabled={pending}
          type="submit"
          value="submit"
        >
          ส่งตรวจสอบ
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  min,
  max,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  min?: string
  max?: string
}) {
  return (
    <label className="space-y-2 text-sm">
      <span>{label}</span>
      <input
        className={fieldClassName}
        defaultValue={defaultValue}
        max={max}
        min={min}
        name={name}
        type={type}
      />
    </label>
  )
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string
  name: string
  defaultValue?: string
}) {
  return (
    <label className="space-y-2 text-sm">
      <span>{label}</span>
      <textarea
        className={`${fieldClassName} min-h-32 resize-y`}
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  )
}
