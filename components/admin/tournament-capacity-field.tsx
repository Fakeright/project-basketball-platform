/**
 * COURTSIDE: คำอธิบายไฟล์
 * ช่องเลือกจำนวนทีมตามชุดค่าที่รองรับ โดยอ่านค่าเดิมได้เมื่อแก้รายการเก่า
 * เรียกใช้จาก: components/admin/tournament-editor.tsx
 * ตามการทำงานต่อ: features/tournament-operations/domain/tournament-capacity.ts
 */

import {
  isLegacyTournamentCapacity,
  isValidTournamentCapacity,
  SUPPORTED_TOURNAMENT_CAPACITIES,
} from "@/features/tournament-operations/domain/tournament-capacity"

const fieldClassName =
  "min-h-11 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"

export function TournamentCapacityField({
  defaultValue = 16,
}: {
  defaultValue?: number
}) {
  const legacyValue =
    !isValidTournamentCapacity(defaultValue) &&
    isLegacyTournamentCapacity(defaultValue)

  return (
    <div className="space-y-2 text-sm">
      <label htmlFor="capacitySelection">จำนวนทีมสูงสุด</label>
      <select
        className={fieldClassName}
        id="capacitySelection"
        defaultValue={defaultValue}
        name="capacity"
      >
        {legacyValue ? (
          <option value={defaultValue}>{defaultValue} ทีม (รายการเดิม)</option>
        ) : null}
        {SUPPORTED_TOURNAMENT_CAPACITIES.map((capacity) => (
          <option key={capacity} value={capacity}>
            {capacity} ทีม
          </option>
        ))}
      </select>
    </div>
  )
}
