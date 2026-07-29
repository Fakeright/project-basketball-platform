import Link from "next/link"
import { connection } from "next/server"

import { HomeAuthActions } from "@/components/home-auth-actions"
import { HomeHeroImage } from "@/components/home-hero-image"
import { TournamentSearchForm } from "@/components/tournament-search-form"
import { TournamentRow } from "@/components/tournament-row"
import { getCurrentActor } from "@/features/identity/infrastructure/get-current-actor"
import { searchTournaments } from "@/features/tournaments/application/search-tournaments"
import { getTournamentRepository } from "@/features/tournaments/infrastructure/get-tournament-repository"

export default async function HomePage() {
  await connection()
  const repository = getTournamentRepository()
  const [actor, openTournaments] = await Promise.all([
    getCurrentActor(),
    searchTournaments(repository, { status: "OPEN" }),
  ])

  return (
    <div className="py-1 sm:py-8">
      <section className="grid border-y border-border lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="px-5 py-3 sm:px-8 sm:py-8">
          <p className="text-sm font-medium text-court">COURTSIDE / 2026</p>
          <h1 className="mt-2 max-w-2xl text-xl font-semibold leading-tight sm:mt-3 sm:text-3xl">
            ค้นหาทัวร์นาเมนต์บาสเกตบอลที่ใช่สำหรับทีมของคุณ
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-5 text-muted-foreground sm:mt-3 sm:leading-6 sm:text-base">
            รวมรายการแข่งขันทั่วไทย เลือกสนาม รุ่นอายุ และรูปแบบการแข่งขันได้ในที่เดียว
          </p>
          <HomeAuthActions isAuthenticated={actor !== null} />
          <div className="mt-4 sm:mt-6">
            <TournamentSearchForm initialFilters={{}} />
          </div>
        </div>
        <div className="relative aspect-[16/4] overflow-hidden border-t border-border lg:aspect-auto lg:min-h-full lg:border-t-0 lg:border-l">
          <HomeHeroImage />
        </div>
      </section>

      <section className="mt-2 sm:mt-12">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-3 sm:pb-4">
          <div>
            <p className="text-sm font-medium text-court">เปิดรับสมัคร</p>
            <h2 className="mt-1 text-xl font-semibold sm:text-2xl">รายการที่สมัครได้ตอนนี้</h2>
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
