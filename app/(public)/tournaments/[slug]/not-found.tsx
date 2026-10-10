import { StatePanel } from "@/components/state-panel"

export default function TournamentNotFound() {
  return (
    <div className="py-8 sm:py-12">
      <StatePanel
        action={{
          href: "/tournaments",
          label: "ดูรายการแข่งขันทั้งหมด",
        }}
        kind="not-found"
        message="รายการนี้อาจยังไม่เผยแพร่ ถูกเก็บถาวร หรือไม่มีอยู่ในระบบ"
        title="ไม่พบรายการแข่งขัน"
      />
    </div>
  )
}
