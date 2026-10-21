# คู่มือโค้ด: แอดมินดูทีมทั้งหมดและรายชื่อสมาชิก

อัปเดต 21 ตุลาคม 2569 เอกสารนี้รวม **โค้ดฉบับปัจจุบันของทุกไฟล์ที่เพิ่มหรือแก้ในรอบนี้** เพื่อใช้เปิดอธิบายโปรเจกต์ โค้ดที่เป็นไฟล์เดิมจะแสดงทั้งไฟล์เพื่อให้เห็นบริบท; งานอื่นที่ค้างอยู่ใน worktree ไม่รวมอยู่ในเอกสารนี้ เลขบรรทัดอ้างอิงจากไฟล์จริงหลังแก้เสร็จ

## หน้าที่ผู้ใช้

1. Platform Admin เปิดเมนู **ทีมทั้งหมด** ที่ `/admin/teams` เห็นชื่อทีม ชื่อผู้สร้าง จังหวัด รูปแบบ จำนวนผู้เล่น active และสถานะทีม (รวมทีมปิดใช้งาน)
2. กดทีมหนึ่งทีมไป `/admin/teams/[id]` เห็นผู้สร้างและสมาชิก active ทุกคน พร้อมชื่อ-นามสกุล ชื่อเล่น เบอร์เสื้อ ตำแหน่ง และวันเกิด
3. หน้านี้อ่านอย่างเดียว ไม่เพิ่ม/แก้/ลบทีม; ไม่แสดงเบอร์โทรหรืออีเมล ทีมที่ไม่มีอยู่และผู้ใช้ที่ไม่ใช่แอดมินไม่เห็นข้อมูล

## ข้อมูลวิ่งอย่างไร

`AdminSidebar` → หน้า `/admin/teams` หรือ `/admin/teams/[id]` → `listAdminTeams` / `getAdminTeamDetail` ตรวจ role + permission → `AdminTeamReadRepository` → Prisma `Team`, `User` (owner), `Province`, `TeamPlayer` → กลับมาเป็นข้อมูลที่หน้าจอแสดงได้

ระบบใช้ `Team.owner.displayName` เป็นชื่อผู้สร้าง/ผู้จัดการ-โค้ช และแสดง **roster ปัจจุบัน** ไม่ใช่สำเนารายชื่อวันสมัคร ทีม inactive ยังอยู่ในสารบบ แต่ผู้เล่นที่ inactive จะไม่อยู่ในรายละเอียด ไม่มี schema migration หรือ API mutation ใหม่

## จุดสำคัญที่ควรตอบอาจารย์

| คำถาม | เปิดไฟล์และบรรทัด | คำตอบ |
| --- | --- | --- |
| เมนูแอดมินอยู่ไหน | `components/admin/admin-sidebar.tsx:33` | ลิงก์อยู่ใต้เงื่อนไข `isPlatformAdmin` |
| ตรวจสิทธิ์จริงตรงไหน | `features/team-management/application/read-admin-teams.ts:29` | use case ตรวจ role ก่อนอ่านฐานข้อมูล; UI ซ่อนเมนูอย่างเดียวไม่ใช่ความปลอดภัย |
| อ่านทีมทั้งหมดตรงไหน | `features/team-management/infrastructure/prisma-admin-team-read-repository.ts:12` | Prisma อ่านทุกทีมและนับเฉพาะผู้เล่น active |
| อ่านสมาชิกทีมตรงไหน | `features/team-management/infrastructure/prisma-admin-team-read-repository.ts:33` | Query เจาะทีมเดียว เลือกฟิลด์ผู้เล่นตามที่ตกลง |
| หน้า list อยู่ไหน | `app/(admin)/admin/teams/page.tsx:8` | แสดงแถวทีมกับผู้สร้างและลิงก์รายละเอียด |
| หน้า detail อยู่ไหน | `app/(admin)/admin/teams/[id]/page.tsx:8` | แสดง roster แบบอ่านอย่างเดียว |

## โค้ดครบของรอบนี้

### สิทธิ์ team.read

ไฟล์ `features/identity/domain/permission.ts` บรรทัด **1–65**: เพิ่ม action `team.read` ให้ชุดสิทธิ์กลาง โดย Platform Admin ได้สิทธิ์นี้ผ่านชุด `permissions` ส่วนบทบาทอื่นไม่ถูกเพิ่มสิทธิ์ดังกล่าว

จุดอ่าน: `20`

