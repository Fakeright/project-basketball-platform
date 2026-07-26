import { TeamEditor } from "@/components/team/team-editor"

export default function NewTeamPage() {
  return (
    <section>
      <header className="border-b border-border pb-5">
        <p className="text-xs font-semibold text-court">TEAM WORKSPACE</p>
        <h1 className="mt-2 text-2xl font-semibold">สร้างทีม</h1>
      </header>
      <div className="pt-8">
        <TeamEditor initialTeam={null} />
      </div>
    </section>
  )
}
