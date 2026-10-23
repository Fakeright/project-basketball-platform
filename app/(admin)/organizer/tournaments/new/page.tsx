/**
 * COURTSIDE: คำอธิบายไฟล์
 * หน้า /organizer/tournaments/new: เปิดฟอร์มสร้างฉบับร่างรายการแข่งขัน
 * ตามการทำงานต่อ: components/admin/tournament-editor.tsx
 */

import { TournamentEditor } from "@/components/admin/tournament-editor"

export default function NewTournamentPage() {
  return <TournamentEditor initialTournament={null} />
}
