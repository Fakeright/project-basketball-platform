"use client"

import { Plus, Trash2 } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import {
  createBlankPlayerValues,
  isBlankPlayerValues,
  playerDraftFromValues,
  TeamPlayerFields,
  type TeamPlayerField,
  type TeamPlayerFieldErrors,
  type TeamPlayerFormValues,
  validatePlayerValues,
} from "@/components/team/team-player-fields"
import { Button } from "@/components/ui/button"
import type { TeamPlayer } from "@/features/team-management/domain/team"

interface PlayerRow {
  id: string
  values: TeamPlayerFormValues
  errors: TeamPlayerFieldErrors
}

interface PlayerIssue {
  row: number
  field: string
  message: string
}

const initialRowCount = 5
const maximumRowCount = 30

export function TeamPlayerBatchForm({
  onPlayersAdded,
  teamId,
}: {
  onPlayersAdded: (players: TeamPlayer[]) => void
  teamId: string
}) {
  const idPrefix = useId()
  const [nextRowNumber, setNextRowNumber] = useState(initialRowCount)
  const [rows, setRows] = useState(() => createRows(initialRowCount, idPrefix, 0))
  const [pending, setPending] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [errorCycle, setErrorCycle] = useState(0)
  const summaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (errorCycle > 0) summaryRef.current?.focus()
  }, [errorCycle])

  function updateRow(rowId: string, field: TeamPlayerField, value: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? { ...row, values: { ...row.values, [field]: value }, errors: { ...row.errors, [field]: undefined } }
          : row,
      ),
    )
  }

  function showError(message: string) {
    setSummary(message)
    setErrorCycle((cycle) => cycle + 1)
  }

  async function submitPlayers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const submittedRows = rows.filter((row) => !isBlankPlayerValues(row.values))
    const errorsById = new Map(
      submittedRows.map((row) => [row.id, validatePlayerValues(row.values)]),
    )
    const hasErrors = [...errorsById.values()].some(
      (errors) => Object.keys(errors).length > 0,
    )

    setRows((current) =>
      current.map((row) => ({ ...row, errors: errorsById.get(row.id) ?? {} })),
    )
    setStatus(null)

    if (submittedRows.length === 0) {
      showError("กรุณากรอกข้อมูลผู้เล่นอย่างน้อย 1 คน")
      return
    }
    if (hasErrors) {
      showError("กรุณาตรวจสอบข้อมูลผู้เล่นที่ยังไม่ครบ")
      return
    }

    setSummary(null)
    setPending(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/players/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: submittedRows.map((row) => playerDraftFromValues(row.values)),
        }),
      })
      const result = (await response.json()) as {
        message?: string
        issues?: PlayerIssue[]
        players?: TeamPlayer[]
      }

      if (!response.ok || !result.players) {
        if (response.status === 422 && result.issues) {
          const serverErrors = new Map<string, TeamPlayerFieldErrors>()
          for (const issue of result.issues) {
            const sourceRow = submittedRows[issue.row]
            if (!sourceRow || !isPlayerField(issue.field)) continue
            serverErrors.set(sourceRow.id, {
              ...serverErrors.get(sourceRow.id),
              [issue.field]: issue.message,
            })
          }
          setRows((current) =>
            current.map((row) => ({ ...row, errors: serverErrors.get(row.id) ?? {} })),
          )
        }
        showError(result.message ?? "ไม่สามารถบันทึกผู้เล่นได้")
        return
      }

      onPlayersAdded(result.players)
      setRows(createRows(initialRowCount, idPrefix, nextRowNumber))
      setNextRowNumber((current) => current + initialRowCount)
      setStatus("บันทึกผู้เล่นแล้ว")
    } catch {
      showError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง")
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="border-y border-border py-6" onSubmit={submitPlayers}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-semibold">เพิ่มผู้เล่นหลายคน</h3>
          <p className="mt-1 text-sm text-muted-foreground">กรอกชื่อ นามสกุล และวันเกิดอย่างน้อย</p>
        </div>
        <Button
          disabled={pending || rows.length >= maximumRowCount}
          onClick={() => {
            setRows((current) => [...current, createRow(idPrefix, nextRowNumber)])
            setNextRowNumber((current) => current + 1)
          }}
          type="button"
          variant="outline"
        >
          <Plus aria-hidden="true" />
          เพิ่มแถว
        </Button>
      </div>

      {summary ? (
        <div
          aria-atomic="true"
          className="mt-5 border-l-4 border-destructive px-3 py-2 text-sm outline-none"
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
        >
          {summary}
        </div>
      ) : null}

      <div
        aria-hidden="true"
        className="mt-5 hidden min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.65fr)_minmax(0,0.7fr)_minmax(0,1fr)_2.5rem] gap-x-3 border-b border-border pb-2 text-xs font-medium text-muted-foreground xl:grid"
        data-player-column-header
      >
        <span>ชื่อ</span>
        <span>นามสกุล</span>
        <span>วันเกิด</span>
        <span>ชื่อเล่น</span>
        <span>เบอร์เสื้อ</span>
        <span>ตำแหน่ง</span>
        <span>เบอร์โทรศัพท์</span>
        <span className="text-center">คำสั่ง</span>
      </div>

      <div className="divide-y divide-border border-t border-border xl:border-t-0">
        {rows.map((row, index) => (
          <fieldset
            className="relative min-w-0 pb-5 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.65fr)_minmax(0,0.7fr)_minmax(0,1fr)_2.5rem] xl:gap-x-3"
            disabled={pending}
            key={row.id}
          >
            <legend className="pt-5 pr-12 font-medium xl:col-span-8 xl:pr-0">ผู้เล่นคนที่ {index + 1}</legend>
            <Button
              aria-label={`ลบผู้เล่นคนที่ ${index + 1}`}
              className="absolute top-3 right-0 xl:static xl:col-start-8 xl:row-start-2"
              disabled={pending || rows.length === 1}
              onClick={() => setRows((current) => current.filter((candidate) => candidate.id !== row.id))}
              size="icon"
              title={`ลบผู้เล่นคนที่ ${index + 1}`}
              type="button"
              variant="ghost"
            >
              <Trash2 aria-hidden="true" />
            </Button>
            <div className="mt-4 min-w-0 xl:col-span-7 xl:row-start-2 xl:mt-0">
              <TeamPlayerFields
                disabled={pending}
                errors={row.errors}
                hideLabelsOnDesktop
                idPrefix={row.id}
                onChange={(field, value) => updateRow(row.id, field, value)}
                values={row.values}
              />
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-5 flex min-h-10 flex-wrap items-center gap-4">
        <Button disabled={pending} type="submit">
          {pending ? "กำลังบันทึกผู้เล่น" : "บันทึกผู้เล่นทั้งหมด"}
        </Button>
        <p aria-live="polite" className="text-sm text-muted-foreground">{status}</p>
      </div>
    </form>
  )
}

function createRows(
  count: number,
  idPrefix: string,
  firstRowNumber: number,
) {
  return Array.from(
    { length: count },
    (_, index) => createRow(idPrefix, firstRowNumber + index),
  )
}

function createRow(
  idPrefix: string,
  rowNumber: number,
): PlayerRow {
  return { id: `${idPrefix}-player-${rowNumber}`, values: createBlankPlayerValues(), errors: {} }
}

function isPlayerField(field: string): field is TeamPlayerField {
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