```ts
import type { Role } from "@/features/identity/domain/actor";

export const permissions = [
  "tournament.create",
  "tournament.read",
  "tournament.update",
  "tournament.submit",
  "tournament.review",
  "tournament.publish",
  "tournament.start",
  "tournament.complete",
  "tournament.suspend",
  "tournament.archive",
  "tournament.remove",
  "tournament.registration.reopen",
  "registration.create",
  "registration.read",
  "registration.decide",
  "team.create",
  "team.read",
  "team.update",
  "team.roster.manage",
  "registration.cancel",
  "registration.withdraw",
  "bracket.generate",
  "match.schedule",
  "result.record",
  "result.confirm",
  "result.correct",
  "audit.read",
  "role.manage",
] as const;

export type Permission = (typeof permissions)[number];

const organizerPermissions = [
  "tournament.create",
  "tournament.read",
  "tournament.update",
  "tournament.submit",
  "tournament.publish",
  "tournament.start",
  "tournament.complete",
  "registration.decide",
  "registration.withdraw",
  "bracket.generate",
  "match.schedule",
  "result.record",
  "result.confirm",
] as const satisfies readonly Permission[];

export const permissionsByRole: Readonly<Record<Role, ReadonlySet<Permission>>> =
  {
    PLATFORM_ADMIN: new Set(permissions),
    TOURNAMENT_ORGANIZER: new Set(organizerPermissions),
    TEAM_MANAGER_COACH: new Set([
      "team.create",
      "team.update",
      "team.roster.manage",
      "registration.create",
      "registration.read",
      "registration.cancel",
    ]),
    PLAYER: new Set(),
  };
```

### เมนูทีมทั้งหมด

ไฟล์ `components/admin/admin-sidebar.tsx` บรรทัด **1–51**: แสดงลิงก์ `/admin/teams` เฉพาะเมื่อบทบาทเป็น Platform Admin; เมนูทีมของฉันยังคงแยกสำหรับเจ้าของทีม

จุดอ่าน: `33`

```tsx
import Link from "next/link"

import type { Actor } from "@/features/identity/domain/actor"

const navigationClassName =
  "block min-h-9 whitespace-nowrap py-2 text-sm hover:text-court"

export function AdminSidebar({ actor }: { actor: Actor }) {
  const isPlatformAdmin = actor.role === "PLATFORM_ADMIN"
  const isTeamManager = actor.role === "TEAM_MANAGER_COACH"
  const isOrganizer = actor.role === "TOURNAMENT_ORGANIZER"

  return (
    <aside className="border-b border-border pb-4 lg:w-56 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
      <p className="text-sm font-semibold tracking-[0.08em]">
        COURTSIDE ADMIN
      </p>
      <nav
        aria-label="เมนูผู้ดูแล"
        className="mt-4 flex gap-4 overflow-x-auto lg:block lg:space-y-2"
      >
        {isPlatformAdmin ? (
          <>
            <Link className={navigationClassName} href="/admin">
              ภาพรวม
            </Link>
            <Link className={navigationClassName} href="/admin/reviews">
              คิวตรวจสอบ
            </Link>
            <Link className={navigationClassName} href="/admin/tournaments">
              รายการแข่งขันทั้งหมด
            </Link>
            <Link className={navigationClassName} href="/admin/teams">
              ทีมทั้งหมด
            </Link>
          </>
        ) : null}
        {isTeamManager || isPlatformAdmin ? (
          <Link className={navigationClassName} href="/team">
            ทีมของฉัน
          </Link>
        ) : null}
        {isOrganizer || isPlatformAdmin ? (
          <Link className={navigationClassName} href="/organizer">
          รายการของฉัน
          </Link>
        ) : null}
      </nav>
    </aside>
  )
}
```

### สัญญาข้อมูล

ไฟล์ `features/team-management/application/ports/admin-team-read-repository.ts` บรรทัด **1–33**: นิยามข้อมูลแถวทีม รายละเอียดผู้เล่น และ contract ของตัวอ่านข้อมูล. ไม่มี `phone` หรืออีเมลในชนิดข้อมูลนี้ จึงไม่ส่งฟิลด์ดังกล่าวต่อไปยังหน้าแอดมิน

จุดอ่าน: `6`, `16`, `30`

