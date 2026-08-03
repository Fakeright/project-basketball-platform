import { z } from "zod"

import { tournamentDateTimeToUtc } from "./tournament-editor-time"
import { assertProvinceCode } from "@/features/provinces/application/assert-province-code"
import { isValidTournamentCapacity } from "@/features/tournament-operations/domain/tournament-capacity"

const requiredText = (message: string) => z.string().trim().min(1, message)
const tournamentCapacityMessage =
  "จำนวนทีมต้องเป็นเลขคู่ตั้งแต่ 6 ถึง 32 ทีม"
const dateTime = (requiredMessage: string) =>
  requiredText(requiredMessage).transform((value, context) => {
    try {
      return tournamentDateTimeToUtc(value)
    } catch {
      context.addIssue({
        code: "custom",
        message: "กรุณาระบุวันและเวลาให้ถูกต้อง",
      })
      return z.NEVER
    }
  })

export const tournamentEditorSchema = z
  .object({
    title: requiredText("กรุณาระบุชื่อรายการ"),
    description: requiredText("กรุณาระบุรายละเอียด"),
    provinceCode: z.string().trim().refine(
      (value) => {
        try {
          assertProvinceCode(value)
          return true
        } catch {
          return false
        }
      },
      { message: "กรุณาเลือกจังหวัดจากรายการ" },
    ),
    venue: requiredText("กรุณาระบุสถานที่"),
    format: z.enum(["FIVE_V_FIVE", "THREE_V_THREE"]),
    ageGroup: requiredText("กรุณาระบุรุ่นอายุ"),
    startsAt: dateTime("กรุณาระบุวันเริ่มแข่งขัน"),
    endsAt: dateTime("กรุณาระบุวันสิ้นสุดการแข่งขัน"),
    registrationDeadline: dateTime("กรุณาระบุวันปิดรับสมัคร"),
    capacity: z.coerce
      .number({ error: tournamentCapacityMessage })
      .refine(isValidTournamentCapacity, {
        message: tournamentCapacityMessage,
      }),
    rules: requiredText("กรุณาระบุกติกา"),
    version: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((value, context) => {
    const startsAt = Date.parse(value.startsAt)
    const endsAt = Date.parse(value.endsAt)
    const deadline = Date.parse(value.registrationDeadline)

    if (Number.isFinite(startsAt) && Number.isFinite(endsAt) && endsAt <= startsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "วันสิ้นสุดต้องอยู่หลังวันเริ่มแข่งขัน",
      })
    }
    if (
      Number.isFinite(startsAt) &&
      Number.isFinite(deadline) &&
      deadline >= startsAt
    ) {
      context.addIssue({
        code: "custom",
        path: ["registrationDeadline"],
        message: "วันปิดรับสมัครต้องอยู่ก่อนวันเริ่มแข่งขัน",
      })
    }
  })

export type TournamentEditorInput = z.infer<typeof tournamentEditorSchema>
