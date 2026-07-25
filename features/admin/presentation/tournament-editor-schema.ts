import { z } from "zod"

const requiredText = (message: string) => z.string().trim().min(1, message)

export const tournamentEditorSchema = z
  .object({
    title: requiredText("กรุณาระบุชื่อรายการ"),
    description: requiredText("กรุณาระบุรายละเอียด"),
    province: requiredText("กรุณาระบุจังหวัด"),
    venue: requiredText("กรุณาระบุสถานที่"),
    format: z.enum(["FIVE_V_FIVE", "THREE_V_THREE"]),
    ageGroup: requiredText("กรุณาระบุรุ่นอายุ"),
    startsAt: requiredText("กรุณาระบุวันเริ่มแข่งขัน"),
    endsAt: requiredText("กรุณาระบุวันสิ้นสุดการแข่งขัน"),
    registrationDeadline: requiredText("กรุณาระบุวันปิดรับสมัคร"),
    capacity: z.coerce.number().int().min(2).max(64),
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
