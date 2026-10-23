# คู่มือโค้ด: แอดมินดูโปสเตอร์และเอกสารก่อนอนุมัติรายการ

อัปเดต 22 ตุลาคม 2569 คู่มือนี้อธิบายงานรอบนี้เป็นภาษาไทย พร้อม **โค้ดฉบับจริงครบทุกไฟล์ที่เพิ่มหรือแก้** และลิงก์คลิกไปยังบรรทัดของไฟล์นั้นได้ ไฟล์เดิมที่แก้แสดงทั้งไฟล์เพื่อให้เห็นบริบท ไม่ได้หมายความว่าทุกบรรทัดเป็นโค้ดใหม่

## หน้าที่ผู้ใช้

1. Platform Admin เปิด `/admin/reviews/[id]` ของรายการสถานะ **รอตรวจสอบ** แล้วเห็นโปสเตอร์กับเอกสารที่ผู้จัดอัปโหลดไว้ และกดเปิดภาพโปสเตอร์ขนาดเต็มได้
2. กด **เปิด** ที่เอกสาร PDF/DOC/DOCX ระบบเปิดแท็บใหม่ หาก browser ไม่รองรับการแสดงเอกสารชนิดนั้นอาจดาวน์โหลดแทน
3. ลิงก์ที่กดบนเว็บเป็น URL เดิมเสมอ ไม่ต้องต่ออายุด้วยตนเอง ทุกครั้งที่กด ระบบตรวจสิทธิ์และขอทางเข้าไฟล์ใหม่; หากออกจากระบบ ถูกถอนสิทธิ์ หรือไฟล์ถูกลบ ลิงก์จะไม่เปิดไฟล์
4. หน้าไม่มีสื่อจะแสดงข้อความชัดเจน การอนุมัติ/ปฏิเสธรายการทำงานเหมือนเดิม

## ข้อมูลวิ่งอย่างไร

