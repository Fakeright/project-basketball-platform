import type { ChangeEvent } from "react"

import { Input } from "@/components/ui/input"
import type {
  TeamPlayerDraft,
  TeamPlayerPosition,
} from "@/features/team-management/domain/team"

export interface TeamPlayerFormValues {
  firstName: string
  lastName: string
  birthDate: string
  nickname: string
  jerseyNumber: string
  position: TeamPlayerPosition | ""
  phone: string
}

export type TeamPlayerField = keyof TeamPlayerFormValues
export type TeamPlayerFieldErrors = Partial<Record<TeamPlayerField, string>>

const fieldClassName = "h-10 rounded-md"
const selectClassName =
  "h-10 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"

export function TeamPlayerFields({
  disabled = false,
  errors = {},
  hideLabelsOnDesktop = false,
  idPrefix,
  onChange,
  values,
}: {
  disabled?: boolean
  errors?: TeamPlayerFieldErrors
  hideLabelsOnDesktop?: boolean
  idPrefix: string
  onChange: (field: TeamPlayerField, value: string) => void
  values: TeamPlayerFormValues
}) {
  function inputProps(field: TeamPlayerField) {
    const errorId = `${idPrefix}-${field}-error`
    return {
      "aria-describedby": errors[field] ? errorId : undefined,
      "aria-invalid": Boolean(errors[field]),
      disabled,
      id: `${idPrefix}-${field}`,
      onChange: (event: ChangeEvent<HTMLInputElement>) =>
        onChange(field, event.target.value),
      value: values[field],
    }
  }

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.65fr)_minmax(0,0.7fr)_minmax(0,1fr)]">
      <PlayerInput
        error={errors.firstName}
        field="firstName"
        idPrefix={idPrefix}
        label="ชื่อ"
        labelClassName={hideLabelsOnDesktop ? "xl:sr-only" : undefined}
        props={inputProps("firstName")}
      />
      <PlayerInput
        error={errors.lastName}
        field="lastName"
        idPrefix={idPrefix}
        label="นามสกุล"
        labelClassName={hideLabelsOnDesktop ? "xl:sr-only" : undefined}
        props={inputProps("lastName")}
      />
      <PlayerInput
        error={errors.birthDate}
        field="birthDate"
        idPrefix={idPrefix}
        label="วันเกิด"
        labelClassName={hideLabelsOnDesktop ? "xl:sr-only" : undefined}
        props={{ ...inputProps("birthDate"), type: "date" }}
      />
      <PlayerInput
        error={errors.nickname}
        field="nickname"
        idPrefix={idPrefix}
        label="ชื่อเล่น"
        labelClassName={hideLabelsOnDesktop ? "xl:sr-only" : undefined}
        props={inputProps("nickname")}
      />
      <PlayerInput
        error={errors.jerseyNumber}
        field="jerseyNumber"
        idPrefix={idPrefix}
        label="เบอร์เสื้อ"
        labelClassName={hideLabelsOnDesktop ? "xl:sr-only" : undefined}
        props={{ ...inputProps("jerseyNumber"), inputMode: "numeric", min: 1, type: "number" }}
      />
      <div className="min-w-0 space-y-2 text-sm">
        <label htmlFor={`${idPrefix}-position`}>
          <span className={`block font-medium${hideLabelsOnDesktop ? " xl:sr-only" : ""}`}>ตำแหน่ง</span>
        </label>
        <select
          aria-describedby={errors.position ? `${idPrefix}-position-error` : undefined}
          aria-invalid={Boolean(errors.position)}
          className={selectClassName}
          disabled={disabled}
          id={`${idPrefix}-position`}
          onChange={(event) => onChange("position", event.target.value)}
          value={values.position}
        >
          <option value="">ไม่ระบุ</option>
          <option value="PG">PG</option>
          <option value="SG">SG</option>
          <option value="SF">SF</option>
          <option value="PF">PF</option>
          <option value="C">C</option>
        </select>
        <FieldError error={errors.position} id={`${idPrefix}-position-error`} />
      </div>
      <PlayerInput
        error={errors.phone}
        field="phone"
        idPrefix={idPrefix}
        label="เบอร์โทรศัพท์"
        labelClassName={hideLabelsOnDesktop ? "xl:sr-only" : undefined}
        props={{ ...inputProps("phone"), inputMode: "tel", type: "tel" }}
      />
    </div>
  )
}