```ts
import type {
  TeamFormat,
  TeamPlayerPosition,
} from "@/features/team-management/domain/team"

export interface AdminTeamListItem {
  id: string
  name: string
  province: string
  format: TeamFormat
  isActive: boolean
  ownerName: string
  activePlayerCount: number
}

export interface AdminTeamPlayer {
  id: string
  firstName: string
  lastName: string
  nickname: string | null
  jerseyNumber: number | null
  position: TeamPlayerPosition | null
  birthDate: string
}

export interface AdminTeamDetail extends AdminTeamListItem {
  players: AdminTeamPlayer[]
}

export interface AdminTeamReadRepository {
  listAll(): Promise<AdminTeamListItem[]>
  findById(id: string): Promise<AdminTeamDetail | null>
}
```

### คำสั่งอ่านและตรวจสิทธิ์

ไฟล์ `features/team-management/application/read-admin-teams.ts` บรรทัด **1–32**: `listAdminTeams` และ `getAdminTeamDetail` ตรวจบทบาทก่อนเรียก repository; ผู้ที่ไม่ใช่แอดมินและรหัสทีมที่ไม่มีจริงใช้ `NOT_FOUND` เพื่อไม่เผยข้อมูลทีม

จุดอ่าน: `10`, `18`, `29`

```ts
import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"

import type {
  AdminTeamDetail,
  AdminTeamListItem,
  AdminTeamReadRepository,
} from "./ports/admin-team-read-repository"

export async function listAdminTeams(
  actor: Actor,
  dependencies: { teams: AdminTeamReadRepository },
): Promise<AdminTeamListItem[]> {
  assertAdminTeamAccess(actor)
  return dependencies.teams.listAll()
}

export async function getAdminTeamDetail(
  teamId: string,
  actor: Actor,
  dependencies: { teams: AdminTeamReadRepository },
): Promise<AdminTeamDetail> {
  assertAdminTeamAccess(actor)
  const team = await dependencies.teams.findById(teamId)
  if (!team) throw new Error("NOT_FOUND")
  return team
}

function assertAdminTeamAccess(actor: Actor): void {
  if (actor.role !== "PLATFORM_ADMIN") throw new Error("NOT_FOUND")
  authorize(actor, "team.read")
}
```

### อ่านข้อมูลด้วย Prisma

ไฟล์ `features/team-management/infrastructure/prisma-admin-team-read-repository.ts` บรรทัด **1–75**: `listAll` อ่านทีมทุกสถานะพร้อมชื่อผู้สร้างและนับเฉพาะผู้เล่น active. `findById` อ่านผู้เล่น active ของทีมเดียวตามลำดับที่เพิ่ม โดยเลือกฟิลด์เป็นรายตัวและแปลงวันเกิดเป็น `YYYY-MM-DD`

จุดอ่าน: `12`, `33`

```ts
import type { PrismaClient } from "@/lib/generated/prisma/client"

import type {
  AdminTeamDetail,
  AdminTeamListItem,
  AdminTeamReadRepository,
} from "../application/ports/admin-team-read-repository"

export class PrismaAdminTeamReadRepository implements AdminTeamReadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listAll(): Promise<AdminTeamListItem[]> {
    const teams = await this.prisma.team.findMany({
      include: {
        province: { select: { nameTh: true } },
        owner: { select: { displayName: true } },
        _count: { select: { players: { where: { isActive: true } } } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    })

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      province: team.province.nameTh,
      format: team.format,
      isActive: team.isActive,
      ownerName: team.owner.displayName,
      activePlayerCount: team._count.players,
    }))
  }

  async findById(id: string): Promise<AdminTeamDetail | null> {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        province: { select: { nameTh: true } },
        owner: { select: { displayName: true } },
        players: {
          where: { isActive: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nickname: true,
            jerseyNumber: true,
            position: true,
            birthDate: true,
          },
        },
      },
    })
    if (!team) return null

    return {
      id: team.id,
      name: team.name,
      province: team.province.nameTh,
      format: team.format,
      isActive: team.isActive,
      ownerName: team.owner.displayName,
      activePlayerCount: team.players.length,
      players: team.players.map((player) => ({
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        nickname: player.nickname,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        birthDate: player.birthDate.toISOString().slice(0, 10),
      })),
    }
  }
}
```

### ประกอบ repository ฝั่งเซิร์ฟเวอร์

ไฟล์ `features/team-management/infrastructure/get-admin-team-read-repository.ts` บรรทัด **1–10**: สร้าง Prisma adapter จาก client กลางของระบบ; `server-only` ป้องกันการนำโมดูลนี้ไปใส่ client bundle

จุดอ่าน: `8`