หน้า [app/(admin)/admin/reviews/[id]/page.tsx:12](../app/%28admin%29/admin/reviews/%5Bid%5D/page.tsx#L12) → ตรวจ Platform Admin + สถานะ SUBMITTED → [features/tournament-media/application/get-admin-review-media.ts:17](../features/tournament-media/application/get-admin-review-media.ts#L17) → `TournamentMediaRepository.listActiveAssets` → [components/admin/tournament-review-media.tsx:6](../components/admin/tournament-review-media.tsx#L6) แสดงภาพและชื่อไฟล์

เมื่อกดเอกสาร: ลิงก์ภายในเว็บ → [app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts:7](../app/api/admin/tournaments/%5Bid%5D/media/%5BassetId%5D/open/route.ts#L7) → ตรวจ session/บทบาท → [features/tournament-media/application/get-admin-review-media.ts:38](../features/tournament-media/application/get-admin-review-media.ts#L38) → `findActiveAsset` ตรวจชนิดและเจ้าของรายการ → Supabase Storage สร้างปลายทางใหม่ → browser เปิดไฟล์

**สำคัญ:** URL ภายในเว็บเปิดเมื่อไรก็ได้ แต่ URL ของ storage ที่สร้างเบื้องหลังมีอายุสั้นเพื่อไม่ให้ไฟล์ส่วนตัวกลายเป็นลิงก์สาธารณะถาวร การตอบ 302 ตั้ง `no-store` จึงไม่ติดปลายทางเก่า เอกสารของรายการรอตรวจยังไม่ถูกเผยแพร่ในหน้าสาธารณะ

## จุดสำคัญที่ควรตอบอาจารย์

| คำถาม | กดดูโค้ด | คำตอบ |
| --- | --- | --- |
| หน้าแอดมินอยู่ไหน | [app/(admin)/admin/reviews/[id]/page.tsx:12](../app/%28admin%29/admin/reviews/%5Bid%5D/page.tsx#L12) | หน้ารายละเอียดใบส่งตรวจ |
| ตรวจสิทธิ์ก่อนอ่านสื่อตรงไหน | [app/(admin)/admin/reviews/[id]/page.tsx:16](../app/%28admin%29/admin/reviews/%5Bid%5D/page.tsx#L16) | หน้าไม่แสดงแก่คนที่ไม่ใช่แอดมิน |
| โหลดโปสเตอร์และเอกสารตรงไหน | [features/tournament-media/application/get-admin-review-media.ts:25](../features/tournament-media/application/get-admin-review-media.ts#L25) | อ่านเฉพาะ media asset ที่ยัง active |
| ป้องกันไฟล์ต่างรายการตรงไหน | [features/tournament-media/application/get-admin-review-media.ts:49](../features/tournament-media/application/get-admin-review-media.ts#L49) | ยืนยัน tournament ID และชนิด DOCUMENT |
| ลิงก์เปิดได้เรื่อย ๆ อย่างไร | [app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts:3](../app/api/admin/tournaments/%5Bid%5D/media/%5BassetId%5D/open/route.ts#L3) | สร้างปลายทางใหม่ทุกครั้งที่เปิด URL เดิม |
| ทำไมไม่ใช้ URL ที่หมดอายุบนหน้าเลย | [components/admin/tournament-review-media.tsx:54](../components/admin/tournament-review-media.tsx#L54) | หน้าจอเก็บเพียง URL ภายในเว็บ |
| ป้องกัน browser จำปลายทางเก่าตรงไหน | [app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts:31](../app/api/admin/tournaments/%5Bid%5D/media/%5BassetId%5D/open/route.ts#L31) | ไม่ cache ผลการส่งต่อ |
| ทดสอบตรงไหน | [tests/api/admin/review-document.test.ts:48](../tests/api/admin/review-document.test.ts#L48) | พิสูจน์ว่ากดลิงก์เดิมซ้ำได้ปลายทางใหม่ |

## โค้ดครบของรอบนี้

ด้านล่างเป็นไฟล์ฉบับปัจจุบันทุกไฟล์ที่เพิ่มหรือแก้ในงานนี้ กดชื่อไฟล์หรือ “จุดอ่าน” เพื่อไปยังบรรทัดจริงใน repository ได้

### หน้าตรวจรายการ

ไฟล์ [app/(admin)/admin/reviews/[id]/page.tsx](../app/%28admin%29/admin/reviews/%5Bid%5D/page.tsx#L1) บรรทัด **1–108**

```tsx
import Link from "next/link"
import { notFound } from "next/navigation"

import { TournamentReviewPanel } from "@/components/admin/tournament-review-panel"
import { TournamentReviewMedia } from "@/components/admin/tournament-review-media"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getAdminReviewMedia } from "@/features/tournament-media/application/get-admin-review-media"
import { getTournamentMediaRepository } from "@/features/tournament-media/infrastructure/get-tournament-media-repository"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

export default async function AdminReviewDetailPage({
  params,
}: PageProps<"/admin/reviews/[id]">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (actor?.role !== "PLATFORM_ADMIN") notFound()

  const { id } = await params
  const repository = await getTournamentOperationsRepository()
  const tournament = await repository.findById(id)
  if (!tournament || tournament.status !== "SUBMITTED") notFound()
  const media = await getAdminReviewMedia(tournament, actor, {
    media: await getTournamentMediaRepository(),
    storage: new SupabaseObjectStorage(),
  })

  const dateFormatter = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link
        className="text-sm underline underline-offset-4"
        href="/admin/reviews"
      >
        กลับไปคิวตรวจสอบ
      </Link>
      <header className="mt-6 border-b border-border pb-6">
        <p className="text-xs font-semibold text-court">TOURNAMENT REVIEW</p>
        <h1 className="mt-2 text-2xl font-semibold">{tournament.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ผู้จัด {tournament.organizerName ?? tournament.organizerId}
        </p>
      </header>
      <dl className="grid gap-x-8 gap-y-4 border-b border-border py-6 sm:grid-cols-2 lg:grid-cols-3">
        <ReviewFact label="ประเภท" value={formatTournament(tournament.format)} />
        <ReviewFact label="รุ่นอายุ" value={tournament.ageGroup} />
        <ReviewFact label="จำนวนทีมสูงสุด" value={`${tournament.capacity} ทีม`} />
        <ReviewFact
          label="วันปิดรับสมัคร"
          value={dateFormatter.format(new Date(tournament.registrationDeadline))}
        />
        <ReviewFact
          label="วันเริ่มแข่งขัน"
          value={dateFormatter.format(new Date(tournament.startsAt))}
        />
        <ReviewFact
          label="วันสิ้นสุดการแข่งขัน"
          value={dateFormatter.format(new Date(tournament.endsAt))}
        />
        <ReviewFact label="จังหวัด" value={tournament.province} />
        <ReviewFact label="สถานที่" value={tournament.venue} />
      </dl>
      <section className="grid gap-6 py-6 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">รายละเอียด</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {tournament.description}
          </p>
        </div>
        <div>
          <h2 className="font-semibold">กติกา</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {tournament.rules}
          </p>
        </div>
      </section>
      <TournamentReviewMedia
        media={media}
        tournamentId={tournament.id}
        tournamentTitle={tournament.title}
      />
      <TournamentReviewPanel
        tournament={{
          id: tournament.id,
          title: tournament.title,
          version: tournament.version,
        }}
      />
    </div>
  )
}

function ReviewFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  )
}

function formatTournament(format: "FIVE_V_FIVE" | "THREE_V_THREE") {
  return format === "FIVE_V_FIVE" ? "5v5" : "3v3"
}
```

หน้านี้ตรวจว่าเป็น Platform Admin และรายการยังอยู่ในสถานะ SUBMITTED ก่อนอ่านสื่อ จากนั้นส่งข้อมูลการแข่งขันกับข้อมูลสื่อให้ component แสดงผล การตัดสินอนุมัติ/ขอแก้ไข/ปฏิเสธยังใช้ `TournamentReviewPanel` เดิม

จุดอ่าน: [ตรวจบทบาทและสถานะ](../app/%28admin%29/admin/reviews/%5Bid%5D/page.tsx#L21) · [โหลดข้อมูลสื่อ](../app/%28admin%29/admin/reviews/%5Bid%5D/page.tsx#L22) · [วางสื่อก่อนปุ่มตัดสิน](../app/%28admin%29/admin/reviews/%5Bid%5D/page.tsx#L81)

### คำสั่งอ่านสื่อและเปิดเอกสาร

ไฟล์ [features/tournament-media/application/get-admin-review-media.ts](../features/tournament-media/application/get-admin-review-media.ts#L1) บรรทัด **1–65**

```ts
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"

import type { ObjectStorage } from "./ports/object-storage"
import type { TournamentMediaRepository } from "./ports/tournament-media-repository"

interface ReviewMediaDependencies {
  media: Pick<TournamentMediaRepository, "listActiveAssets" | "findActiveAsset">
  storage: Pick<ObjectStorage, "getPublicUrl" | "createSignedUrl">
}

export interface AdminReviewMedia {
  posterUrl?: string
  documents: Array<{ id: string; fileName: string; byteSize: number }>
}

export async function getAdminReviewMedia(
  tournament: Pick<TournamentOperation, "id" | "status">,
  actor: Actor,
  dependencies: ReviewMediaDependencies,
): Promise<AdminReviewMedia> {
  assertPlatformAdmin(actor)
  if (tournament.status !== "SUBMITTED") throw new Error("NOT_FOUND")

  const assets = await dependencies.media.listActiveAssets(tournament.id)
  const poster = assets.find((asset) => asset.kind === "POSTER")

  return {
    posterUrl: poster
      ? dependencies.storage.getPublicUrl(poster.bucket, poster.objectPath)
      : undefined,
    documents: assets
      .filter((asset) => asset.kind === "DOCUMENT")
      .map(({ id, fileName, byteSize }) => ({ id, fileName, byteSize })),
  }
}

export async function getAdminReviewDocumentUrl(
  tournamentId: string,
  assetId: string,
  actor: Actor,
  dependencies: ReviewMediaDependencies,
): Promise<string> {
  assertPlatformAdmin(actor)

  const document = await dependencies.media.findActiveAsset(tournamentId, assetId)
  if (
    !document ||
    document.tournamentId !== tournamentId ||
    document.kind !== "DOCUMENT"
  ) {
    throw new Error("NOT_FOUND")
  }

  // ลิงก์บนเว็บคงเดิม แต่ต่ออายุทางเข้าไฟล์เมื่อแอดมินกดทุกครั้ง
  return dependencies.storage.createSignedUrl(
    document.bucket,
    document.objectPath,
    60 * 10,
  )
}

function assertPlatformAdmin(actor: Actor) {
  if (actor.role !== "PLATFORM_ADMIN") throw new Error("FORBIDDEN")
}
```

`getAdminReviewMedia` อ่านเฉพาะไฟล์ active ของรายการที่ส่งตรวจ แล้วคืน URL โปสเตอร์และชื่อเอกสารโดยยังไม่สร้างลิงก์ตรงของเอกสาร ส่วน `getAdminReviewDocumentUrl` ตรวจสิทธิ์แอดมินและยืนยันว่าเป็น DOCUMENT ของรายการนั้นจริง ก่อนขอทางเข้าไฟล์ใหม่ทุกครั้งที่กด

จุดอ่าน: [ข้อมูลส่งให้หน้าจอ](../features/tournament-media/application/get-admin-review-media.ts#L12) · [ตรวจสิทธิ์ก่อนอ่านไฟล์](../features/tournament-media/application/get-admin-review-media.ts#L22) · [ตรวจว่าไฟล์เป็นของรายการนี้](../features/tournament-media/application/get-admin-review-media.ts#L49) · [ขอทางเข้าไฟล์ครั้งใหม่](../features/tournament-media/application/get-admin-review-media.ts#L56)

### ส่วนแสดงโปสเตอร์และเอกสาร

ไฟล์ [components/admin/tournament-review-media.tsx](../components/admin/tournament-review-media.tsx#L1) บรรทัด **1–81**

```tsx
import { FileText, ExternalLink } from "lucide-react"

import { TournamentPoster } from "@/components/tournaments/tournament-poster"
import type { AdminReviewMedia } from "@/features/tournament-media/application/get-admin-review-media"

export function TournamentReviewMedia({
  media,
  tournamentId,
  tournamentTitle,
}: {
  media: AdminReviewMedia
  tournamentId: string
  tournamentTitle: string
}) {
  const hasMedia = Boolean(media.posterUrl || media.documents.length)

  return (
    <section aria-labelledby="review-media-heading" className="border-t border-border py-6">
      <h2 className="text-lg font-semibold" id="review-media-heading">
        โปสเตอร์และเอกสารประกอบ
      </h2>
      {!hasMedia ? (
        <p className="mt-4 text-sm text-muted-foreground">
          ยังไม่มีโปสเตอร์หรือเอกสารประกอบ
        </p>
      ) : (
        <div className="mt-4 grid gap-8 md:grid-cols-[14rem_minmax(0,1fr)]">
          <div>
            <h3 className="mb-3 text-sm font-medium">โปสเตอร์</h3>
            {media.posterUrl ? (
              <div className="max-w-56">
                <TournamentPoster
                  posterUrl={media.posterUrl}
                  tournamentTitle={tournamentTitle}
                />
                <a
                  className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium underline underline-offset-4"
                  href={media.posterUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  เปิดโปสเตอร์ขนาดเต็ม
                  <ExternalLink aria-hidden="true" size={16} />
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มีโปสเตอร์</p>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="mb-3 text-sm font-medium">เอกสาร</h3>
            {media.documents.length ? (
              <ul className="divide-y divide-border border-y border-border">
                {media.documents.map((document) => (
                  <li className="flex min-w-0 items-center gap-3 py-3" key={document.id}>
                    <FileText aria-hidden="true" className="shrink-0 text-court" size={18} />
                    <span className="min-w-0 flex-1 break-words text-sm">
                      {document.fileName}
                    </span>
                    <a
                      aria-label={`เปิด ${document.fileName}`}
                      className="inline-flex min-h-10 shrink-0 items-center gap-2 border border-foreground px-3 text-sm font-medium hover:bg-foreground hover:text-background"
                      href={`/api/admin/tournaments/${encodeURIComponent(tournamentId)}/media/${encodeURIComponent(document.id)}/open`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink aria-hidden="true" size={16} />
                      เปิด
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มีเอกสารประกอบ</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
```

component นี้รับข้อมูลพร้อมแสดง ไม่อ่านฐานข้อมูลเอง ใช้ตัวแสดงโปสเตอร์เดิมพร้อมลิงก์ดูภาพเต็ม แสดงรายชื่อเอกสารเป็นแถวที่อ่านง่ายทั้งจอเล็กและจอใหญ่ และสร้างลิงก์ภายในเว็บที่คงเดิมสำหรับแต่ละไฟล์ เมื่อไม่มีไฟล์จะแสดง empty state

จุดอ่าน: [กรณีไม่มีไฟล์](../components/admin/tournament-review-media.tsx#L24) · [แสดงโปสเตอร์](../components/admin/tournament-review-media.tsx#L32) · [เปิดโปสเตอร์เต็ม](../components/admin/tournament-review-media.tsx#L42) · [ลิงก์เปิดเอกสาร](../components/admin/tournament-review-media.tsx#L63)

### เส้นทางเปิดเอกสาร

ไฟล์ [app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts](../app/api/admin/tournaments/%5Bid%5D/media/%5BassetId%5D/open/route.ts#L1) บรรทัด **1–42**

```ts
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"
import { getAdminReviewDocumentUrl } from "@/features/tournament-media/application/get-admin-review-media"
import { getTournamentMediaRepository } from "@/features/tournament-media/infrastructure/get-tournament-media-repository"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/tournaments/[id]/media/[assetId]/open">,
) {
  return withSafeRouteBoundary("tournament.media.admin_open", async () => {
    const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
    if (!actor) return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    if (actor.role !== "PLATFORM_ADMIN") {
      return Response.json({ message: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 })
    }

    const { id, assetId } = await context.params
    const media = await getTournamentMediaRepository()
    const storage = new SupabaseObjectStorage()

    try {
      const url = await getAdminReviewDocumentUrl(id, assetId, actor, {
        media,
        storage,
      })
      return new Response(null, {
        status: 302,
        headers: {
          Location: url,
          "Cache-Control": "private, no-store",
          "Referrer-Policy": "no-referrer",
        },
      })
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        return Response.json({ message: "ไม่พบเอกสาร" }, { status: 404 })
      }
      throw error
    }
  })
}
```

GET นี้รับลิงก์เดิมได้ทุกครั้ง เริ่มจากตรวจ session และบทบาทก่อนแตะไฟล์ จากนั้นให้ application ตรวจไฟล์ active และขอ URL ของ storage ครั้งใหม่ แล้วตอบ 302 โดยตั้ง `Cache-Control: private, no-store` เพื่อไม่ให้ browser จำปลายทางที่อาจหมดอายุ ไฟล์หาย/ถูกลบตอบ 404

จุดอ่าน: [ตรวจ session](../app/api/admin/tournaments/%5Bid%5D/media/%5BassetId%5D/open/route.ts#L13) · [ตรวจบทบาท](../app/api/admin/tournaments/%5Bid%5D/media/%5BassetId%5D/open/route.ts#L14) · [สร้างปลายทางใหม่](../app/api/admin/tournaments/%5Bid%5D/media/%5BassetId%5D/open/route.ts#L23) · [ไม่ cache การส่งต่อ](../app/api/admin/tournaments/%5Bid%5D/media/%5BassetId%5D/open/route.ts#L31)

### เทสต์กฎการเข้าถึงสื่อ

ไฟล์ [tests/features/tournament-media/get-admin-review-media.test.ts](../tests/features/tournament-media/get-admin-review-media.test.ts#L1) บรรทัด **1–113**

```ts
import { describe, expect, it, vi } from "vitest"

import {
  getAdminReviewDocumentUrl,
  getAdminReviewMedia,
} from "@/features/tournament-media/application/get-admin-review-media"
import { createTestActor } from "@/tests/fixtures/actor"

const admin = createTestActor("admin-1", "PLATFORM_ADMIN")
const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const poster = {
  id: "poster-1",
  tournamentId: "tournament-1",
  kind: "POSTER" as const,
  bucket: "tournament-posters",
  objectPath: "tournaments/tournament-1/poster.webp",
  fileName: "poster.webp",
  contentType: "image/webp",
  byteSize: 2_000,
  createdById: "organizer-1",
  createdAt: "2026-01-01T00:00:00Z",
  deletedAt: null,
}
const document = {
  ...poster,
  id: "document-1",
  kind: "DOCUMENT" as const,
  bucket: "tournament-documents",
  objectPath: "tournaments/tournament-1/document.pdf",
  fileName: "rules.pdf",
  contentType: "application/pdf",
  byteSize: 120_000,
}

function dependencies() {
  return {
    media: {
      listActiveAssets: vi.fn(async () => [poster, document]),
      findActiveAsset: vi.fn(async () => document),
    },
    storage: {
      getPublicUrl: vi.fn(() => "https://example.test/poster.webp"),
      createSignedUrl: vi.fn(async () => "https://example.test/document.pdf?token=fresh"),
    },
  }
}

describe("admin review media", () => {
  it("lists poster and document metadata for a submitted tournament without signing documents", async () => {
    const services = dependencies()

    const media = await getAdminReviewMedia(
      { id: "tournament-1", status: "SUBMITTED" },
      admin,
      services,
    )

    expect(media).toEqual({
      posterUrl: "https://example.test/poster.webp",
      documents: [{ id: "document-1", fileName: "rules.pdf", byteSize: 120_000 }],
    })
    expect(services.storage.createSignedUrl).not.toHaveBeenCalled()
  })

  it("refuses non-admin and non-submitted reads before querying files", async () => {
    const services = dependencies()

    await expect(getAdminReviewMedia({ id: "tournament-1", status: "SUBMITTED" }, organizer, services))
      .rejects.toThrow("FORBIDDEN")
    await expect(getAdminReviewMedia({ id: "tournament-1", status: "DRAFT" }, admin, services))
      .rejects.toThrow("NOT_FOUND")
    expect(services.media.listActiveAssets).not.toHaveBeenCalled()
  })

  it("creates a fresh destination whenever an admin opens an active document", async () => {
    const services = dependencies()

    const url = await getAdminReviewDocumentUrl("tournament-1", "document-1", admin, services)

    expect(url).toBe("https://example.test/document.pdf?token=fresh")
    expect(services.media.findActiveAsset).toHaveBeenCalledWith("tournament-1", "document-1")
    expect(services.storage.createSignedUrl).toHaveBeenCalledWith(
      "tournament-documents",
      "tournaments/tournament-1/document.pdf",
      expect.any(Number),
    )
  })

  it("does not sign retired, unrelated, or non-document assets", async () => {
    const services = dependencies()
    services.media.findActiveAsset.mockResolvedValueOnce(null)
    await expect(getAdminReviewDocumentUrl("tournament-1", "missing", admin, services))
      .rejects.toThrow("NOT_FOUND")
    services.media.findActiveAsset.mockResolvedValueOnce(poster)
    await expect(getAdminReviewDocumentUrl("tournament-1", "poster-1", admin, services))
      .rejects.toThrow("NOT_FOUND")
    services.media.findActiveAsset.mockResolvedValueOnce({
      ...document,
      tournamentId: "tournament-2",
    })
    await expect(getAdminReviewDocumentUrl("tournament-1", "document-1", admin, services))
      .rejects.toThrow("NOT_FOUND")
    expect(services.storage.createSignedUrl).not.toHaveBeenCalled()
  })

  it("rejects a non-admin before looking up the document", async () => {
    const services = dependencies()

    await expect(getAdminReviewDocumentUrl("tournament-1", "document-1", organizer, services))
      .rejects.toThrow("FORBIDDEN")
    expect(services.media.findActiveAsset).not.toHaveBeenCalled()
  })
})
```

ครอบคลุมการอ่านไฟล์รายการที่ส่งตรวจเท่านั้น การไม่ลงนามเอกสารตอนเปิดหน้า การปฏิเสธบทบาทอื่น และการไม่เปิดไฟล์ที่หาย เป็นโปสเตอร์ หรือเป็นของอีกรายการ

จุดอ่าน: [รายการที่ส่งตรวจ](../tests/features/tournament-media/get-admin-review-media.test.ts#L49) · [กันไฟล์ผิดรายการ](../tests/features/tournament-media/get-admin-review-media.test.ts#L99)

### เทสต์ URL เปิดเอกสาร

ไฟล์ [tests/api/admin/review-document.test.ts](../tests/api/admin/review-document.test.ts#L1) บรรทัด **1–88**

```ts
import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getCurrentActor: vi.fn(async () => ({ id: "admin-1", role: "PLATFORM_ADMIN" })),
  findActiveAsset: vi.fn(async () => ({
    id: "document-1",
    tournamentId: "tournament-1",
    kind: "DOCUMENT",
    bucket: "tournament-documents",
    objectPath: "tournaments/tournament-1/document.pdf",
  })),
  createSignedUrl: vi.fn(async () => "https://example.test/document.pdf?token=fresh"),
}))

vi.mock("@/features/identity/infrastructure/next-cookie-current-actor-provider", () => ({
  createNextCookieCurrentActorProvider: () => ({ getCurrentActor: mocks.getCurrentActor }),
}))
vi.mock("@/features/tournament-media/infrastructure/get-tournament-media-repository", () => ({
  getTournamentMediaRepository: async () => ({ findActiveAsset: mocks.findActiveAsset }),
}))
vi.mock("@/features/tournament-media/infrastructure/supabase-object-storage", () => ({
  SupabaseObjectStorage: class {
    createSignedUrl = mocks.createSignedUrl
  },
}))

import { GET } from "@/app/api/admin/tournaments/[id]/media/[assetId]/open/route"

function openDocument() {
  return GET(
    new Request("http://localhost/api/admin/tournaments/tournament-1/media/document-1/open"),
    { params: Promise.resolve({ id: "tournament-1", assetId: "document-1" }) },
  )
}

afterEach(() => vi.clearAllMocks())

describe("GET admin review document", () => {
  it("redirects an admin to a fresh file URL without caching the redirect", async () => {
    const response = await openDocument()

    expect(response.status).toBe(302)
    expect(response.headers.get("location")).toBe("https://example.test/document.pdf?token=fresh")
    expect(response.headers.get("cache-control")).toBe("private, no-store")
    expect(mocks.createSignedUrl).toHaveBeenCalledOnce()
  })

  it("renews the destination each time the same permanent application link is opened", async () => {
    mocks.createSignedUrl
      .mockResolvedValueOnce("https://example.test/document.pdf?token=first")
      .mockResolvedValueOnce("https://example.test/document.pdf?token=second")

    const first = await openDocument()
    const second = await openDocument()

    expect(first.headers.get("location")).toContain("token=first")
    expect(second.headers.get("location")).toContain("token=second")
    expect(mocks.createSignedUrl).toHaveBeenCalledTimes(2)
  })

  it("returns 401 without creating a file URL when logged out", async () => {
    mocks.getCurrentActor.mockResolvedValueOnce(null)

    const response = await openDocument()

    expect(response.status).toBe(401)
    expect(mocks.findActiveAsset).not.toHaveBeenCalled()
    expect(mocks.createSignedUrl).not.toHaveBeenCalled()
  })

  it("returns 403 without reading files for a non-admin", async () => {
    mocks.getCurrentActor.mockResolvedValueOnce({ id: "organizer-1", role: "TOURNAMENT_ORGANIZER" })

    const response = await openDocument()

    expect(response.status).toBe(403)
    expect(mocks.findActiveAsset).not.toHaveBeenCalled()
  })

  it("returns 404 for a missing or retired document", async () => {
    mocks.findActiveAsset.mockResolvedValueOnce(null)

    const response = await openDocument()

    expect(response.status).toBe(404)
    expect(mocks.createSignedUrl).not.toHaveBeenCalled()
  })
})
```

ครอบคลุม 302 แบบ no-store, การกดลิงก์เดิมซ้ำแล้วได้ปลายทางใหม่, 401 เมื่อยังไม่ล็อกอิน, 403 สำหรับผู้ไม่ใช่แอดมิน และ 404 เมื่อไฟล์ไม่มี

จุดอ่าน: [กดลิงก์เดิมซ้ำ](../tests/api/admin/review-document.test.ts#L48) · [กันผู้ไม่ล็อกอิน](../tests/api/admin/review-document.test.ts#L61) · [กันผู้ไม่ใช่แอดมิน](../tests/api/admin/review-document.test.ts#L71)

### เทสต์หน้าตรวจรายการ

ไฟล์ [tests/ui/admin/review-detail-page.test.tsx](../tests/ui/admin/review-detail-page.test.tsx#L1) บรรทัด **1–140**

```tsx
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import AdminLayout from "@/app/(admin)/layout"
import AdminReviewDetailPage from "@/app/(admin)/admin/reviews/[id]/page"

const mocks = vi.hoisted(() => ({
  listActiveAssets: vi.fn(async () => [
    {
      id: "poster-1",
      kind: "POSTER" as const,
      bucket: "tournament-posters",
      objectPath: "tournaments/tournament-submitted/poster.webp",
    },
    {
      id: "document-1",
      kind: "DOCUMENT" as const,
      fileName: "competition-rules.pdf",
      byteSize: 120_000,
    },
  ]),
  getPublicUrl: vi.fn(() => "https://example.test/poster.webp"),
  createSignedUrl: vi.fn(),
  getCurrentActor: vi.fn(async () => ({
    id: "admin-1",
    role: "PLATFORM_ADMIN" as const,
    email: "admin@example.com",
    displayName: "Admin",
  })),
  findById: vi.fn(async () => ({
    id: "tournament-submitted",
    title: "Submitted Court Cup",
    organizerId: "organizer-1",
    organizerName: "ผู้จัดการแข่งขัน 1",
    description: "รายละเอียดการแข่งขัน",
    rules: "กติกาการแข่งขัน",
    province: "กรุงเทพมหานคร",
    venue: "สนามกลาง",
    format: "FIVE_V_FIVE" as const,
    ageGroup: "Open",
    startsAt: "2026-11-15T02:00:00.000Z",
    endsAt: "2026-11-16T11:00:00.000Z",
    registrationDeadline: "2026-11-01T16:59:00.000Z",
    capacity: 16,
    status: "SUBMITTED" as const,
    governanceStatus: "ACTIVE" as const,
    governanceReason: null,
    governanceUpdatedAt: null,
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  })),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: () => { throw new Error("NEXT_NOT_FOUND") },
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("@/features/tournament-media/infrastructure/get-tournament-media-repository", () => ({
  getTournamentMediaRepository: async () => ({
    listActiveAssets: mocks.listActiveAssets,
  }),
}))

vi.mock("@/features/tournament-media/infrastructure/supabase-object-storage", () => ({
  SupabaseObjectStorage: class {
    getPublicUrl = mocks.getPublicUrl
    createSignedUrl = mocks.createSignedUrl
  },
}))

vi.mock(
  "@/features/identity/infrastructure/next-cookie-current-actor-provider",
  () => ({
    createNextCookieCurrentActorProvider: () => ({
      getCurrentActor: mocks.getCurrentActor,
    }),
  }),
)

vi.mock(
  "@/features/tournament-operations/infrastructure/get-tournament-operations-repository",
  () => ({
    getTournamentOperationsRepository: async () => ({
      findById: mocks.findById,
    }),
  }),
)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminReviewDetailPage", () => {
  it("shows the submitted poster and stable document link without signing on page load", async () => {
    const page = await AdminReviewDetailPage({
      params: Promise.resolve({ id: "tournament-submitted" }),
    })

    render(page)

    expect(screen.getByRole("img", { name: "โปสเตอร์การแข่งขัน Submitted Court Cup" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "เปิดโปสเตอร์ขนาดเต็ม" }).getAttribute("href"))
      .toBe("https://example.test/poster.webp")
    expect(screen.getByRole("link", { name: "เปิด competition-rules.pdf" }).getAttribute("href"))
      .toBe("/api/admin/tournaments/tournament-submitted/media/document-1/open")
    expect(mocks.createSignedUrl).not.toHaveBeenCalled()
  })

  it("shows a clear empty state when the submitted tournament has no media", async () => {
    mocks.listActiveAssets.mockResolvedValueOnce([])

    render(await AdminReviewDetailPage({ params: Promise.resolve({ id: "tournament-submitted" }) }))

    expect(screen.getByText("ยังไม่มีโปสเตอร์หรือเอกสารประกอบ")).toBeTruthy()
  })

  it("does not read media for someone who is not a platform admin", async () => {
    mocks.getCurrentActor.mockResolvedValueOnce(null)

    await expect(
      AdminReviewDetailPage({ params: Promise.resolve({ id: "tournament-submitted" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(mocks.listActiveAssets).not.toHaveBeenCalled()
  })

  it("keeps one main landmark when composed with the admin layout", async () => {
    const page = await AdminReviewDetailPage({
      params: Promise.resolve({ id: "tournament-submitted" }),
    })
    const layout = await AdminLayout({ children: page })

    render(layout)

    expect(screen.getAllByRole("main")).toHaveLength(1)
  })
})
```

ตรวจภาพโปสเตอร์ ลิงก์เอกสารภายในเว็บ empty state และยืนยันว่าคนไม่มีสิทธิ์ไม่เรียกอ่านรายการไฟล์ รวมทั้งหน้ามี main landmark เพียงหนึ่งจุด

จุดอ่าน: [เห็นภาพและลิงก์](../tests/ui/admin/review-detail-page.test.tsx#L98) · [ไม่มีไฟล์](../tests/ui/admin/review-detail-page.test.tsx#L113) · [ผู้ไม่มีสิทธิ์](../tests/ui/admin/review-detail-page.test.tsx#L121)

## โค้ดเดิมที่นำมาใช้

- [`TournamentMediaRepository`](../features/tournament-media/application/ports/tournament-media-repository.ts#L1) กำหนดสัญญาค้นหาไฟล์ active ของรายการ
- [`PrismaTournamentMediaRepository`](../features/tournament-media/infrastructure/prisma-tournament-media-repository.ts#L124) ค้นหาไฟล์โดยจับคู่ tournament ID กับ asset ID และ `deletedAt: null`
- [`SupabaseObjectStorage`](../features/tournament-media/infrastructure/supabase-object-storage.ts#L64) ขอ URL ปลายทางจาก storage
- [`TournamentPoster`](../components/tournaments/tournament-poster.tsx#L1) แสดงภาพโปสเตอร์ด้วย Next Image
- [`getPublicTournamentMedia`](../features/tournament-media/application/get-public-tournament-media.ts#L1) ยังคงซ่อนเอกสารของรายการ SUBMITTED จากหน้าสาธารณะ ไม่ได้แก้ในรอบนี้

## ผลตรวจและข้อจำกัด

- เทสต์เฉพาะงานนี้และกฎการแสดงสื่อสาธารณะผ่าน **18/18** เคส
- `npm run lint` และ `npm run build` ผ่านหลังปรับโค้ดชุดสุดท้าย
- เทสต์รวมรอบนี้รายงานเคส `external-bracket-route-import.test.ts` ล้มและค้างนานผิดปกติ จึงหยุดรอบที่ค้าง; เคส PDF เดียวกันผ่าน **1/1** เมื่อรันแยกด้วย timeout 30 วินาที ไม่ถือว่าชุดรวมผ่านทั้งหมด และไม่ได้แก้โค้ด PDF ในงานนี้
- ยังไม่ได้ทดสอบเปิดไฟล์จริงกับ Supabase ใน browser ด้วยบัญชีแอดมินในรอบนี้; เทสต์ใช้ mock storage และ repository
- โปสเตอร์อยู่ใน public bucket ตามโครงสร้างเดิม หน้าแอดมินนี้ไม่เผย URL ในหน้าสาธารณะก่อนอนุมัติ แต่ผู้ที่ทราบ URL ตรงของโปสเตอร์อาจเปิดภาพได้ เอกสารอยู่ใน private bucket และต้องผ่านเส้นทางตรวจสิทธิ์
- URL ภายในเว็บคงเดิม **ตราบเท่าที่ไฟล์ยัง active และบัญชียังมีสิทธิ์แอดมิน**; ไม่ใช่การเปิดไฟล์แบบไม่มีสิทธิ์
- ไม่มีการเปลี่ยน Prisma schema, migration หรือขั้นตอนอนุมัติรายการ
