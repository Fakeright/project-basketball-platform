"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { ProvinceCombobox } from "@/components/province-combobox"
import {
  getSubmittableTeamCreationPlayerRows,
  TeamCreationRosterEditor,
  type TeamCreationPlayerRow,
  validateTeamCreationPlayerRows,
} from "@/components/team/team-creation-roster-editor"
import {
  playerDraftFromValues,
  type TeamPlayerField,
  type TeamPlayerFieldErrors,
} from "@/components/team/team-player-fields"
import type { ReusableTeamPlayer } from "@/features/team-management/domain/team-player-history"

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
  onTeamUpdated,
  readOnly = false,
  reusablePlayers = [],
}: {
  initialTeam: EditableTeam | null
  adminOverride?: boolean
  onTeamUpdated?: (team: EditableTeam) => void
  readOnly?: boolean
  reusablePlayers?: readonly ReusableTeamPlayer[]
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [uncertainCreate, setUncertainCreate] = useState(false)
  const [rosterFocusRequestId, setRosterFocusRequestId] = useState(0)
  const [rosterRows, setRosterRows] = useState<TeamCreationPlayerRow[]>([])
  const [version, setVersion] = useState(initialTeam?.version ?? 0)

  if (readOnly && initialTeam) {
    return (
      <section aria-label="ข้อมูลทีม" className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-court">TEAM IDENTITY</p>
          <h2 className="mt-2 text-xl font-semibold">ข้อมูลทีม</h2>
        </div>
        <dl className="grid gap-x-8 gap-y-4 border-y border-border py-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">ชื่อทีม</dt>
            <dd className="mt-1 font-medium">{initialTeam.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">จังหวัด</dt>
            <dd className="mt-1 font-medium">{initialTeam.province}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">รูปแบบทีม</dt>
            <dd className="mt-1 font-medium">
              {initialTeam.format === "FIVE_V_FIVE" ? "5v5" : "3v3"}
            </dd>
          </div>
        </dl>
      </section>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (uncertainCreate) return
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const provinceCode = String(formData.get("provinceCode") ?? "").trim()
    const format = String(formData.get("format") ?? "")
    if (name.length < 2 || provinceCode.length !== 2) {
      setMessage("กรุณากรอกชื่อทีมและจังหวัดอย่างน้อย 2 ตัวอักษร")
      return
    }

    const submittedRosterRows = initialTeam
      ? []
      : getSubmittableTeamCreationPlayerRows(rosterRows)
    if (!initialTeam) {
      const validatedRows = validateTeamCreationPlayerRows(rosterRows)
      setRosterRows(validatedRows)
      if (validatedRows.some((row) => Object.keys(row.errors).length > 0)) {
        setRosterFocusRequestId((current) => current + 1)
        setMessage("กรุณาตรวจสอบข้อมูลผู้เล่นที่ยังไม่ครบหรือซ้ำกัน")
        return
      }
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
            ...(!initialTeam
              ? {
                  players: submittedRosterRows.map((row) =>
                    playerDraftFromValues(row.values),
                  ),
                }
              : {}),
            ...(initialTeam ? { expectedVersion: version } : {}),
          }),
        },
      )
      const result = (await response.json()) as {
        message?: string
        issues?: PlayerIssue[]
        team?: EditableTeam
      }
      if (response.ok) {
        if (!initialTeam && !result.team) {
          setUncertainCreate(true)
          setMessage(
            "ระบบอาจบันทึกทีมแล้ว กรุณาตรวจสอบใน Team Dashboard ก่อนดำเนินการต่อ",
          )
          return
        }
        if (initialTeam && result.team) {
          setVersion(result.team.version)
          onTeamUpdated?.(result.team)
          router.refresh()
        } else if (!initialTeam && result.team) {
          router.push(`/team/${result.team.id}`)
          router.refresh()
          return
        }
        setMessage("บันทึกทีมแล้ว")
      } else {
        if (!initialTeam && response.status === 422 && result.issues) {
          setRosterRows((current) =>
            applyServerPlayerIssues(current, submittedRosterRows, result.issues ?? []),
          )
          setRosterFocusRequestId((current) => current + 1)
        }
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
      <fieldset className="contents" disabled={pending || uncertainCreate}>
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

        {!initialTeam ? (
          <TeamCreationRosterEditor
            disabled={pending}
            focusRequestId={rosterFocusRequestId}
            onRowsChange={setRosterRows}
            reusablePlayers={reusablePlayers}
            rows={rosterRows}
          />
        ) : null}

        {message ? (
          <div className="space-y-3 border-l-4 border-court px-3 py-2 text-sm">
            <p aria-live="polite">{message}</p>
            {uncertainCreate ? (
              <Link
                className="inline-flex min-h-10 items-center border border-foreground px-4 font-medium"
                href="/team"
              >
                ตรวจสอบ Team Dashboard
              </Link>
            ) : null}
          </div>
        ) : null}

        <div className="border-t border-border pt-5">
          <button
            className="min-h-11 border border-foreground px-5 text-sm font-medium disabled:opacity-50"
            disabled={pending || uncertainCreate}
            type="submit"
          >
            {pending ? "กำลังบันทึก" : "บันทึกทีม"}
          </button>
        </div>
      </fieldset>
    </form>
  )
}

interface PlayerIssue {
  row: number
  field: string
  message: string
}

function applyServerPlayerIssues(
  rows: readonly TeamCreationPlayerRow[],
  submittedRows: readonly TeamCreationPlayerRow[],
  issues: readonly PlayerIssue[],
) {
  const errorsByRowId = new Map<string, TeamPlayerFieldErrors>()
  for (const issue of issues) {
    const submittedRow = submittedRows[issue.row]
    if (!submittedRow || !isTeamPlayerField(issue.field)) continue
    errorsByRowId.set(submittedRow.id, {
      ...errorsByRowId.get(submittedRow.id),
      [issue.field]: issue.message,
    })
  }
  return rows.map((row) => ({
    ...row,
    errors: errorsByRowId.get(row.id) ?? {},
  }))
}

function isTeamPlayerField(field: string): field is TeamPlayerField {
  return [
    "firstName",
    "lastName",
    "birthDate",
    "nickname",
    "jerseyNumber",
    "position",
    "phone",
  ].includes(field)
}
