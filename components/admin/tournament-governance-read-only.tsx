import { ShieldAlert } from "lucide-react"

export function TournamentGovernanceNotice({
  reason,
}: {
  reason?: string | null
}) {
  return (
    <aside
      aria-labelledby="suspended-tournament-notice"
      className="border border-border px-4 py-4 sm:px-5"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0 text-court" size={20} />
        <div className="min-w-0">
          <p className="font-semibold" id="suspended-tournament-notice">
            รายการนี้ถูกระงับชั่วคราว
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            พื้นที่นี้เปิดอ่านอย่างเดียว และปิดคำสั่งจัดการทั้งหมดจนกว่าผู้ดูแลแพลตฟอร์มจะยกเลิกการระงับ
          </p>
          {reason ? (
            <p className="mt-2 break-words text-sm">
              <span className="font-medium">เหตุผลล่าสุด:</span> {reason}
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

export function SuspendedTournamentWorkspace({
  title,
}: {
  title: string
}) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <TournamentGovernanceNotice />
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold text-court">READ-ONLY TOURNAMENT</p>
        <h1 className="mt-2 break-words text-2xl font-semibold sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          สถานะการกำกับ: ระงับชั่วคราว
        </p>
      </header>
    </section>
  )
}
