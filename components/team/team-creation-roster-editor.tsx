"use client"

import { Plus, Trash2 } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

import { ReusablePlayerSelector } from "@/components/team/reusable-player-selector"
import {
  createBlankPlayerValues,
  isBlankPlayerValues,
  playerValuesFromDraft,
  TeamPlayerFields,
  type TeamPlayerField,
  type TeamPlayerFieldErrors,
  type TeamPlayerFormValues,
  validatePlayerValues,
} from "@/components/team/team-player-fields"
import { Button } from "@/components/ui/button"
import type { ReusableTeamPlayer } from "@/features/team-management/domain/team-player-history"

export interface TeamCreationPlayerRow {
  id: string
  sourceKey: string | null
  values: TeamPlayerFormValues
  errors: TeamPlayerFieldErrors
}

const maximumPlayerCount = 30

export function TeamCreationRosterEditor({
  disabled = false,
  focusRequestId = 0,
  onRowsChange,
  reusablePlayers,
  rows,
}: {
  disabled?: boolean
  focusRequestId?: number
  onRowsChange: (rows: TeamCreationPlayerRow[]) => void
  reusablePlayers: readonly ReusableTeamPlayer[]
  rows: readonly TeamCreationPlayerRow[]
}) {
  const idPrefix = useId()
  const nextManualRowNumber = useRef(0)
  const historicalRowIds = useRef(new Map<string, string>())
  const rosterRef = useRef<HTMLElement>(null)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const selectedKeys = useMemo(
    () => new Set(rows.flatMap((row) => (row.sourceKey ? [row.sourceKey] : []))),
    [rows],
  )
  useEffect(() => {
    if (disabled || focusRequestId <= 0) return
    const firstInvalidField = rosterRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    )
    firstInvalidField?.focus()
  }, [disabled, focusRequestId])

  function updateSelection(nextKeys: Set<string>) {
    const retainedRows = rows.filter(
      (row) => row.sourceKey === null || nextKeys.has(row.sourceKey),
    )
    const retainedKeys = new Set(
      retainedRows.flatMap((row) => (row.sourceKey ? [row.sourceKey] : [])),
    )
    const reusableByKey = new Map(reusablePlayers.map((player) => [player.key, player]))
    const addedRows: TeamCreationPlayerRow[] = []

    for (const key of nextKeys) {
      if (retainedKeys.has(key) || retainedRows.length + addedRows.length >= maximumPlayerCount) {
        continue
      }
      const reusablePlayer = reusableByKey.get(key)
      if (!reusablePlayer) continue
      let rowId = historicalRowIds.current.get(key)
      if (!rowId) {
        rowId = `${idPrefix}-history-${historicalRowIds.current.size}`
        historicalRowIds.current.set(key, rowId)
      }
      addedRows.push({
        id: rowId,
        sourceKey: key,
        values: playerValuesFromDraft(reusablePlayer.player),
        errors: {},
      })
    }

    onRowsChange([...retainedRows, ...addedRows])
  }

  function updateRow(rowId: string, field: TeamPlayerField, value: string) {
    onRowsChange(
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              values: { ...row.values, [field]: value },
              errors: { ...row.errors, [field]: undefined },
            }
          : row,
      ),
    )
  }

  function addManualRow() {
    if (rows.length >= maximumPlayerCount) return
    const rowId = `${idPrefix}-manual-${nextManualRowNumber.current}`
    nextManualRowNumber.current += 1
    onRowsChange([...rows, createManualTeamCreationPlayerRow(rowId)])
  }

  const manualRowCount = rows.filter((row) => row.sourceKey === null).length

  return (
    <section
      aria-label="รายชื่อที่จะเพิ่ม"
      className="min-w-0 border-y border-border py-6"
      ref={rosterRef}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold">รายชื่อผู้เล่น</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เพิ่มภายหลังได้ หรือเลือกจากผู้เล่นที่เคยอยู่ในทีมของบัญชีนี้
          </p>
        </div>
        <p className="text-sm font-medium">{rows.length} / {maximumPlayerCount} คน</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {reusablePlayers.length > 0 ? (
          <Button
            aria-expanded={selectorOpen}
            onClick={() => setSelectorOpen((current) => !current)}
            type="button"
            variant="outline"
          >
            {selectorOpen ? "ซ่อนผู้เล่นเดิม" : "เลือกจากผู้เล่นเดิม"}
          </Button>
        ) : null}
        <Button
          disabled={rows.length >= maximumPlayerCount}
          onClick={addManualRow}
          type="button"
          variant="outline"
        >
          <Plus aria-hidden="true" />
          เพิ่มผู้เล่นใหม่
        </Button>
      </div>

      {selectorOpen ? (
        <div className="mt-5 border-t border-border pt-5">
          <ReusablePlayerSelector
            maximumSelection={maximumPlayerCount - manualRowCount}
            onSelectionChange={updateSelection}
            players={reusablePlayers}
            selectedKeys={selectedKeys}
          />
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="mt-5 border-l-4 border-border px-3 py-2 text-sm text-muted-foreground">
          ยังไม่มีผู้เล่นในรายชื่อเริ่มต้น
        </p>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="mt-5 hidden min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.65fr)_minmax(0,0.7fr)_minmax(0,1fr)_2.5rem] gap-x-3 border-b border-border pb-2 text-xs font-medium text-muted-foreground xl:grid"
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
                aria-label={`ผู้เล่นคนที่ ${index + 1}`}
                className="relative min-w-0 pb-5 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.65fr)_minmax(0,0.7fr)_minmax(0,1fr)_2.5rem] xl:gap-x-3"
                key={row.id}
              >
                <legend className="pt-5 pr-12 font-medium xl:col-span-8 xl:pr-0">
                  ผู้เล่นคนที่ {index + 1}
                </legend>
                <Button
                  aria-label={`ลบผู้เล่นคนที่ ${index + 1}`}
                  className="absolute top-3 right-0 xl:static xl:col-start-8 xl:row-start-2"
                  onClick={() => onRowsChange(rows.filter((candidate) => candidate.id !== row.id))}
                  size="icon"
                  title={`ลบผู้เล่นคนที่ ${index + 1}`}
                  type="button"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
                <div className="mt-4 min-w-0 xl:col-span-7 xl:row-start-2 xl:mt-0">
                  <TeamPlayerFields
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
        </>
      )}
    </section>
  )
}