function PlayerInput({
  error,
  field,
  idPrefix,
  label,
  labelClassName,
  props,
}: {
  error?: string
  field: TeamPlayerField
  idPrefix: string
  label: string
  labelClassName?: string
  props: React.ComponentProps<"input">
}) {
  return (
    <div className="min-w-0 space-y-2 text-sm">
      <label htmlFor={`${idPrefix}-${field}`}>
        <span className={`block font-medium${labelClassName ? ` ${labelClassName}` : ""}`}>{label}</span>
      </label>
      <Input className={fieldClassName} {...props} />
      <FieldError error={error} id={`${idPrefix}-${field}-error`} />
    </div>
  )
}

function FieldError({ error, id }: { error?: string; id: string }) {
  return error ? (
    <span className="block text-xs text-destructive" id={id}>
      {error}
    </span>
  ) : null
}

export function createBlankPlayerValues(): TeamPlayerFormValues {
  return {
    firstName: "",
    lastName: "",
    birthDate: "",
    nickname: "",
    jerseyNumber: "",
    position: "",
    phone: "",
  }
}

export function isBlankPlayerValues(values: TeamPlayerFormValues) {
  return Object.values(values).every((value) => value.trim() === "")
}

export function validatePlayerValues(values: TeamPlayerFormValues): TeamPlayerFieldErrors {
  const errors: TeamPlayerFieldErrors = {}
  const firstName = values.firstName.trim()
  const lastName = values.lastName.trim()
  const nickname = values.nickname.trim()
  const phone = values.phone.trim()
  if (!firstName) errors.firstName = "กรุณาระบุชื่อผู้เล่น"
  else if (firstName.length > 80) errors.firstName = "ชื่อต้องไม่เกิน 80 ตัวอักษร"
  if (!lastName) errors.lastName = "กรุณาระบุนามสกุลผู้เล่น"
  else if (lastName.length > 80) errors.lastName = "นามสกุลต้องไม่เกิน 80 ตัวอักษร"
  if (!values.birthDate) errors.birthDate = "กรุณาระบุวันเกิดผู้เล่น"
  else if (!isIsoCalendarDate(values.birthDate)) errors.birthDate = "วันเกิดไม่ถูกต้อง"
  else if (values.birthDate > new Date().toISOString().slice(0, 10)) {
    errors.birthDate = "วันเกิดต้องไม่เป็นวันที่ในอนาคต"
  }
  if (nickname.length > 40) errors.nickname = "ชื่อเล่นต้องไม่เกิน 40 ตัวอักษร"
  if (phone.length > 30) errors.phone = "เบอร์โทรศัพท์ต้องไม่เกิน 30 ตัวอักษร"

  const jerseyNumber = Number(values.jerseyNumber)
  if (
    values.jerseyNumber !== "" &&
    (!Number.isInteger(jerseyNumber) || jerseyNumber < 1 || jerseyNumber > 999)
  ) {
    errors.jerseyNumber = "เบอร์เสื้อต้องเป็นจำนวนเต็มระหว่าง 1 ถึง 999"
  }

  return errors
}

function isIsoCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function playerDraftFromValues(values: TeamPlayerFormValues): TeamPlayerDraft {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    birthDate: values.birthDate,
    nickname: values.nickname.trim() || null,
    jerseyNumber: values.jerseyNumber === "" ? null : Number(values.jerseyNumber),
    position: values.position || null,
    phone: values.phone.trim() || null,
  }
}

export function playerValuesFromDraft(player: TeamPlayerDraft): TeamPlayerFormValues {
  return {
    firstName: player.firstName,
    lastName: player.lastName,
    birthDate: player.birthDate,
    nickname: player.nickname ?? "",
    jerseyNumber: player.jerseyNumber?.toString() ?? "",
    position: player.position ?? "",
    phone: player.phone ?? "",
  }
}
