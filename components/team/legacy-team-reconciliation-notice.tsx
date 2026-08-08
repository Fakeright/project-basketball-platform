import type { LegacyTeamReconciliationSummary } from "@/features/team-management/application/legacy-team-reconciliation"

export function LegacyTeamReconciliationNotice({
  reconciliation,
}: {
  reconciliation: LegacyTeamReconciliationSummary
}) {
  return (
    <section
      aria-labelledby="legacy-team-reconciliation-heading"
      className="mt-8 border-y border-court py-4 text-sm"
    >
      <h2 id="legacy-team-reconciliation-heading" className="font-semibold">
        ข้อมูลทีมเดิมต้องตรวจสอบ
      </h2>
      <p className="mt-2">
        สมาชิกเดิมที่ยังใช้งาน: ผู้เล่น {reconciliation.activeLegacyPlayerCount} คน,
        โค้ช {reconciliation.activeLegacyCoachCount} คน
      </p>
      <p className="mt-2 text-muted-foreground">
        สมาชิกเดิมไม่ถูกนับเป็นรายชื่อสำหรับสมัครแข่งขัน กรุณาตรวจสอบรูปแบบทีมว่าเป็น
        5v5 หรือ 3v3
        {reconciliation.activeLegacyPlayerCount > 0 ? (
          <>
            {" "}ตรวจสอบผู้เล่นเดิม {reconciliation.activeLegacyPlayerCount} คนและกรอกเป็น
            TeamPlayer จากข้อมูลที่ยืนยันได้
          </>
        ) : (
          <> และกรอกผู้เล่นที่ต้องใช้งานเป็น TeamPlayer จากข้อมูลที่ยืนยันได้</>
        )}
      </p>
    </section>
  )
}