export function createManualTeamCreationPlayerRow(id: string): TeamCreationPlayerRow {
  return { id, sourceKey: null, values: createBlankPlayerValues(), errors: {} }
}

export function getSubmittableTeamCreationPlayerRows(
  rows: readonly TeamCreationPlayerRow[],
): TeamCreationPlayerRow[] {
  return rows.filter(
    (row) => row.sourceKey !== null || !isBlankPlayerValues(row.values),
  )
}

export function validateTeamCreationPlayerRows(
  rows: readonly TeamCreationPlayerRow[],
): TeamCreationPlayerRow[] {
  const submittedRows = getSubmittableTeamCreationPlayerRows(rows)
  const submittedIds = new Set(submittedRows.map((row) => row.id))
  const baseErrorsById = new Map(
    submittedRows.map((row) => [row.id, validatePlayerValues(row.values)]),
  )
  const identityCounts = countBy(
    submittedRows.filter((row) => hasCompleteValidIdentity(baseErrorsById.get(row.id) ?? {})),
    normalizedIdentity,
  )
  const jerseyCounts = countBy(
    submittedRows.filter((row) => validJerseyKey(row) !== null),
    (row) => validJerseyKey(row) as string,
  )

  return rows.map((row) => {
    if (!submittedIds.has(row.id)) return { ...row, errors: {} }
    const errors = { ...(baseErrorsById.get(row.id) ?? {}) }
    if (
      hasCompleteValidIdentity(errors) &&
      (identityCounts.get(normalizedIdentity(row)) ?? 0) > 1
    ) {
      errors.firstName = "ผู้เล่นคนนี้อยู่ในรายชื่อแล้ว"
    }
    const jerseyKey = validJerseyKey(row)
    if (jerseyKey && jerseyCounts.get(jerseyKey)! > 1) {
      errors.jerseyNumber = "เบอร์เสื้อนี้ถูกใช้แล้ว"
    }
    return { ...row, errors }
  })
}

function hasCompleteValidIdentity(errors: TeamPlayerFieldErrors) {
  return !errors.firstName && !errors.lastName && !errors.birthDate
}

function normalizedIdentity(row: TeamCreationPlayerRow) {
  return [
    row.values.firstName.trim().toLocaleLowerCase("th-TH"),
    row.values.lastName.trim().toLocaleLowerCase("th-TH"),
    row.values.birthDate,
  ].join("\u0000")
}

function validJerseyKey(row: TeamCreationPlayerRow) {
  const value = row.values.jerseyNumber.trim()
  if (!value) return null
  const jersey = Number(value)
  return Number.isInteger(jersey) && jersey >= 1 && jersey <= 999 ? String(jersey) : null
}

function countBy(
  rows: readonly TeamCreationPlayerRow[],
  keyForRow: (row: TeamCreationPlayerRow) => string,
) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = keyForRow(row)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}
