"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  tournamentEditorSchema,
  type TournamentEditorInput,
} from "@/features/admin/presentation/tournament-editor-schema"
import {
  TournamentMediaManager,
  type TournamentMediaManagerAsset,
} from "./tournament-media-manager"
import { TournamentCapacityField } from "./tournament-capacity-field"
import { ProvinceCombobox } from "@/components/province-combobox"
import {
  TOURNAMENT_AGE_GROUPS,
  isTournamentAgeGroup,
} from "@/features/tournament-operations/domain/tournament-age-group"

export interface EditableTournament extends TournamentEditorInput {
  id: string
  version: number
  status?: string
  province?: string
  mediaAssets?: TournamentMediaManagerAsset[]
}

const fieldClassName =
  "min-h-11 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"

export function TournamentEditor({
  initialTournament,
  readOnly = false,
}: {
  initialTournament: EditableTournament | null
  readOnly?: boolean
}) {
  const router = useRouter()
  const [tournament, setTournament] = useState(initialTournament)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const selectedAgeGroup =
    tournament?.ageGroup && isTournamentAgeGroup(tournament.ageGroup)
      ? tournament.ageGroup
      : ""

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const parsed = tournamentEditorSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      provinceCode: formData.get("provinceCode"),
      venue: formData.get("venue"),
      format: formData.get("format"),
      ageGroup: formData.get("ageGroup"),
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
      registrationDeadline: formData.get("registrationDeadline"),
      capacity: formData.get("capacity"),
      rules: formData.get("rules"),
      version: tournament?.version,
    })

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "กรุณาตรวจสอบข้อมูล")
      return
    }

    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    )?.value

    if (action === "submit" && !tournament) {
      setMessage("กรุณาบันทึกฉบับร่างก่อนส่งตรวจสอบ")
      return
    }

    setPending(true)
    try {
      const endpoint =
        action === "submit"
          ? `/api/admin/tournaments/${tournament?.id}/submit`
          : tournament
            ? `/api/admin/tournaments/${tournament.id}`
            : "/api/admin/tournaments"
      const response = await fetch(endpoint, {
        method: action === "submit" ? "POST" : tournament ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "submit" ? undefined : JSON.stringify(parsed.data),
      })
      const result = (await response.json()) as TournamentMutationResponse

      if (!response.ok) {
        setMessage(result.message ?? "ไม่สามารถดำเนินการได้")
        return
      }
      if (!hasTournamentIdentity(result.tournament)) {
        setMessage("ระบบตอบกลับข้อมูลรายการไม่ครบ กรุณาโหลดหน้าใหม่")
        return
      }

      const wasCreated = !tournament
      const nextTournament: EditableTournament = {
        ...(tournament ?? parsed.data),
        ...result.tournament,
        id: result.tournament.id,
        version: result.tournament.version,
        startsAt: String(formData.get("startsAt")),
        endsAt: String(formData.get("endsAt")),
        registrationDeadline: String(formData.get("registrationDeadline")),
        mediaAssets:
          result.tournament.mediaAssets ?? tournament?.mediaAssets ?? [],
      }
      setTournament(nextTournament)
      setMessage(
        action === "submit"
          ? "ส่งรายการให้ผู้ดูแลตรวจสอบแล้ว"
          : "บันทึกฉบับร่างแล้ว",
      )
      if (wasCreated) {
        router.replace(`/organizer/tournaments/${nextTournament.id}`)
      }
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองอีกครั้ง")
    } finally {
      setPending(false)
    }
  }

  if (readOnly && tournament) {
    return <ReadOnlyTournament tournament={tournament} />
  }

  return (
    <form className="space-y-8" noValidate onSubmit={handleSubmit}>
      <header className="border-b border-border pb-5">
        <p className="text-xs font-semibold text-court">TOURNAMENT EDITOR</p>
        <h1 className="mt-2 text-2xl font-semibold">
          {tournament ? "แก้ไขรายการแข่งขัน" : "สร้างรายการแข่งขัน"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          บันทึกฉบับร่างได้ตลอด และส่งตรวจสอบเมื่อข้อมูลครบ
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="ชื่อรายการ" name="title" defaultValue={tournament?.title} />
        <ProvinceCombobox
          defaultValue={tournament?.provinceCode}
          id="provinceCode"
          label="จังหวัด"
          name="provinceCode"
          required
        />
        <Field label="สถานที่" name="venue" defaultValue={tournament?.venue} />
        <label className="space-y-2 text-sm">
          <span>รุ่นอายุ</span>
          <select
            className={fieldClassName}
            defaultValue={selectedAgeGroup}
            name="ageGroup"
          >
            <option disabled value="">
              เลือกรุ่นอายุ
            </option>
            {TOURNAMENT_AGE_GROUPS.map((ageGroup) => (
              <option key={ageGroup} value={ageGroup}>
                {ageGroup}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span>ประเภทการแข่งขัน</span>
          <select
            className={fieldClassName}
            defaultValue={tournament?.format ?? "FIVE_V_FIVE"}
            name="format"
          >
            <option value="FIVE_V_FIVE">5v5</option>
            <option value="THREE_V_THREE">3v3</option>
          </select>
        </label>
        <TournamentCapacityField defaultValue={tournament?.capacity} />
        <Field
          defaultValue={tournament?.startsAt}
          label="วันเริ่มแข่งขัน"
          name="startsAt"
          type="datetime-local"
        />
        <Field
          defaultValue={tournament?.endsAt}
          label="วันสิ้นสุดการแข่งขัน"
          name="endsAt"
          type="datetime-local"
        />
        <Field
          defaultValue={tournament?.registrationDeadline}
          label="วันปิดรับสมัคร"
          name="registrationDeadline"
          type="datetime-local"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextArea
          defaultValue={tournament?.description}
          label="รายละเอียด"
          name="description"
        />
        <TextArea
          defaultValue={tournament?.rules}
          label="กติกา"
          name="rules"
        />
      </div>

      {tournament ? (
        <TournamentMediaManager
          assets={tournament.mediaAssets ?? []}
          tournamentId={tournament.id}
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

function ReadOnlyTournament({
  tournament,
}: {
  tournament: EditableTournament
}) {
  const facts = [
    { label: "ชื่อรายการ", value: tournament.title },
    { label: "จังหวัด", value: tournament.province ?? tournament.provinceCode },
    { label: "สถานที่", value: tournament.venue },
    { label: "รุ่นอายุ", value: tournament.ageGroup },
    {
      label: "ประเภทการแข่งขัน",
      value: tournament.format === "FIVE_V_FIVE" ? "5v5" : "3v3",
    },
    { label: "จำนวนทีมสูงสุด", value: `${tournament.capacity} ทีม` },
    { label: "วันเริ่มแข่งขัน", value: tournament.startsAt },
    { label: "วันสิ้นสุดการแข่งขัน", value: tournament.endsAt },
    { label: "วันปิดรับสมัคร", value: tournament.registrationDeadline },
  ]

  return (
    <section aria-labelledby="read-only-tournament-title">
      <header className="border-b border-border pb-5">
        <p className="text-xs font-semibold text-court">TOURNAMENT IDENTITY</p>
        <h1
          className="mt-2 break-words text-2xl font-semibold"
          id="read-only-tournament-title"
        >
          {tournament.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ข้อมูลรายการสำหรับตรวจสอบเท่านั้น
        </p>
      </header>

      <dl className="grid gap-px border-b border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((fact) => (
          <div className="min-w-0 bg-background px-3 py-4" key={fact.label}>
            <dt className="text-xs font-medium text-muted-foreground">
              {fact.label}
            </dt>
            <dd className="mt-1 break-words text-sm font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 border-b border-border py-6 md:grid-cols-2">
        <ReadOnlyText label="รายละเอียด" value={tournament.description} />
        <ReadOnlyText label="กติกา" value={tournament.rules} />
      </div>
    </section>
  )
}

function ReadOnlyText({ label, value }: { label: string; value: string }) {
  return (
    <section>
      <h2 className="text-sm font-semibold">{label}</h2>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
        {value}
      </p>
    </section>
  )
}

interface TournamentMutationResponse {
  message?: string
  tournament?: Partial<EditableTournament> & {
    id?: unknown
    version?: unknown
  }
}

function hasTournamentIdentity(
  tournament: TournamentMutationResponse["tournament"],
): tournament is Partial<EditableTournament> & {
  id: string
  version: number
} {
  return (
    typeof tournament?.id === "string" &&
    typeof tournament.version === "number"
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
