/**
 * COURTSIDE: คำอธิบายไฟล์
 * แปลงวันเวลาที่กรอกตามเวลาไทยกับค่า UTC สำหรับเก็บข้อมูล เพื่อไม่ให้เวลาแข่งขันเลื่อน
 * เรียกใช้จาก: app/(admin)/organizer/tournaments/[id]/page.tsx, app/(admin)/organizer/tournaments/[id]/schedule/page.tsx
 */

const BANGKOK_OFFSET_MILLISECONDS = 7 * 60 * 60 * 1000
const DATE_TIME_LOCAL_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
const ISO_INSTANT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/

// ตีความค่าจาก datetime-local ว่าเป็นเวลาไทย แล้วแปลงเป็น UTC สำหรับบันทึก
export function bangkokDateTimeLocalToUtc(value: string): string {
  const match = DATE_TIME_LOCAL_PATTERN.exec(value)
  if (!match) throw new Error("DATE_INVALID")

  const [, yearValue, monthValue, dayValue, hourValue, minuteValue] = match
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)
  const hour = Number(hourValue)
  const minute = Number(minuteValue)
  const wallTime = new Date(0)
  wallTime.setUTCFullYear(year, month - 1, day)
  wallTime.setUTCHours(hour, minute, 0, 0)

  if (
    wallTime.getUTCFullYear() !== year ||
    wallTime.getUTCMonth() !== month - 1 ||
    wallTime.getUTCDate() !== day ||
    wallTime.getUTCHours() !== hour ||
    wallTime.getUTCMinutes() !== minute
  ) {
    throw new Error("DATE_INVALID")
  }

  return new Date(
    wallTime.getTime() - BANGKOK_OFFSET_MILLISECONDS,
  ).toISOString()
}

// แปลงเวลาที่เก็บเป็น UTC กลับเป็นข้อความวันที่/เวลาไทยสำหรับเติมในช่องกรอก
export function utcToBangkokDateTimeLocal(value: string): string {
  const instant = Date.parse(value)
  if (!Number.isFinite(instant)) throw new Error("DATE_INVALID")

  const bangkokTime = new Date(instant + BANGKOK_OFFSET_MILLISECONDS)
  return [
    padYear(bangkokTime.getUTCFullYear()),
    "-",
    padTwoDigits(bangkokTime.getUTCMonth() + 1),
    "-",
    padTwoDigits(bangkokTime.getUTCDate()),
    "T",
    padTwoDigits(bangkokTime.getUTCHours()),
    ":",
    padTwoDigits(bangkokTime.getUTCMinutes()),
  ].join("")
}

// ปรับค่าจากฟอร์มให้เป็นเวลา UTC ตามรูปแบบที่รับได้ก่อนส่งต่อ use case
export function tournamentDateTimeToUtc(value: string): string {
  if (DATE_TIME_LOCAL_PATTERN.test(value)) {
    return bangkokDateTimeLocalToUtc(value)
  }
  if (!ISO_INSTANT_PATTERN.test(value)) throw new Error("DATE_INVALID")

  const instant = Date.parse(value)
  if (!Number.isFinite(instant)) throw new Error("DATE_INVALID")
  return new Date(instant).toISOString()
}

function padTwoDigits(value: number) {
  return String(value).padStart(2, "0")
}

function padYear(value: number) {
  return String(value).padStart(4, "0")
}