```ts
import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import type { AdminTeamReadRepository } from "../application/ports/admin-team-read-repository"
import { PrismaAdminTeamReadRepository } from "./prisma-admin-team-read-repository"

export function getAdminTeamReadRepository(): AdminTeamReadRepository {
  return new PrismaAdminTeamReadRepository(getPrismaClient())
}
```

### หน้า /admin/teams

ไฟล์ `app/(admin)/admin/teams/page.tsx` บรรทัด **1–64**: หน้า Server Component โหลดบัญชีปัจจุบันแล้วเรียก use case ที่ตรวจสิทธิ์ แสดงทุกทีม ชื่อผู้สร้าง จังหวัด รูปแบบ จำนวนผู้เล่น active และสถานะ; แต่ละแถวลิงก์ไปหน้ารายละเอียด มี empty state

จุดอ่าน: `8`, `44`

```tsx
import Link from "next/link"
import { notFound } from "next/navigation"

import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { listAdminTeams } from "@/features/team-management/application/read-admin-teams"
import { getAdminTeamReadRepository } from "@/features/team-management/infrastructure/get-admin-team-read-repository"

export default async function AdminTeamListPage() {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) notFound()

  let teams
  try {
    teams = await listAdminTeams(actor, {
      teams: getAdminTeamReadRepository(),
    })
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") notFound()
    throw error
  }

  return (
    <section aria-labelledby="admin-teams-heading">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold text-court">TEAM DIRECTORY</p>
        <h1 className="mt-2 text-2xl font-semibold" id="admin-teams-heading">
          ทีมทั้งหมด
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ตรวจสอบทีม ผู้สร้าง และสมาชิกที่ใช้งานอยู่
        </p>
      </header>

      {teams.length === 0 ? (
        <p className="border-b border-border py-10 text-sm text-muted-foreground">
          ยังไม่มีทีมในระบบ
        </p>
      ) : (
        <div className="divide-y divide-border border-b border-border">
          {teams.map((team) => (
            <Link
              aria-label={`ดูสมาชิกทีม ${team.name}`}
              className="grid min-w-0 gap-3 py-5 hover:text-court focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
              href={`/admin/teams/${team.id}`}
              key={team.id}
            >
              <span className="min-w-0 break-words font-semibold">{team.name}</span>
              <span className="min-w-0 text-sm">
                <span className="block text-xs text-muted-foreground">ผู้สร้างทีม</span>
                <span className="break-words">{team.ownerName}</span>
              </span>
              <span className="text-sm text-muted-foreground sm:text-right">
                {team.province} · {team.format === "FIVE_V_FIVE" ? "5v5" : "3v3"}
                <span className="block">
                  ผู้เล่น {team.activePlayerCount} คน · {team.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
```

### หน้า /admin/teams/[id]

ไฟล์ `app/(admin)/admin/teams/[id]/page.tsx` บรรทัด **1–94**: อ่าน `params` แบบ Promise ตาม Next.js 16 แล้วโหลดรายละเอียดผ่าน use case แสดงผู้สร้างและผู้เล่น active ทุกคนพร้อมชื่อเล่น เบอร์เสื้อ ตำแหน่ง วันเกิด เป็นหน้าอ่านอย่างเดียว ไม่มีปุ่มแก้/ลบ และมี empty/not-found state

จุดอ่าน: `8`, `16`, `61`

