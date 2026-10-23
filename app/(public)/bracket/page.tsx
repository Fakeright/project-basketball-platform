/**
 * COURTSIDE: คำอธิบายไฟล์
 * หน้า /bracket: อ่านสายที่เผยแพร่ของรายการที่เลือก แล้วแสดงสายระบบหรือไฟล์ภายนอก
 * ตามการทำงานต่อ: features/tournaments/application/get-tournament-competition-by-slug.ts, features/tournaments/infrastructure/get-tournament-repository.ts, features/competition/application/get-competition-summary.ts
 */

import Link from "next/link"

import { BracketView } from "@/components/bracket-view"
import { ExternalBracketView } from "@/components/external-bracket-view"
import { CompetitionResultSummary } from "@/components/tournaments/competition-result-summary"
import { StatePanel } from "@/components/state-panel"
import { getTournamentCompetitionBySlug } from "@/features/tournaments/application/get-tournament-competition-by-slug"
import { getTournamentRepository } from "@/features/tournaments/infrastructure/get-tournament-repository"
import { getCompetitionSummary } from "@/features/competition/application/get-competition-summary"
import { getExternalBracketView } from "@/features/competition/application/get-external-bracket-view"
import { getExternalBracketRepository } from "@/features/competition/infrastructure/get-external-bracket-repository"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"

/** หน้าสาธารณะของสายที่เผยแพร่แล้ว โดยรับ slug รายการผ่าน ?tournament= */
export default async function BracketPage({ searchParams }: PageProps<"/bracket">) {
  const repository = getTournamentRepository()
  const { tournament: requestedTournament } = await searchParams
  const slug = typeof requestedTournament === "string" ? requestedTournament : undefined
  // หากไม่มี slug ให้เลือกรายการ OPEN และข้อมูลการแข่งขันในคำขอฐานข้อมูลเดียว
  const selectedTournament = slug
    ? await getTournamentCompetitionBySlug(repository, slug)
    : await repository.findFirstCompetitionByStatus("OPEN")
  const selectedSlug = selectedTournament?.slug
  const externalBracket = selectedSlug
    ? await getExternalBracketView(selectedSlug, {
        externalBrackets: getExternalBracketRepository(),
        storage: new SupabaseObjectStorage(),
      })
    : null

  return (
    <div className="py-8 sm:py-12">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-court">TOURNAMENT BRACKET</p>
        <h1 className="mt-2 text-3xl font-semibold">สายการแข่งขัน</h1>
        {selectedTournament ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{selectedTournament.title}</p>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <Link className="font-medium underline underline-offset-4" href={`/schedule?tournament=${selectedTournament.slug}`} prefetch={false}>
                ดูตารางแข่งขัน
              </Link>
              <Link className="font-medium underline underline-offset-4" href={`/results?tournament=${selectedTournament.slug}`} prefetch={false}>
                ดูผลการแข่งขัน
              </Link>
            </div>
          </>
        ) : null}
      </header>
      <section className="mt-8">
        {/* โหมดไฟล์ภายนอกแสดงเอกสาร; โหมดระบบแสดงคู่ที่สร้างและเผยแพร่ */}
        {externalBracket ? (
          <div className="space-y-10">
            <ExternalBracketView view={externalBracket} />
            {selectedTournament?.matches.length ? (
              <CompetitionResultSummary
                summary={getCompetitionSummary(selectedTournament.matches)}
              />
            ) : null}
          </div>
        ) : selectedTournament?.matches.length ? (
          <div className="space-y-10">
            <BracketView
              entries={selectedTournament.bracketEntries}
              matches={selectedTournament.matches}
              source={selectedTournament.bracketSource}
            />
            <CompetitionResultSummary
              summary={getCompetitionSummary(selectedTournament.matches)}
            />
          </div>
        ) : (
          <StatePanel
            action={{ href: "/tournaments", label: "ดูทัวร์นาเมนต์ทั้งหมด" }}
            kind="empty"
            message="ยังไม่มีสายการแข่งขันสำหรับทัวร์นาเมนต์ที่เลือก"
            title="ยังไม่มีข้อมูลการแข่งขัน"
          />
        )}
      </section>
    </div>
  )
}
