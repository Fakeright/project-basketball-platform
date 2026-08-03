"use client"

import { useState } from "react"

import {
  MAX_TOURNAMENT_CAPACITY,
  MIN_TOURNAMENT_CAPACITY,
} from "@/features/tournament-operations/domain/tournament-capacity"

const STANDARD_CAPACITIES = [6, 8, 12, 16, 24, 32] as const
const CUSTOM_CAPACITY = "CUSTOM"
const fieldClassName =
  "min-h-11 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"

export function TournamentCapacityField({
  defaultValue = 16,
}: {
  defaultValue?: number
}) {
  const isStandard = STANDARD_CAPACITIES.some(
    (capacity) => capacity === defaultValue,
  )
  const [selection, setSelection] = useState(
    isStandard ? String(defaultValue) : CUSTOM_CAPACITY,
  )
  const [customValue, setCustomValue] = useState(
    isStandard ? "" : String(defaultValue),
  )

  return (
    <div className="space-y-2 text-sm">
      <label htmlFor="capacitySelection">จำนวนทีมสูงสุด</label>
      <select
        className={fieldClassName}
        id="capacitySelection"
        onChange={(event) => setSelection(event.target.value)}
        value={selection}
      >
        {STANDARD_CAPACITIES.map((capacity) => (
          <option key={capacity} value={capacity}>
            {capacity} ทีม
          </option>
        ))}
        <option value={CUSTOM_CAPACITY}>กำหนดเอง</option>
      </select>

      {selection === CUSTOM_CAPACITY ? (
        <div className="space-y-2">
          <label htmlFor="customCapacity">ระบุจำนวนทีม</label>
          <input
            className={fieldClassName}
            id="customCapacity"
            inputMode="numeric"
            max={MAX_TOURNAMENT_CAPACITY}
            min={MIN_TOURNAMENT_CAPACITY}
            name="capacity"
            onChange={(event) => setCustomValue(event.target.value)}
            step={2}
            type="number"
            value={customValue}
          />
          <p className="text-xs text-muted-foreground">
            เลขคู่ตั้งแต่ 6 ถึง 32 ทีม
          </p>
        </div>
      ) : (
        <input name="capacity" type="hidden" value={selection} />
      )}
    </div>
  )
}