```tsx
import Link from "next/link"
import { notFound } from "next/navigation"

import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getAdminTeamDetail } from "@/features/team-management/application/read-admin-teams"
import { getAdminTeamReadRepository } from "@/features/team-management/infrastructure/get-admin-team-read-repository"

export default async function AdminTeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) notFound()

  const { id } = await params
  let team
  try {
    team = await getAdminTeamDetail(id, actor, {
      teams: getAdminTeamReadRepository(),
    })
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") notFound()
    throw error
  }

  return (
    <section aria-labelledby="admin-team-detail-heading">
      <header className="border-b border-border pb-6">
        <Link className="text-sm text-court hover:underline" href="/admin/teams">
          กลับไปทีมทั้งหมด
        </Link>
        <p className="mt-6 text-xs font-semibold text-court">TEAM DIRECTORY</p>
        <h1 className="mt-2 break-words text-2xl font-semibold" id="admin-team-detail-heading">
          {team.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {team.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"} · {team.format === "FIVE_V_FIVE" ? "5v5" : "3v3"} · {team.province}
        </p>
      </header>

      <dl className="grid gap-x-8 gap-y-4 border-b border-border py-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">ผู้สร้างทีม / ผู้จัดการ-โค้ช</dt>
          <dd className="mt-1 break-words font-medium">{team.ownerName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">ผู้เล่นที่ใช้งานอยู่</dt>
          <dd className="mt-1 font-medium">{team.activePlayerCount} คน</dd>
        </div>
      </dl>

      <div className="pt-8">
        <h2 className="text-lg font-semibold">รายชื่อผู้เล่น</h2>
        {team.players.length === 0 ? (
          <p className="border-b border-border py-8 text-sm text-muted-foreground">
            ทีมนี้ยังไม่มีผู้เล่นที่ใช้งานอยู่
          </p>
        ) : (
          <ol className="mt-4 divide-y divide-border border-y border-border">
            {team.players.map((player, index) => (
              <li className="grid min-w-0 gap-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]" key={player.id}>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">ผู้เล่น {index + 1}</p>
                  <p className="mt-1 break-words font-medium">
                    {player.firstName} {player.lastName}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">ชื่อเล่น</dt>
                    <dd className="mt-1 break-words">{player.nickname ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">เบอร์เสื้อ</dt>
                    <dd className="mt-1">{player.jerseyNumber ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">ตำแหน่ง</dt>
                    <dd className="mt-1">{player.position ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">วันเกิด</dt>
                    <dd className="mt-1">{player.birthDate}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
```

### เทสต์สิทธิ์

ไฟล์ `tests/features/identity/permission.test.ts` บรรทัด **1–38**: ยืนยันว่า `team.read` อยู่ในชุดสิทธิ์ และสงวนให้ Platform Admin

จุดอ่าน: `32`

```ts
import { describe, expect, it } from "vitest"

import { permissions, permissionsByRole } from "@/features/identity/domain/permission"

describe("role permissions", () => {
  it("allows tournament organizers to start and complete owned competitions", () => {
    const permissions = permissionsByRole.TOURNAMENT_ORGANIZER

    expect(permissions.has("tournament.start")).toBe(true)
    expect(permissions.has("tournament.complete")).toBe(true)
  })

  it("does not grant competition lifecycle commands to players", () => {
    const permissions = permissionsByRole.PLAYER

    expect(permissions.has("tournament.start")).toBe(false)
    expect(permissions.has("tournament.complete")).toBe(false)
  })

  it("reserves reopening tournament registration for platform admins", () => {
    expect(permissions).toContain("tournament.registration.reopen")
    expect(
      permissionsByRole.PLATFORM_ADMIN.has("tournament.registration.reopen"),
    ).toBe(true)
    expect(
      permissionsByRole.TOURNAMENT_ORGANIZER.has(
        "tournament.registration.reopen",
      ),
    ).toBe(false)
  })

  it("reserves reading all teams for platform admins", () => {
    expect(permissions).toContain("team.read")
    expect(permissionsByRole.PLATFORM_ADMIN.has("team.read")).toBe(true)
    expect(permissionsByRole.TEAM_MANAGER_COACH.has("team.read")).toBe(false)
    expect(permissionsByRole.TOURNAMENT_ORGANIZER.has("team.read")).toBe(false)
  })
})
```

### เทสต์เมนู

ไฟล์ `tests/ui/admin/admin-shell.test.tsx` บรรทัด **1–37**: ยืนยันว่าแอดมินเห็นลิงก์ทีมทั้งหมด และผู้จัดรายการไม่เห็น

จุดอ่าน: `22`

```tsx
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createTestActor } from "@/tests/fixtures/actor"

afterEach(cleanup)

describe("AdminSidebar", () => {
  it("shows the review queue to platform admins", () => {
    render(
      <AdminSidebar actor={createTestActor("admin-1", "PLATFORM_ADMIN")} />,
    )

    expect(
      screen.getByRole("link", { name: "คิวตรวจสอบ" }).getAttribute("href"),
    ).toBe("/admin/reviews")
    expect(
      screen.getByRole("link", { name: "รายการแข่งขันทั้งหมด" }).getAttribute("href"),
    ).toBe("/admin/tournaments")
    expect(
      screen.getByRole("link", { name: "ทีมทั้งหมด" }).getAttribute("href"),
    ).toBe("/admin/teams")
  })

  it("hides the review queue from tournament organizers", () => {
    render(
      <AdminSidebar
        actor={createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")}
      />,
    )

    expect(screen.queryByRole("link", { name: "คิวตรวจสอบ" })).toBeNull()
    expect(screen.queryByRole("link", { name: "รายการแข่งขันทั้งหมด" })).toBeNull()
    expect(screen.queryByRole("link", { name: "ทีมทั้งหมด" })).toBeNull()
  })
})
```

