/**
 * COURTSIDE: คำอธิบายไฟล์
 * หน้า /team/new: เปิดฟอร์มสร้างทีมพร้อมประวัติผู้เล่นของบัญชีที่เลือกกลับมาใช้ได้
 * ตามการทำงานต่อ: features/identity/infrastructure/next-cookie-current-actor-provider.ts, features/team-management/application/list-reusable-team-players.ts, features/team-management/infrastructure/get-team-repository.ts
 */

import { TeamEditor } from "@/components/team/team-editor"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { listReusableTeamPlayers } from "@/features/team-management/application/list-reusable-team-players"
import { getTeamRepository } from "@/features/team-management/infrastructure/get-team-repository"

export default async function NewTeamPage() {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) return null
  const reusablePlayers = await listReusableTeamPlayers(actor, {
    teams: getTeamRepository(),
  })

  return (
    <section>
      <header className="border-b border-border pb-5">
        <p className="text-xs font-semibold text-court">TEAM WORKSPACE</p>
        <h1 className="mt-2 text-2xl font-semibold">สร้างทีม</h1>
      </header>
      <div className="pt-8">
        <TeamEditor initialTeam={null} reusablePlayers={reusablePlayers} />
      </div>
    </section>
  )
}
