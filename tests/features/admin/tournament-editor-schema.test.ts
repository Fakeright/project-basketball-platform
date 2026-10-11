import { describe, expect, it } from "vitest"

import { tournamentEditorSchema } from "@/features/admin/presentation/tournament-editor-schema"

const validInput = {
  title: "Capacity Cup",
  description: "การแข่งขันสำหรับทดสอบจำนวนทีม",
  provinceCode: "10",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE",
  ageGroup: "Open",
  startsAt: "2026-12-10T09:00",
  endsAt: "2026-12-11T18:00",
  registrationDeadline: "2026-12-01T23:59",
  rules: "ใช้กติกามาตรฐาน",
}

describe("tournamentEditorSchema capacity", () => {
  it.each([6, 10, 32])("accepts %i teams", (capacity) => {
    const result = tournamentEditorSchema.safeParse({
      ...validInput,
      capacity: String(capacity),
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.capacity).toBe(capacity)
  })

  it.each(["", "abc", "5", "7", "10.5", "33"])(
    "rejects %s teams",
    (capacity) => {
      const result = tournamentEditorSchema.safeParse({
        ...validInput,
        capacity,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "จำนวนทีมต้องเป็นเลขคู่ตั้งแต่ 6 ถึง 32 ทีม",
        )
      }
    },
  )
})

describe("tournamentEditorSchema age group", () => {
  it.each(["U12", "U14", "U16", "U18", "U23", "Open"])(
    "accepts %s",
    (ageGroup) => {
      const result = tournamentEditorSchema.safeParse({
        ...validInput,
        ageGroup,
        capacity: "16",
      })

      expect(result.success).toBe(true)
      if (result.success) expect(result.data.ageGroup).toBe(ageGroup)
    },
  )

  it.each(["", "U20", "35+", "open"])("rejects %s", (ageGroup) => {
    const result = tournamentEditorSchema.safeParse({
      ...validInput,
      ageGroup,
      capacity: "16",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "กรุณาเลือกรุ่นอายุจากรายการ",
      )
    }
  })
})