### เทสต์ use case

ไฟล์ `tests/features/team-management/admin-team-read.test.ts` บรรทัด **1–77**: ตรวจว่า role อื่นถูกปฏิเสธก่อนเรียก repository, แอดมินอ่านได้ และทีมที่ไม่มีจริงคืน `NOT_FOUND`

จุดอ่าน: `38`, `39`, `52`, `69`

```ts
import { describe, expect, it, vi } from "vitest"

import {
  getAdminTeamDetail,
  listAdminTeams,
} from "@/features/team-management/application/read-admin-teams"
import type { AdminTeamReadRepository } from "@/features/team-management/application/ports/admin-team-read-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const team = {
  id: "team-1",
  name: "Bangkok Ballers",
  province: "กรุงเทพมหานคร",
  format: "FIVE_V_FIVE" as const,
  isActive: true,
  ownerName: "Coach May",
  activePlayerCount: 1,
}

function createRepository(): AdminTeamReadRepository {
  return {
    listAll: vi.fn(async () => [team]),
    findById: vi.fn(async () => ({
      ...team,
      players: [{
        id: "player-1",
        firstName: "Anan",
        lastName: "Suk",
        nickname: "Nan",
        jerseyNumber: 7,
        position: "PG" as const,
        birthDate: "2010-05-12",
      }],
    })),
  }
}

describe("admin team reading", () => {
  it("lists teams only for platform admins", async () => {
    const teams = createRepository()

    await expect(
      listAdminTeams(createTestActor("organizer-1", "TOURNAMENT_ORGANIZER"), { teams }),
    ).rejects.toThrow("NOT_FOUND")
    expect(teams.listAll).not.toHaveBeenCalled()

    await expect(
      listAdminTeams(createTestActor("admin-1", "PLATFORM_ADMIN"), { teams }),
    ).resolves.toEqual([team])
  })

  it("loads one team's active roster only after checking admin access", async () => {
    const teams = createRepository()

    await expect(
      getAdminTeamDetail("team-1", createTestActor("manager-1", "TEAM_MANAGER_COACH"), { teams }),
    ).rejects.toThrow("NOT_FOUND")
    expect(teams.findById).not.toHaveBeenCalled()

    const detail = await getAdminTeamDetail(
      "team-1",
      createTestActor("admin-1", "PLATFORM_ADMIN"),
      { teams },
    )
    expect(detail.ownerName).toBe("Coach May")
    expect(detail.players).toHaveLength(1)
  })

  it("hides missing team identifiers", async () => {
    const teams = createRepository()
    vi.mocked(teams.findById).mockResolvedValueOnce(null)

    await expect(
      getAdminTeamDetail("missing", createTestActor("admin-1", "PLATFORM_ADMIN"), { teams }),
    ).rejects.toThrow("NOT_FOUND")
  })
})
```

### เทสต์ Prisma mapping

ไฟล์ `tests/features/team-management/prisma-admin-team-read-repository.test.ts` บรรทัด **1–123**: ตรวจรายชื่อทีมที่ active/inactive, ชื่อผู้สร้าง, จำนวนผู้เล่น active, การเลือกฟิลด์และตัวกรองผู้เล่น โดยไม่มีเบอร์โทรหรืออีเมล

จุดอ่าน: `6`, `7`, `62`

