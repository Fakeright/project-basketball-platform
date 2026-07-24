import Image from "next/image"
import Link from "next/link"

import { TournamentSearchForm } from "@/components/tournament-search-form"
import { TournamentRow } from "@/components/tournament-row"
import { searchTournaments } from "@/features/tournaments/application/search-tournaments"
import { MockTournamentRepository } from "@/features/tournaments/infrastructure/mock-tournament-repository"

const repository = new MockTournamentRepository()

export default async function HomePage() {
  const openTournaments = await searchTournaments(repository, { status: "OPEN" })

  return (
    <div className="py-4 sm:py-8">
      <section className="grid border-y border-border lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-sm font-medium text-court">COURTSIDE / 2026</p>
          <h1 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight sm:text-3xl">
            ค้นหาทัวร์นาเมนต์บาสเกตบอลที่ใช่สำหรับทีมของคุณ
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            รวมรายการแข่งขันทั่วไทย เลือกสนาม รุ่นอายุ และรูปแบบการแข่งขันได้ในที่เดียว
          </p>
          <div className="mt-6">
            <TournamentSearchForm initialFilters={{}} />
          </div>
        </div>
        <div className="relative aspect-[16/7] overflow-hidden border-t border-border lg:aspect-auto lg:min-h-full lg:border-t-0 lg:border-l">
          <Image
            alt="สนามบาสเกตบอลในร่มพร้อมห่วงและเส้นสนามในประเทศไทย"
            className="object-cover"
            fill
            preload
            sizes="(max-width: 1023px) 100vw, 22rem"
            src="/images/courtside-hero.png"
          />
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
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
