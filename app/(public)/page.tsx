import Link from "next/link"

import { TournamentSearchForm } from "@/components/tournament-search-form"
import { TournamentRow } from "@/components/tournament-row"
import { searchTournaments } from "@/features/tournaments/application/search-tournaments"
import { MockTournamentRepository } from "@/features/tournaments/infrastructure/mock-tournament-repository"

const repository = new MockTournamentRepository()

export default async function HomePage() {
  const openTournaments = await searchTournaments(repository, { status: "OPEN" })

  return (
    <div className="py-8 sm:py-12">
      <section className="grid border-y border-border lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <p className="text-sm font-medium text-court">COURTSIDE / 2026</p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
            ค้นหาทัวร์นาเมนต์บาสเกตบอลที่ใช่สำหรับทีมของคุณ
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            รวมรายการแข่งขันทั่วไทย เลือกสนาม รุ่นอายุ และรูปแบบการแข่งขันได้ในที่เดียว
          </p>
          <div className="mt-8">
            <TournamentSearchForm initialFilters={{}} />
          </div>
        </div>
        <div className="flex min-h-52 flex-col justify-between border-t border-border bg-court px-5 py-6 text-court-foreground lg:border-t-0 lg:border-l sm:px-6">
          <p className="text-sm font-medium">ค้นหารายการแข่ง</p>
          <p className="max-w-48 text-2xl font-semibold leading-tight">ทุกสนาม ทุกช่วงวัย ทุกจังหวะเกม</p>
          <p className="text-sm">THAILAND BASKETBALL ATLAS</p>
        </div>
      </section>

      <section className="mt-10 sm:mt-14">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-sm font-medium text-court">เปิดรับสมัคร</p>
            <h2 className="mt-1 text-2xl font-semibold">รายการที่สมัครได้ตอนนี้</h2>
          </div>
          <Link className="text-sm font-medium underline underline-offset-4" href="/tournaments">
            ดูทัวร์นาเมนต์ทั้งหมด
          </Link>
        </div>
        <div>
          {openTournaments.map((tournament) => (
            <TournamentRow key={tournament.slug} tournament={tournament} />
          ))}
        </div>
      </section>
    </div>
  )
}