```ts
import type { PrismaClient } from "@/lib/generated/prisma/client"
import { describe, expect, it, vi } from "vitest"

import { PrismaAdminTeamReadRepository } from "@/features/team-management/infrastructure/prisma-admin-team-read-repository"

describe("PrismaAdminTeamReadRepository", () => {
  it("lists every team with its creator and active player count", async () => {
    const findMany = vi.fn(async () => [
      {
        id: "team-1",
        name: "Bangkok Ballers",
        format: "FIVE_V_FIVE" as const,
        isActive: true,
        province: { nameTh: "กรุงเทพมหานคร" },
        owner: { displayName: "Coach May" },
        _count: { players: 2 },
      },
      {
        id: "team-2",
        name: "Old Team",
        format: "THREE_V_THREE" as const,
        isActive: false,
        province: { nameTh: "เชียงใหม่" },
        owner: { displayName: "Coach Art" },
        _count: { players: 0 },
      },
    ])
    const repository = new PrismaAdminTeamReadRepository({
      team: { findMany },
    } as unknown as PrismaClient)

    await expect(repository.listAll()).resolves.toEqual([
      {
        id: "team-1",
        name: "Bangkok Ballers",
        format: "FIVE_V_FIVE",
        isActive: true,
        province: "กรุงเทพมหานคร",
        ownerName: "Coach May",
        activePlayerCount: 2,
      },
      {
        id: "team-2",
        name: "Old Team",
        format: "THREE_V_THREE",
        isActive: false,
        province: "เชียงใหม่",
        ownerName: "Coach Art",
        activePlayerCount: 0,
      },
    ])
    expect(findMany).toHaveBeenCalledWith({
      include: {
        province: { select: { nameTh: true } },
        owner: { select: { displayName: true } },
        _count: { select: { players: { where: { isActive: true } } } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    })
  })

  it("returns only active players and omits phone and owner email", async () => {
    const findUnique = vi.fn(async () => ({
      id: "team-1",
      name: "Bangkok Ballers",
      format: "FIVE_V_FIVE" as const,
      isActive: true,
      province: { nameTh: "กรุงเทพมหานคร" },
      owner: { displayName: "Coach May" },
      players: [{
        id: "player-1",
        firstName: "Anan",
        lastName: "Suk",
        nickname: "Nan",
        jerseyNumber: 7,
        position: "PG" as const,
        birthDate: new Date("2010-05-12T00:00:00.000Z"),
      }],
    }))
    const repository = new PrismaAdminTeamReadRepository({
      team: { findUnique },
    } as unknown as PrismaClient)

    await expect(repository.findById("team-1")).resolves.toEqual({
      id: "team-1",
      name: "Bangkok Ballers",
      format: "FIVE_V_FIVE",
      isActive: true,
      province: "กรุงเทพมหานคร",
      ownerName: "Coach May",
      activePlayerCount: 1,
      players: [{
        id: "player-1",
        firstName: "Anan",
        lastName: "Suk",
        nickname: "Nan",
        jerseyNumber: 7,
        position: "PG",
        birthDate: "2010-05-12",
      }],
    })
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "team-1" },
      include: {
        province: { select: { nameTh: true } },
        owner: { select: { displayName: true } },
        players: {
          where: { isActive: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nickname: true,
            jerseyNumber: true,
            position: true,
            birthDate: true,
          },
        },
      },
    })
  })
})
```

### เทสต์หน้าจอ

ไฟล์ `tests/ui/admin/admin-team-pages.test.tsx` บรรทัด **1–128**: ตรวจลิงก์รายชื่อ/ผู้สร้าง รายละเอียดผู้เล่น การไม่แสดงข้อมูลติดต่อและปุ่มแก้ไข การกันบทบาทอื่น รวมทั้ง empty/not-found state

จุดอ่าน: `71`, `72`, `81`, `93`, `104`, `121`

```tsx
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import AdminTeamListPage from "@/app/(admin)/admin/teams/page"
import AdminTeamDetailPage from "@/app/(admin)/admin/teams/[id]/page"
import type { AdminTeamDetail } from "@/features/team-management/application/ports/admin-team-read-repository"

const mocks = vi.hoisted(() => ({
  actorRole: "PLATFORM_ADMIN",
  listAll: vi.fn(async () => [{
    id: "team-1",
    name: "Bangkok Ballers",
    ownerName: "Coach May",
    province: "กรุงเทพมหานคร",
    format: "FIVE_V_FIVE" as const,
    isActive: true,
    activePlayerCount: 1,
  }]),
  findById: vi.fn(async (): Promise<AdminTeamDetail | null> => ({
    id: "team-1",
    name: "Bangkok Ballers",
    ownerName: "Coach May",
    province: "กรุงเทพมหานคร",
    format: "FIVE_V_FIVE" as const,
    isActive: true,
    activePlayerCount: 1,
    players: [{
      id: "player-1",
      firstName: "Anan",
      lastName: "Suk",
      nickname: "Nan",
      jerseyNumber: 7,
      position: "PG" as const,
      birthDate: "2010-05-12",
    }],
  })),
}))

vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NEXT_NOT_FOUND") },
}))
vi.mock(
  "@/features/identity/infrastructure/next-cookie-current-actor-provider",
  () => ({
    createNextCookieCurrentActorProvider: () => ({
      getCurrentActor: async () => ({
        id: "admin-1",
        role: mocks.actorRole,
        email: "admin@example.com",
        displayName: "Admin",
      }),
    }),
  }),
)
vi.mock(
  "@/features/team-management/infrastructure/get-admin-team-read-repository",
  () => ({
    getAdminTeamReadRepository: () => ({
      listAll: mocks.listAll,
      findById: mocks.findById,
    }),
  }),
)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  mocks.actorRole = "PLATFORM_ADMIN"
})

describe("admin team pages", () => {
  it("links every team to its read-only detail and names the creator", async () => {
    render(await AdminTeamListPage())

    expect(screen.getByRole("heading", { name: "ทีมทั้งหมด" })).toBeTruthy()
    expect(screen.getByText("Coach May")).toBeTruthy()
    expect(screen.getByRole("link", { name: "ดูสมาชิกทีม Bangkok Ballers" }).getAttribute("href"))
      .toBe("/admin/teams/team-1")
  })

  it("shows the current player roster without contact information or edit controls", async () => {
    render(await AdminTeamDetailPage({ params: Promise.resolve({ id: "team-1" }) }))

    expect(screen.getByRole("heading", { name: "Bangkok Ballers" })).toBeTruthy()
    expect(screen.getByText("Coach May")).toBeTruthy()
    expect(screen.getByText("Anan Suk")).toBeTruthy()
    expect(screen.getByText("Nan")).toBeTruthy()
    expect(screen.getByText("2010-05-12")).toBeTruthy()
    expect(screen.queryByText(/โทรศัพท์|อีเมล/)).toBeNull()
    expect(screen.queryByRole("button", { name: /แก้ไข|ลบทีม/ })).toBeNull()
  })

  it("does not read team records for other roles", async () => {
    mocks.actorRole = "TOURNAMENT_ORGANIZER"

    await expect(AdminTeamListPage()).rejects.toThrow("NEXT_NOT_FOUND")
    await expect(
      AdminTeamDetailPage({ params: Promise.resolve({ id: "team-1" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(mocks.listAll).not.toHaveBeenCalled()
    expect(mocks.findById).not.toHaveBeenCalled()
  })

  it("shows empty states for a new directory and an empty roster", async () => {
    mocks.listAll.mockResolvedValueOnce([])
    render(await AdminTeamListPage())
    expect(screen.getByText("ยังไม่มีทีมในระบบ")).toBeTruthy()

    cleanup()
    const detail = await mocks.findById()
    if (!detail) throw new Error("Expected team fixture")
    mocks.findById.mockResolvedValueOnce({
      ...detail,
      activePlayerCount: 0,
      players: [],
    })
    render(await AdminTeamDetailPage({ params: Promise.resolve({ id: "team-1" }) }))
    expect(screen.getByText("ทีมนี้ยังไม่มีผู้เล่นที่ใช้งานอยู่")).toBeTruthy()
  })

  it("uses not-found for an unknown team", async () => {
    mocks.findById.mockResolvedValueOnce(null)

    await expect(
      AdminTeamDetailPage({ params: Promise.resolve({ id: "missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND")
  })
})
```

## การตรวจที่ทำแล้ว

- เทสต์ที่เพิ่มในรอบนี้ผ่าน; เทสต์รวมผ่าน **1,195/1,195** เมื่อใช้ `npm run test -- --maxWorkers=2 --testTimeout=15000`
- `npm run lint`, `npm run build` ผ่าน
- ทดลองจริงแบบอ่านอย่างเดียวที่ 375, 768 และ 1440 พิกเซล: หน้า list/detail ตอบ 200 และไม่มีแนวนอนล้น
- รอบแรกที่ใช้ timeout เริ่มต้น 5 วินาที มีเทสต์โหลด PDF เก่าชน timeout ระหว่างรันชุดใหญ่ แต่เคสเดียวกันผ่านเมื่อรันแยกและผ่านในการรันรวมที่ให้เวลา 15 วินาที; ไม่ได้แก้โค้ด PDF ในรอบนี้

## ข้อจำกัดและความเป็นส่วนตัว

- แสดงสมาชิก active ณ เวลาที่เปิดหน้า ไม่ใช่ roster ที่ล็อกไว้ ณ วันสมัคร
- วันเกิดเป็นข้อมูลส่วนบุคคล จึงแสดงเฉพาะหน้าแอดมินที่ตรวจสิทธิ์แล้ว; เบอร์โทรและอีเมลไม่ถูกเลือกจาก query
- รายชื่อทีมอ่านทั้งหมดในหน้าเดียวตามขอบเขตโปรเจกต์ปัจจุบัน หากข้อมูลโตมากควรเพิ่มการค้นหา/แบ่งหน้าในงานถัดไป
