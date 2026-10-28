# คู่มือโค้ด: ผู้จัดดูสมาชิกทีมที่สมัครแข่งขัน

อัปเดต 21 ตุลาคม 2569 เอกสารนี้รวม **โค้ดฉบับปัจจุบันของไฟล์ที่เพิ่มหรือแก้ในฟีเจอร์นี้** เพื่อใช้เปิดอธิบายโปรเจกต์ ไฟล์เดิมแสดงทั้งไฟล์ให้เห็นบริบท; ไม่ได้หมายความว่าทุกบรรทัดในไฟล์เป็นโค้ดที่เพิ่มในรอบเดียวกัน เลขบรรทัดอ้างอิงจากไฟล์จริง ณ วันที่อัปเดต

## หน้าที่ผู้ใช้

1. Tournament Organizer เปิด `/organizer/tournaments/[id]/registrations` ของรายการตนเอง เห็นทีมที่ส่งใบสมัครตามสถานะเดิม
2. กด **ดูสมาชิกทีม** ใต้ทีมหนึ่งทีมเพื่อดูชื่อผู้จัดการ/โค้ชและผู้เล่น active ปัจจุบัน พร้อมเบอร์เสื้อถ้ามี; กดอีกครั้งเพื่อพับกลับ
3. ถ้าทีมยังไม่มีผู้เล่น active จะแสดงข้อความว่าง ผู้จัดรายการอื่นเข้าอ่านไม่ได้ ส่วน Platform Admin ใช้สิทธิ์เดิมในการตรวจใบสมัคร

## ข้อมูลวิ่งอย่างไร

`Prisma Registration → Team → Team.owner / Team.players` → `PrismaRegistrationRepository.listByTournament` → `listTournamentRegistrations` ตรวจสิทธิ์เจ้าของรายการ → หน้า `/organizer/tournaments/[id]/registrations` → `RegistrationReviewList` → `RegistrationTeamRoster`

หน้าและ use case ข้างต้นมีอยู่ก่อนฟีเจอร์นี้ รอบนี้ขยายข้อมูลในสัญญา repository, query และหน้ารายการใบสมัคร ไม่เพิ่ม API หรือ migration ชื่อผู้จัดการ/โค้ชใช้ `Team.owner.displayName`; ผู้เล่นเป็น **roster ปัจจุบัน** ไม่ใช่สำเนา ณ วันส่งใบสมัคร

## จุดสำคัญที่ควรตอบอาจารย์

| คำถาม | เปิดไฟล์และบรรทัด | คำตอบ |
| --- | --- | --- |
| หน้าอยู่ที่ไหน | `app/(admin)/organizer/tournaments/[id]/registrations/page.tsx:28` | หน้าเดิมเรียก use case เพื่ออ่านใบสมัคร แล้วส่งรายการเข้า component; รอบนี้ไม่ได้แก้ไฟล์หน้านี้ |
| ตรวจสิทธิ์ตรงไหน | `features/registrations/application/list-tournament-registrations.ts:25` | use case ตรวจเจ้าของทัวร์นาเมนต์และสิทธิ์ก่อนเรียก repository; การพับ/เปิด UI ไม่ใช่ด่านสิทธิ์ |
| สัญญาข้อมูลอยู่ที่ไหน | `features/registrations/application/ports/registration-repository.ts:53` | กำหนดข้อมูลผู้เล่นที่อนุญาตให้หน้าจอใช้ |
| อ่านสมาชิกจากฐานข้อมูลตรงไหน | `features/registrations/infrastructure/prisma-registration-repository.ts:171` | Prisma อ่านใบสมัคร ทีม เจ้าของทีม และสมาชิก active |
| แปลงข้อมูลให้หน้าจอตรงไหน | `features/registrations/infrastructure/prisma-registration-repository.ts:204` | ส่งชื่อผู้จัดการ/โค้ชและรายชื่อผู้เล่นในรูปแบบ view-ready |
| ส่วนกดดูสมาชิกอยู่ไหน | `components/organizer/registration-team-roster.tsx:13` | แสดงรายชื่อแบบพับ/เปิดได้ |
| เชื่อมกับแต่ละใบสมัครตรงไหน | `components/organizer/registration-review-list.tsx:198` | แยก roster ตามทีมที่สมัคร |
| ทดสอบส่วนนี้ตรงไหน | `tests/features/registrations/prisma-registration-repository.test.ts:499` | ตรวจ query และ mapping; เทสต์หน้าจออยู่ในไฟล์ UI ด้านล่าง |

## โค้ดครบของฟีเจอร์นี้

โค้ดด้านล่างคัดจากไฟล์จริงทั้งหมดของไฟล์ที่เพิ่มหรือแก้เพื่อแสดงสมาชิกทีมในหน้าตรวจใบสมัคร คำอธิบายแยกไว้ใต้โค้ด; หากภายหลังมีการแก้ไฟล์จริง ให้เช็กเลขบรรทัดใหม่ด้วย

### สัญญาข้อมูล

ไฟล์ `features/registrations/application/ports/registration-repository.ts` บรรทัด **1–138**

```ts
import type { TeamPlayer, TeamSummary } from "@/features/team-management/domain/team"
import type { RosterFormat } from "@/features/team-management/domain/team-policy"
import type { RegistrationTournamentStatus } from "@/features/registrations/domain/registration-policy"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"
import type { TournamentGovernanceStatus } from "@/features/tournament-operations/domain/tournament-governance-policy"

export interface RegistrationApplicationContext {
  team: TeamSummary
  roster: TeamPlayer[]
  tournament: {
    id: string
    format: RosterFormat
    ageGroup: string
    startsAt: string
    status: RegistrationTournamentStatus
    governanceStatus: TournamentGovernanceStatus
    registrationDeadline: string
    capacity: number
    approvedCount: number
  }
}

export interface TournamentRegistrationWithOwnership extends TournamentRegistration {
  team: TeamSummary
  tournament: {
    governanceStatus: TournamentGovernanceStatus
  }
}

export interface TeamRegistrationListItem extends TournamentRegistration {
  tournamentName: string
  tournamentSlug: string
  tournamentStatus: RegistrationTournamentStatus
  tournamentGovernanceStatus: TournamentGovernanceStatus
  submittedAt: string
  organizerNote: string | null
}

export interface RegistrationReviewTournament {
  id: string
  title: string
  organizerId: string
  status: RegistrationTournamentStatus
  governanceStatus: TournamentGovernanceStatus
  capacity: number
}

export interface RegistrationReviewContext {
  registration: TournamentRegistration
  tournament: RegistrationReviewTournament
}

export interface RegistrationReviewPlayer {
  id: string
  firstName: string
  lastName: string
  jerseyNumber: number | null
}

export interface TournamentRegistrationReviewItem
  extends TournamentRegistration {
  teamName: string
  province: string
  playerCount: number
  managerCoachCount: number
  managerCoachName: string
  players: RegistrationReviewPlayer[]
  submittedAt: string
}

interface RegistrationReviewMutationInput {
  before: TournamentRegistration
  version: number
  actorId: string
  at: string
  adminOverride: boolean
}

export interface ApproveRegistrationInput
  extends RegistrationReviewMutationInput {
  note: string
}

export interface RejectRegistrationInput
  extends RegistrationReviewMutationInput {
  note: string
}

export interface WithdrawRegistrationMutationInput
  extends RegistrationReviewMutationInput {
  reason: string
}

export interface RegistrationRepositoryTransaction {
  getApplicationContext(
    tournamentId: string,
    teamId: string,
  ): Promise<RegistrationApplicationContext | null>
  findActive(tournamentId: string, teamId: string): Promise<TournamentRegistration | null>
  createPending(input: {
    tournamentId: string
    teamId: string
    actorId: string
    adminOverride: boolean
  }): Promise<TournamentRegistration>
  findById(id: string): Promise<TournamentRegistrationWithOwnership | null>
  cancelWithVersion(
    id: string,
    version: number,
    actorId: string,
    at: string,
    adminOverride: boolean,
  ): Promise<TournamentRegistration>
  findReviewContext(id: string): Promise<RegistrationReviewContext | null>
  approveWithCapacity(
    input: ApproveRegistrationInput,
  ): Promise<TournamentRegistration>
  rejectWithVersion(
    input: RejectRegistrationInput,
  ): Promise<TournamentRegistration>
  withdrawWithVersion(
    input: WithdrawRegistrationMutationInput,
  ): Promise<TournamentRegistration>
}

export interface RegistrationRepository extends RegistrationRepositoryTransaction {
  inTransaction<T>(
    operation: (repository: RegistrationRepositoryTransaction) => Promise<T>,
  ): Promise<T>
  findTeam(teamId: string): Promise<TeamSummary | null>
  listByTeam(teamId: string): Promise<TeamRegistrationListItem[]>
  findTournamentForReview(
    tournamentId: string,
  ): Promise<RegistrationReviewTournament | null>
  listByTournament(
    tournamentId: string,
  ): Promise<TournamentRegistrationReviewItem[]>
}
```

ไฟล์นี้กำหนดรูปข้อมูลที่ application ส่งให้หน้าตรวจใบสมัคร โดยเพิ่ม `RegistrationReviewPlayer` และฟิลด์ `managerCoachName`/`players` ให้รายการเดิม ชั้นแสดงผลจึงไม่ต้องรู้จักโมเดล Prisma โดยตรง

จุดอ่าน: บรรทัด `53`

### อ่านและแปลงข้อมูลด้วย Prisma

ไฟล์ `features/registrations/infrastructure/prisma-registration-repository.ts` บรรทัด **1–683**

```ts
import { Prisma, type PrismaClient, type Registration, type Team, type TeamPlayer as PrismaTeamPlayer } from "@/lib/generated/prisma/client"
import type {
  ApproveRegistrationInput,
  RegistrationApplicationContext,
  RegistrationRepository,
  RegistrationRepositoryTransaction,
  RegistrationReviewContext,
  RegistrationReviewTournament,
  RejectRegistrationInput,
  TeamRegistrationListItem,
  TournamentRegistrationReviewItem,
  TournamentRegistrationWithOwnership,
  WithdrawRegistrationMutationInput,
} from "@/features/registrations/application/ports/registration-repository"
import type { TeamPlayer, TeamSummary } from "@/features/team-management/domain/team"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"
import { lockActiveTournamentForMutation } from "@/features/tournament-operations/infrastructure/prisma-tournament-governance-lock"

type RegistrationDatabaseClient = Pick<
  PrismaClient,
  | "registration"
  | "team"
  | "teamPlayer"
  | "tournament"
  | "auditLog"
  | "$queryRaw"
>

const maxSerializationAttempts = 3

export class PrismaRegistrationRepository implements RegistrationRepository {
  private readonly operations: PrismaRegistrationOperations

  constructor(private readonly prisma: PrismaClient) {
    this.operations = new PrismaRegistrationOperations(prisma)
  }

  // ธุรกรรม Serializable ทำให้การตรวจเงื่อนไขและบันทึกใบสมัครเห็นข้อมูลชุดเดียวกัน
  async inTransaction<T>(
    operation: (repository: RegistrationRepositoryTransaction) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxSerializationAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          (transaction) => operation(new PrismaRegistrationOperations(transaction)),
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        )
      } catch (error) {
        if (!isPrismaSerializationConflict(error)) throw error
        if (attempt === maxSerializationAttempts) throw new Error("CONFLICT")
      }
    }

    throw new Error("CONFLICT")
  }

  getApplicationContext(tournamentId: string, teamId: string) {
    return this.operations.getApplicationContext(tournamentId, teamId)
  }

  findActive(tournamentId: string, teamId: string) {
    return this.operations.findActive(tournamentId, teamId)
  }

  createPending(input: {
    tournamentId: string
    teamId: string
    actorId: string
    adminOverride: boolean
  }) {
    return this.inTransaction((registrations) =>
      registrations.createPending(input),
    )
  }

  findById(id: string) {
    return this.operations.findById(id)
  }

  cancelWithVersion(
    id: string,
    version: number,
    actorId: string,
    at: string,
    adminOverride: boolean,
  ) {
    return this.inTransaction((registrations) =>
      registrations.cancelWithVersion(
        id,
        version,
        actorId,
        at,
        adminOverride,
      ),
    )
  }

  findReviewContext(id: string) {
    return this.operations.findReviewContext(id)
  }

  approveWithCapacity(input: ApproveRegistrationInput) {
    return this.inTransaction((registrations) =>
      registrations.approveWithCapacity(input),
    )
  }

  rejectWithVersion(input: RejectRegistrationInput) {
    return this.inTransaction((registrations) =>
      registrations.rejectWithVersion(input),
    )
  }

  withdrawWithVersion(input: WithdrawRegistrationMutationInput) {
    return this.inTransaction((registrations) =>
      registrations.withdrawWithVersion(input),
    )
  }

  async findTeam(teamId: string): Promise<TeamSummary | null> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { province: true },
    })
    return team ? mapTeam(team) : null
  }

  async listByTeam(teamId: string): Promise<TeamRegistrationListItem[]> {
    const registrations = await this.prisma.registration.findMany({
      where: { teamId },
      include: {
        tournament: {
          select: {
            title: true,
            slug: true,
            status: true,
            governanceStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return registrations.map((registration) => ({
      ...mapRegistration(registration),
      tournamentName: registration.tournament.title,
      tournamentSlug: registration.tournament.slug,
      tournamentStatus: registration.tournament.status,
      tournamentGovernanceStatus: registration.tournament.governanceStatus,
      submittedAt: registration.createdAt.toISOString(),
      organizerNote: registration.decisionNote,
    }))
  }

  async findTournamentForReview(
    tournamentId: string,
  ): Promise<RegistrationReviewTournament | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        title: true,
        organizerId: true,
        status: true,
        governanceStatus: true,
        capacity: true,
      },
    })
    return tournament ? mapReviewTournament(tournament) : null
  }

  async listByTournament(
    tournamentId: string,
  ): Promise<TournamentRegistrationReviewItem[]> {
    const registrations = await this.prisma.registration.findMany({
      where: { tournamentId },
      include: {
        team: {
          include: {
            province: true,
            players: {
              where: { isActive: true },
              orderBy: { createdAt: "asc" },
              // ข้อมูลติดต่อและวันเกิดไม่จำเป็นต่อการตรวจรายชื่อ จึงไม่ส่งออกจากฐานข้อมูล
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jerseyNumber: true,
              },
            },
            owner: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return registrations.map((registration) => ({
      ...mapRegistration(registration),
      teamName: registration.team.name,
      province: registration.team.province.nameTh,
      playerCount: registration.team.players.length,
      managerCoachCount: registration.team.ownerId ? 1 : 0,
      managerCoachName: registration.team.owner.displayName,
      players: registration.team.players.map((player) => ({
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        jerseyNumber: player.jerseyNumber,
      })),
      submittedAt: registration.createdAt.toISOString(),
    }))
  }
}

class PrismaRegistrationOperations implements RegistrationRepositoryTransaction {
  constructor(private readonly prisma: RegistrationDatabaseClient) {}

  async getApplicationContext(
    tournamentId: string,
    teamId: string,
  ): Promise<RegistrationApplicationContext | null> {
    const lockedTeams = await this.prisma.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        SELECT "id"
        FROM "Team"
        WHERE "id" = ${teamId}
        FOR UPDATE
      `,
    )
    if (!lockedTeams[0]) return null

    const lockedTournaments = await this.prisma.$queryRaw<
      Array<{
        id: string
        format: RegistrationApplicationContext["tournament"]["format"]
        ageGroup: RegistrationApplicationContext["tournament"]["ageGroup"]
        startsAt: Date
        status: RegistrationApplicationContext["tournament"]["status"]
        governanceStatus: RegistrationApplicationContext["tournament"]["governanceStatus"]
        registrationDeadline: Date
        capacity: number
      }>
    >(
      Prisma.sql`
        SELECT "id", "format", "ageGroup", "startsAt", "status", "governanceStatus", "registrationDeadline", "capacity"
        FROM "Tournament"
        WHERE "id" = ${tournamentId}
        FOR UPDATE
      `,
    )
    const tournament = lockedTournaments[0]
    if (!tournament) return null

    await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT "id"
        FROM "TeamPlayer"
        WHERE "teamId" = ${teamId} AND "isActive" = true
        FOR UPDATE
      `,
    )

    const [team, roster, approvedCount] = await Promise.all([
      this.prisma.team.findUnique({
        where: { id: teamId },
        include: { province: true },
      }),
      this.prisma.teamPlayer.findMany({
        where: { teamId, isActive: true },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.registration.count({
        where: { tournamentId, status: "APPROVED" },
      }),
    ])
    if (!team) return null

    return {
      team: mapTeam(team),
      roster: roster.map(mapPlayer),
      tournament: {
        id: tournament.id,
        format: tournament.format,
        ageGroup: tournament.ageGroup,
        startsAt: tournament.startsAt.toISOString(),
        status: tournament.status,
        governanceStatus: tournament.governanceStatus,
        registrationDeadline: tournament.registrationDeadline.toISOString(),
        capacity: tournament.capacity,
        approvedCount,
      },
    }
  }

  async findActive(tournamentId: string, teamId: string): Promise<TournamentRegistration | null> {
    const registration = await this.prisma.registration.findFirst({
      where: { tournamentId, teamId, status: { in: ["PENDING", "APPROVED"] } },
      orderBy: { createdAt: "desc" },
    })
    return registration ? mapRegistration(registration) : null
  }

  async createPending(input: {
    tournamentId: string
    teamId: string
    actorId: string
    adminOverride: boolean
  }) {
    try {
      await lockActiveTournamentForMutation(
        this.prisma,
        input.tournamentId,
      )
      const registration = await this.prisma.registration.create({
        data: { tournamentId: input.tournamentId, teamId: input.teamId, status: "PENDING" },
      })
      await this.prisma.auditLog.create({
        data: {
          actorId: input.actorId,
          tournamentId: input.tournamentId,
          action: "registration.created",
          entityType: "Registration",
          entityId: registration.id,
          afterJson: toJsonValue(mapRegistration(registration)),
        },
      })
      if (input.adminOverride) {
        await this.prisma.auditLog.create({
          data: {
            actorId: input.actorId,
            tournamentId: input.tournamentId,
            action: "registration.admin_override",
            entityType: "Registration",
            entityId: registration.id,
            afterJson: toJsonValue(mapRegistration(registration)),
          },
        })
      }
      return mapRegistration(registration)
    } catch (error) {
      if (isPrismaUniqueError(error)) throw new Error("REGISTRATION_ALREADY_ACTIVE")
      throw error
    }
  }

  async findById(id: string): Promise<TournamentRegistrationWithOwnership | null> {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        team: { include: { province: true } },
        tournament: { select: { governanceStatus: true } },
      },
    })
    return registration
      ? {
          ...mapRegistration(registration),
          team: mapTeam(registration.team),
          tournament: {
            governanceStatus: registration.tournament.governanceStatus,
          },
        }
      : null
  }

  async cancelWithVersion(
    id: string,
    version: number,
    actorId: string,
    at: string,
    adminOverride: boolean,
  ) {
    const current = await this.prisma.registration.findUnique({
      where: { id },
      select: { tournamentId: true },
    })
    if (!current) throw new Error("NOT_FOUND")
    await lockActiveTournamentForMutation(
      this.prisma,
      current.tournamentId,
    )

    const cancelledAt = new Date(at)
    const updated = await this.prisma.registration.updateMany({
      where: { id, status: "PENDING", version },
      data: { status: "CANCELLED", cancelledAt, version: { increment: 1 } },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    const registration = await this.prisma.registration.findUnique({ where: { id } })
    if (!registration) throw new Error("NOT_FOUND")
    await this.prisma.auditLog.create({
      data: {
        actorId,
        tournamentId: registration.tournamentId,
        action: "registration.cancelled",
        entityType: "Registration",
        entityId: registration.id,
        beforeJson: toJsonValue({ status: "PENDING", version }),
        afterJson: toJsonValue(mapRegistration(registration)),
      },
    })
    if (adminOverride) {
      await this.prisma.auditLog.create({
        data: {
          actorId,
          tournamentId: registration.tournamentId,
          action: "registration.admin_override",
          entityType: "Registration",
          entityId: registration.id,
          beforeJson: toJsonValue({ status: "PENDING", version }),
          afterJson: toJsonValue(mapRegistration(registration)),
        },
      })
    }
    return mapRegistration(registration)
  }

  async findReviewContext(id: string): Promise<RegistrationReviewContext | null> {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        tournament: {
          select: {
            id: true,
            title: true,
            organizerId: true,
            status: true,
            governanceStatus: true,
            capacity: true,
          },
        },
      },
    })
    return registration
      ? {
          registration: mapRegistration(registration),
          tournament: mapReviewTournament(registration.tournament),
        }
      : null
  }

  // ล็อกรายการก่อนนับทีมที่อนุมัติ เพื่อกันคำขอพร้อมกันทำให้เกินจำนวนรับ
  async approveWithCapacity(
    input: ApproveRegistrationInput,
  ): Promise<TournamentRegistration> {
    const lockedTournament = await lockActiveTournamentForMutation(
      this.prisma,
      input.before.tournamentId,
    )
    const capacity = lockedTournament.capacity

    const approvedCount = await this.prisma.registration.count({
      where: {
        tournamentId: input.before.tournamentId,
        status: "APPROVED",
      },
    })
    if (approvedCount >= capacity) {
      throw new Error("TOURNAMENT_CAPACITY_REACHED")
    }

    return this.updateDecision({
      before: input.before,
      version: input.version,
      actorId: input.actorId,
      at: input.at,
      adminOverride: input.adminOverride,
      sourceStatus: "PENDING",
      status: "APPROVED",
      note: input.note,
      action: "registration.approved",
      timestampField: "decidedAt",
    })
  }

  rejectWithVersion(
    input: RejectRegistrationInput,
  ): Promise<TournamentRegistration> {
    return this.updateDecisionWithGovernanceLock({
      before: input.before,
      version: input.version,
      actorId: input.actorId,
      at: input.at,
      adminOverride: input.adminOverride,
      sourceStatus: "PENDING",
      status: "REJECTED",
      note: input.note,
      action: "registration.rejected",
      timestampField: "decidedAt",
    })
  }

  withdrawWithVersion(
    input: WithdrawRegistrationMutationInput,
  ): Promise<TournamentRegistration> {
    return this.updateDecisionWithGovernanceLock({
      before: input.before,
      version: input.version,
      actorId: input.actorId,
      at: input.at,
      adminOverride: input.adminOverride,
      sourceStatus: "APPROVED",
      status: "WITHDRAWN",
      note: input.reason,
      action: "registration.withdrawn",
      timestampField: "withdrawnAt",
    })
  }

  private async updateDecisionWithGovernanceLock(input: {
    before: TournamentRegistration
    version: number
    actorId: string
    at: string
    adminOverride: boolean
    sourceStatus: "PENDING" | "APPROVED"
    status: "REJECTED" | "WITHDRAWN"
    note: string
    action: "registration.rejected" | "registration.withdrawn"
    timestampField: "decidedAt" | "withdrawnAt"
  }) {
    await lockActiveTournamentForMutation(
      this.prisma,
      input.before.tournamentId,
    )
    return this.updateDecision(input)
  }

  private async updateDecision(input: {
    before: TournamentRegistration
    version: number
    actorId: string
    at: string
    adminOverride: boolean
    sourceStatus: "PENDING" | "APPROVED"
    status: "APPROVED" | "REJECTED" | "WITHDRAWN"
    note: string
    action:
      | "registration.approved"
      | "registration.rejected"
      | "registration.withdrawn"
    timestampField: "decidedAt" | "withdrawnAt"
  }): Promise<TournamentRegistration> {
    const timestamp = new Date(input.at)
    const updated = await this.prisma.registration.updateMany({
      where: {
        id: input.before.id,
        ...(input.status === "APPROVED"
          ? { tournamentId: input.before.tournamentId }
          : {}),
        status: input.sourceStatus,
        version: input.version,
      },
      data: {
        status: input.status,
        decisionNote: input.note || null,
        [input.timestampField]: timestamp,
        version: { increment: 1 },
      },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    const registration = await this.prisma.registration.findUnique({
      where: { id: input.before.id },
    })
    if (!registration) throw new Error("NOT_FOUND")
    const after = mapRegistration(registration)

    await this.appendDecisionAudit({
      actorId: input.actorId,
      action: input.action,
      before: input.before,
      after,
      adminOverride: input.adminOverride,
    })

    return after
  }

  private async appendDecisionAudit(input: {
    actorId: string
    action: string
    before: TournamentRegistration
    after: TournamentRegistration
    adminOverride: boolean
  }) {
    const auditData = {
      actorId: input.actorId,
      tournamentId: input.before.tournamentId,
      entityType: "Registration",
      entityId: input.before.id,
      beforeJson: toJsonValue(input.before),
      afterJson: toJsonValue(input.after),
    }
    await this.prisma.auditLog.create({
      data: { ...auditData, action: input.action },
    })
    if (input.adminOverride) {
      await this.prisma.auditLog.create({
        data: { ...auditData, action: "registration.admin_override" },
      })
    }
  }
}

function mapTeam(team: Team & { province: { nameTh: string } }): TeamSummary {
  return {
    id: team.id,
    name: team.name,
    provinceCode: team.provinceCode,
    province: team.province.nameTh,
    ownerId: team.ownerId,
    format: team.format,
    isActive: team.isActive,
    deactivatedAt: team.deactivatedAt?.toISOString() ?? null,
    version: team.version,
  }
}

function mapPlayer(player: PrismaTeamPlayer): TeamPlayer {
  return {
    id: player.id,
    teamId: player.teamId,
    firstName: player.firstName,
    lastName: player.lastName,
    nickname: player.nickname,
    birthDate: player.birthDate.toISOString().slice(0, 10),
    jerseyNumber: player.jerseyNumber,
    position: player.position,
    phone: player.phone,
    isActive: player.isActive,
    deactivatedAt: player.deactivatedAt?.toISOString() ?? null,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString(),
  }
}

function mapRegistration(registration: Registration): TournamentRegistration {
  return {
    id: registration.id,
    tournamentId: registration.tournamentId,
    teamId: registration.teamId,
    status: registration.status,
    decisionNote: registration.decisionNote,
    decidedAt: registration.decidedAt?.toISOString() ?? null,
    cancelledAt: registration.cancelledAt?.toISOString() ?? null,
    withdrawnAt: registration.withdrawnAt?.toISOString() ?? null,
    version: registration.version,
    createdAt: registration.createdAt.toISOString(),
    updatedAt: registration.updatedAt.toISOString(),
  }
}

function mapReviewTournament(tournament: {
  id: string
  title: string
  organizerId: string
  status: RegistrationReviewTournament["status"]
  governanceStatus: RegistrationReviewTournament["governanceStatus"]
  capacity: number
}): RegistrationReviewTournament {
  return {
    id: tournament.id,
    title: tournament.title,
    organizerId: tournament.organizerId,
    status: tournament.status,
    governanceStatus: tournament.governanceStatus,
    capacity: tournament.capacity,
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function isPrismaUniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002"
}

function isPrismaSerializationConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034"
}
```

`listByTournament` อ่านใบสมัครพร้อมเจ้าของทีมและเฉพาะผู้เล่นที่ยังใช้งานอยู่ เรียงตามเวลาที่เพิ่ม เลือกเฉพาะ ID ชื่อ นามสกุล และเบอร์เสื้อ แล้วแปลงเป็นข้อมูลสำหรับหน้าจอ จำนวนผู้เล่นจึงตรงกับ roster ที่แสดง

จุดอ่าน: บรรทัด `171`

### ตัวแสดงสมาชิกทีม

ไฟล์ `components/organizer/registration-team-roster.tsx` บรรทัด **1–52**

```tsx
import type { RegistrationReviewPlayer } from "@/features/registrations/application/ports/registration-repository"

export function RegistrationTeamRoster({
  teamName,
  managerCoachName,
  players,
}: {
  teamName: string
  managerCoachName: string
  players: RegistrationReviewPlayer[]
}) {
  return (
    <details className="mt-4 border-t border-border pt-2">
      <summary
        aria-label={`ดูสมาชิกทีม ${teamName}`}
        className="min-h-9 cursor-pointer py-2 text-sm font-medium marker:text-court hover:text-court"
      >
        ดูสมาชิกทีม
      </summary>
      <div className="mt-2 space-y-3 pb-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">ผู้จัดการ/โค้ช</p>
          <p className="mt-1 break-words font-medium">{managerCoachName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">ผู้เล่น {players.length} คน</p>
          {players.length > 0 ? (
            <ul className="mt-2 divide-y divide-border border-t border-border">
              {players.map((player) => (
                <li
                  className="flex min-w-0 items-baseline justify-between gap-3 py-2"
                  key={player.id}
                >
                  <span className="min-w-0 break-words">
                    {player.firstName} {player.lastName}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {player.jerseyNumber === null
                      ? "ไม่มีเบอร์เสื้อ"
                      : `#${player.jerseyNumber}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-muted-foreground">ยังไม่มีผู้เล่นที่ใช้งานอยู่</p>
          )}
        </div>
      </div>
    </details>
  )
}
```

`RegistrationTeamRoster` เป็นส่วนแสดงผลแบบ `<details>` ที่เริ่มต้นพับอยู่ ผู้จัดกดเปิดดูผู้จัดการ/โค้ชและผู้เล่นของทีมนั้นได้ ถ้าไม่มีผู้เล่น active จะแสดงข้อความว่าง และไม่แสดงข้อมูลติดต่อหรือวันเกิด

จุดอ่าน: บรรทัด `13`

### เชื่อมเข้ารายการใบสมัคร

ไฟล์ `components/organizer/registration-review-list.tsx` บรรทัด **1–377**

```tsx
"use client"

import { useState } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Check, UserMinus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RegistrationTeamRoster } from "@/components/organizer/registration-team-roster"
import type { RegistrationReviewPlayer } from "@/features/registrations/application/ports/registration-repository"
import type { RegistrationStatus } from "@/features/registrations/domain/registration"

export interface RegistrationReviewListItem {
  id: string
  tournamentId: string
  teamId: string
  teamName: string
  province: string
  playerCount: number
  managerCoachCount: number
  managerCoachName: string
  players: RegistrationReviewPlayer[]
  submittedAt: string
  status: RegistrationStatus
  decisionNote: string | null
  version: number
}

type Confirmation =
  | { kind: "APPROVE"; registration: RegistrationReviewListItem }
  | { kind: "REJECT"; registration: RegistrationReviewListItem; reason: string }
  | { kind: "WITHDRAW"; registration: RegistrationReviewListItem; reason: string }

const statusLabels: Record<RegistrationStatus, string> = {
  PENDING: "รอพิจารณา",
  APPROVED: "อนุมัติ",
  REJECTED: "ปฏิเสธ",
  CANCELLED: "ยกเลิก",
  WITHDRAWN: "ถอนทีม",
}

export function RegistrationReviewList({
  registrations: initialRegistrations,
  tournamentId,
}: {
  registrations: RegistrationReviewListItem[]
  tournamentId: string
}) {
  const [registrations, setRegistrations] = useState(initialRegistrations)
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set())
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({})

  const statusCounts = Object.keys(statusLabels).map((status) => {
    const typedStatus = status as RegistrationStatus
    return {
      status: typedStatus,
      count: registrations.filter(
        (registration) => registration.status === typedStatus,
      ).length,
    }
  })

  function requestConfirmation(
    kind: Confirmation["kind"],
    registration: RegistrationReviewListItem,
  ) {
    if (kind === "APPROVE") {
      setConfirmation({ kind, registration })
      return
    }

    const reason = reasons[registration.id]?.trim() ?? ""
    if (!reason) {
      setFeedbackById((current) => ({
        ...current,
        [registration.id]: "กรุณาระบุเหตุผลก่อนยืนยัน",
      }))
      return
    }
    setConfirmation({ kind, registration, reason })
  }

  // ยืนยันบนหน้าจอแล้วส่ง POST ไป decision หรือ withdraw ตามคำสั่งที่ผู้จัดเลือก
  async function submitConfirmation() {
    const action = confirmation
    if (!action) return

    setConfirmation(null)
    setPendingIds((current) => {
      const next = new Set(current)
      next.add(action.registration.id)
      return next
    })
    setFeedbackById((current) => ({
      ...current,
      [action.registration.id]: "",
    }))
    try {
      const isWithdrawal = action.kind === "WITHDRAW"
      const response = await fetch(
        `/api/organizer/tournaments/${tournamentId}/registrations/${action.registration.id}/${isWithdrawal ? "withdraw" : "decision"}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            isWithdrawal
              ? {
                  reason: action.reason,
                  version: action.registration.version,
                }
              : {
                  decision: action.kind,
                  note: action.kind === "REJECT" ? action.reason : "",
                  version: action.registration.version,
                },
          ),
        },
      )
      const payload = (await response.json().catch(() => null)) as {
        registration?: Partial<RegistrationReviewListItem>
        message?: string
      } | null
      if (!response.ok || !payload?.registration) {
        throw new Error(payload?.message ?? "ไม่สามารถอัปเดตการสมัครได้")
      }

      setRegistrations((current) =>
        current.map((registration) =>
          registration.id === action.registration.id
            ? { ...registration, ...payload.registration }
            : registration,
        ),
      )
      setReasons((current) => ({ ...current, [action.registration.id]: "" }))
      setFeedbackById((current) => ({
        ...current,
        [action.registration.id]: "อัปเดตสถานะการสมัครแล้ว",
      }))
    } catch (error) {
      setFeedbackById((current) => ({
        ...current,
        [action.registration.id]:
          error instanceof Error
            ? error.message
            : "ไม่สามารถอัปเดตการสมัครได้",
      }))
    } finally {
      setPendingIds((current) => {
        const next = new Set(current)
        next.delete(action.registration.id)
        return next
      })
    }
  }

  return (
    <section className="border-t border-border pt-8">
      <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-5">
        {statusCounts.map(({ status, count }) => (
          <div className="bg-background px-3 py-3" key={status}>
            <p className="text-xs text-muted-foreground">{statusLabels[status]}</p>
            <p className="mt-1 text-lg font-semibold">
              {statusLabels[status]} {count}
            </p>
          </div>
        ))}
      </div>

      {registrations.length === 0 ? (
        <p className="border-b border-border py-8 text-sm text-muted-foreground">
          ยังไม่มีทีมสมัครแข่งขัน
        </p>
      ) : (
        <ul className="divide-y divide-border border-b border-border">
          {registrations.map((registration) => (
            <li
              className="grid min-w-0 gap-4 py-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(10rem,0.8fr)_minmax(14rem,1fr)]"
              key={registration.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="min-w-0 break-words text-base font-semibold">
                    {registration.teamName}
                  </h2>
                  <span className="text-xs font-medium text-court">
                    {statusLabels[registration.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {registration.province}
                </p>
                <p className="mt-1 text-sm">
                  ผู้เล่น {registration.playerCount} / ผู้จัดการ/โค้ช{" "}
                  {registration.managerCoachCount}
                </p>
                <RegistrationTeamRoster
                  managerCoachName={registration.managerCoachName}
                  players={registration.players}
                  teamName={registration.teamName}
                />
              </div>

              <div className="text-sm">
                <p className="text-xs text-muted-foreground">วันที่ส่งใบสมัคร</p>
                <p className="mt-1">{registration.submittedAt}</p>
                <p className="mt-3 text-xs text-muted-foreground">หมายเหตุ</p>
                <p className="mt-1 break-words">
                  {registration.decisionNote ?? "-"}
                </p>
              </div>

              <div className="min-w-0">
                {registration.status === "PENDING" ? (
                  <div className="grid gap-3">
                    <Button
                      aria-label={`อนุมัติ ${registration.teamName}`}
                      disabled={pendingIds.has(registration.id)}
                      onClick={() =>
                        requestConfirmation("APPROVE", registration)
                      }
                      type="button"
                    >
                      <Check aria-hidden="true" />
                      อนุมัติ
                    </Button>
                    <div className="grid gap-1.5">
                      <label
                        className="text-sm font-medium"
                        htmlFor={`reject-${registration.id}`}
                      >
                        เหตุผลการปฏิเสธ {registration.teamName}
                      </label>
                      <Input
                        id={`reject-${registration.id}`}
                        maxLength={500}
                        onChange={(event) =>
                          setReasons((current) => ({
                            ...current,
                            [registration.id]: event.target.value,
                          }))
                        }
                        value={reasons[registration.id] ?? ""}
                      />
                    </div>
                    <Button
                      aria-label={`ปฏิเสธ ${registration.teamName}`}
                      disabled={pendingIds.has(registration.id)}
                      onClick={() =>
                        requestConfirmation("REJECT", registration)
                      }
                      type="button"
                      variant="destructive"
                    >
                      <X aria-hidden="true" />
                      ปฏิเสธ
                    </Button>
                  </div>
                ) : registration.status === "APPROVED" ? (
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <label
                        className="text-sm font-medium"
                        htmlFor={`withdraw-${registration.id}`}
                      >
                        เหตุผลการถอนทีม {registration.teamName}
                      </label>
                      <Input
                        id={`withdraw-${registration.id}`}
                        maxLength={500}
                        onChange={(event) =>
                          setReasons((current) => ({
                            ...current,
                            [registration.id]: event.target.value,
                          }))
                        }
                        value={reasons[registration.id] ?? ""}
                      />
                    </div>
                    <Button
                      aria-label={`ถอนทีม ${registration.teamName}`}
                      disabled={pendingIds.has(registration.id)}
                      onClick={() =>
                        requestConfirmation("WITHDRAW", registration)
                      }
                      type="button"
                      variant="destructive"
                    >
                      <UserMinus aria-hidden="true" />
                      ถอนทีม
                    </Button>
                  </div>
                ) : null}
              </div>
              <p
                aria-live="polite"
                className="min-h-5 text-sm text-muted-foreground lg:col-span-3"
              >
                {feedbackById[registration.id] ?? ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <ConfirmationDialog
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
        onConfirm={submitConfirmation}
      />
    </section>
  )
}

function ConfirmationDialog({
  confirmation,
  onClose,
  onConfirm,
}: {
  confirmation: Confirmation | null
  onClose: () => void
  onConfirm: () => void
}) {
  const copy = confirmation
    ? {
        APPROVE: {
          title: "ยืนยันการอนุมัติ",
          description: `อนุมัติทีม ${confirmation.registration.teamName} เข้าร่วมการแข่งขัน`,
          confirm: "ยืนยันอนุมัติ",
        },
        REJECT: {
          title: "ยืนยันการปฏิเสธ",
          description: `ปฏิเสธทีม ${confirmation.registration.teamName}`,
          confirm: "ยืนยันปฏิเสธ",
        },
        WITHDRAW: {
          title: "ยืนยันการถอนทีม",
          description: `ถอนทีม ${confirmation.registration.teamName} จากการแข่งขัน`,
          confirm: "ยืนยันถอนทีม",
        },
      }[confirmation.kind]
    : null

  return (
    <DialogPrimitive.Root
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      open={confirmation !== null}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/20" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-5 shadow-lg">
          <DialogPrimitive.Title className="text-base font-semibold">
            {copy?.title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
            {copy?.description}
          </DialogPrimitive.Description>
          <div className="mt-5 flex justify-end gap-2">
            <DialogPrimitive.Close
              render={
                <Button type="button" variant="outline">
                  กลับ
                </Button>
              }
            />
            <Button onClick={onConfirm} type="button" variant="destructive">
              {copy?.confirm}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
```

`RegistrationReviewList` รับข้อมูลที่ use case เตรียมมา แล้วส่งชื่อทีม ชื่อผู้จัดการ/โค้ช และผู้เล่นให้ `RegistrationTeamRoster` ในแต่ละรายการ ปุ่มอนุมัติ/ปฏิเสธและสถานะเดิมไม่ได้เปลี่ยนพฤติกรรม

จุดอ่าน: บรรทัด `198`

### เทสต์ Prisma mapping

ไฟล์ `tests/features/registrations/prisma-registration-repository.test.ts` บรรทัด **1–797**

```ts
import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaRegistrationRepository } from "@/features/registrations/infrastructure/prisma-registration-repository"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"

function serializationConflict() {
  return Object.assign(new Error("write conflict"), { code: "P2034" })
}

const pendingRegistration: TournamentRegistration = {
  id: "registration-1",
  tournamentId: "tournament-1",
  teamId: "team-1",
  status: "PENDING",
  decisionNote: null,
  decidedAt: null,
  cancelledAt: null,
  withdrawnAt: null,
  version: 0,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
}

const teamRow = {
  id: "team-1",
  name: "Bangkok Hoops",
  provinceCode: "10",
  province: { nameTh: "Bangkok" },
  ownerId: "manager-1",
  format: "THREE_V_THREE" as const,
  isActive: false,
  deactivatedAt: new Date("2026-10-03T00:00:00.000Z"),
  version: 4,
}

function registrationRow(
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN",
  version: number,
) {
  return {
    id: pendingRegistration.id,
    tournamentId: pendingRegistration.tournamentId,
    teamId: pendingRegistration.teamId,
    status,
    decisionNote: status === "PENDING" ? null : "Reviewed",
    decidedAt: status === "PENDING" ? null : new Date("2026-10-02T00:00:00.000Z"),
    cancelledAt: null,
    withdrawnAt:
      status === "WITHDRAWN" ? new Date("2026-10-03T00:00:00.000Z") : null,
    version,
    createdAt: new Date(pendingRegistration.createdAt),
    updatedAt: new Date("2026-10-02T00:00:00.000Z"),
  }
}

function repositoryWithTransactionClient(client: object) {
  const transaction = vi.fn(
    async (operation: (transactionClient: never) => Promise<unknown>) =>
      operation(client as never),
  )
  return {
    repository: new PrismaRegistrationRepository({
      $transaction: transaction,
    } as unknown as PrismaClient),
    transaction,
  }
}

describe("PrismaRegistrationRepository transactions", () => {
  it.each([
    {
      operation: "create a registration",
      run: (repository: PrismaRegistrationRepository) =>
        repository.inTransaction((registrations) =>
          registrations.createPending({
            tournamentId: "tournament-1",
            teamId: "team-1",
            actorId: "manager-1",
            adminOverride: false,
          }),
        ),
    },
    {
      operation: "cancel a registration",
      run: (repository: PrismaRegistrationRepository) =>
        repository.inTransaction((registrations) =>
          registrations.cancelWithVersion(
            "registration-1",
            0,
            "manager-1",
            "2026-10-02T00:00:00.000Z",
            false,
          ),
        ),
    },
    {
      operation: "approve a registration",
      run: (repository: PrismaRegistrationRepository) =>
        repository.inTransaction((registrations) =>
          registrations.approveWithCapacity({
            before: pendingRegistration,
            version: 0,
            note: "",
            actorId: "organizer-1",
            at: "2026-10-02T00:00:00.000Z",
            adminOverride: false,
          }),
        ),
    },
    {
      operation: "reject a registration",
      run: (repository: PrismaRegistrationRepository) =>
        repository.inTransaction((registrations) =>
          registrations.rejectWithVersion({
            before: pendingRegistration,
            version: 0,
            note: "ไม่ผ่านเงื่อนไข",
            actorId: "organizer-1",
            at: "2026-10-02T00:00:00.000Z",
            adminOverride: false,
          }),
        ),
    },
    {
      operation: "withdraw a registration",
      run: (repository: PrismaRegistrationRepository) =>
        repository.inTransaction((registrations) =>
          registrations.withdrawWithVersion({
            before: { ...pendingRegistration, status: "APPROVED" },
            version: 0,
            reason: "ถอนทีม",
            actorId: "organizer-1",
            at: "2026-10-02T00:00:00.000Z",
            adminOverride: false,
          }),
        ),
    },
  ])(
    "locks and rechecks tournament governance before attempting to $operation",
    async ({ run }) => {
      const queryRaw = vi.fn(async () => [
        { id: "tournament-1", governanceStatus: "SUSPENDED", capacity: 8 },
      ])
      const create = vi.fn()
      const updateMany = vi.fn()
      const createAudit = vi.fn()
      const { repository } = repositoryWithTransactionClient({
        $queryRaw: queryRaw,
        registration: {
          create,
          updateMany,
          count: vi.fn(),
          findUnique: vi.fn(async () => registrationRow("PENDING", 0)),
        },
        auditLog: { create: createAudit },
      })

      await expect(run(repository)).rejects.toMatchObject({
        issues: ["TOURNAMENT_SUSPENDED"],
      })

      expect(queryRaw).toHaveBeenCalledOnce()
      const [lockQuery] = queryRaw.mock.calls[0]
      expect(lockQuery.text).toContain('FROM "Tournament"')
      expect(lockQuery.text).toMatch(/\bFOR\s+UPDATE\b/i)
      expect(create).not.toHaveBeenCalled()
      expect(updateMany).not.toHaveBeenCalled()
      expect(createAudit).not.toHaveBeenCalled()
    },
  )

  it("maps team compatibility fields for registration reads", async () => {
    const repository = new PrismaRegistrationRepository({
      team: { findUnique: vi.fn(async () => teamRow) },
    } as unknown as PrismaClient)

    await expect(repository.findTeam("team-1")).resolves.toEqual({
      id: "team-1",
      name: "Bangkok Hoops",
      provinceCode: "10",
      province: "Bangkok",
      ownerId: "manager-1",
      format: "THREE_V_THREE",
      isActive: false,
      deactivatedAt: "2026-10-03T00:00:00.000Z",
      version: 4,
    })
  })

  it("projects tournament progress fields when listing a team's registrations", async () => {
    const findMany = vi.fn(async () => [{
      ...registrationRow("APPROVED", 1),
      tournament: {
        title: "Bangkok Open",
        slug: "bangkok-open",
        status: "IN_PROGRESS" as const,
        governanceStatus: "ACTIVE" as const,
      },
    }])
    const repository = new PrismaRegistrationRepository({
      registration: { findMany },
    } as unknown as PrismaClient)

    await expect(repository.listByTeam("team-1")).resolves.toEqual([
      expect.objectContaining({
        tournamentName: "Bangkok Open",
        tournamentSlug: "bangkok-open",
        tournamentStatus: "IN_PROGRESS",
        tournamentGovernanceStatus: "ACTIVE",
      }),
    ])
    expect(findMany).toHaveBeenCalledWith({
      where: { teamId: "team-1" },
      include: {
        tournament: {
          select: {
            title: true,
            slug: true,
            status: true,
            governanceStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  })

  it("retries a serializable registration transaction after a PostgreSQL serialization conflict", async () => {
    let attempts = 0
    const transaction = vi.fn(async (
      operation: (client: never) => Promise<unknown>,
      _options: { isolationLevel?: string },
    ) => {
      expect(_options).toEqual({ isolationLevel: "Serializable" })
      attempts += 1
      if (attempts === 1) throw serializationConflict()
      return operation({} as never)
    })
    const repository = new PrismaRegistrationRepository({
      $transaction: transaction,
    } as unknown as PrismaClient)

    await expect(repository.inTransaction(async () => "created")).resolves.toBe("created")

    expect(transaction).toHaveBeenCalledTimes(2)
    expect(transaction).toHaveBeenLastCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" },
    )
  })

  it("maps exhausted PostgreSQL serialization retries to a recoverable conflict", async () => {
    const transaction = vi.fn(async () => {
      throw serializationConflict()
    })
    const repository = new PrismaRegistrationRepository({
      $transaction: transaction,
    } as unknown as PrismaClient)

    await expect(repository.inTransaction(async () => "created")).rejects.toThrow("CONFLICT")
    expect(transaction).toHaveBeenCalledTimes(3)
  })

  it.each([
    {
      operation: "createPending",
      run: (repository: PrismaRegistrationRepository) =>
        repository.createPending({
          tournamentId: "tournament-1",
          teamId: "team-1",
          actorId: "manager-1",
          adminOverride: false,
        }),
    },
    {
      operation: "cancelWithVersion",
      run: (repository: PrismaRegistrationRepository) =>
        repository.cancelWithVersion(
          "registration-1",
          0,
          "manager-1",
          "2026-10-02T00:00:00.000Z",
          false,
        ),
    },
    {
      operation: "approveWithCapacity",
      run: (repository: PrismaRegistrationRepository) =>
        repository.approveWithCapacity({
          before: pendingRegistration,
          version: 0,
          note: "",
          actorId: "organizer-1",
          at: "2026-10-02T00:00:00.000Z",
          adminOverride: false,
        }),
    },
    {
      operation: "rejectWithVersion",
      run: (repository: PrismaRegistrationRepository) =>
        repository.rejectWithVersion({
          before: pendingRegistration,
          version: 0,
          note: "ไม่ผ่านเงื่อนไข",
          actorId: "organizer-1",
          at: "2026-10-02T00:00:00.000Z",
          adminOverride: false,
        }),
    },
    {
      operation: "withdrawWithVersion",
      run: (repository: PrismaRegistrationRepository) =>
        repository.withdrawWithVersion({
          before: { ...pendingRegistration, status: "APPROVED" },
          version: 0,
          reason: "ถอนทีม",
          actorId: "organizer-1",
          at: "2026-10-02T00:00:00.000Z",
          adminOverride: false,
        }),
    },
  ])("wraps direct $operation calls in a serializable transaction", async ({ run }) => {
    const prisma = {
      $queryRaw: vi.fn(async () => [
        { id: "tournament-1", governanceStatus: "ACTIVE", capacity: 8 },
      ]),
      registration: {
        create: vi.fn(async () => registrationRow("PENDING", 0)),
        updateMany: vi.fn(async () => ({ count: 1 })),
        count: vi.fn(async () => 0),
        findUnique: vi.fn(async () => registrationRow("PENDING", 0)),
      },
      auditLog: { create: vi.fn(async () => undefined) },
      $transaction: vi.fn(
        async (operation: (client: unknown) => Promise<unknown>) =>
          operation(prisma),
      ),
    }
    const repository = new PrismaRegistrationRepository(
      prisma as unknown as PrismaClient,
    )

    await run(repository)

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: "Serializable",
    })
  })

  it("locks application eligibility and counts approved teams in the same transaction", async () => {
    const queryRaw = vi
      .fn()
      .mockResolvedValueOnce([{ id: "team-1" }])
      .mockResolvedValueOnce([
        {
          id: "tournament-1",
          format: "FIVE_V_FIVE",
          ageGroup: "U18",
          startsAt: new Date("2026-11-15T02:00:00.000Z"),
          status: "PUBLISHED",
          governanceStatus: "SUSPENDED",
          registrationDeadline: new Date("2026-11-01T00:00:00.000Z"),
          capacity: 8,
        },
      ])
      .mockResolvedValueOnce([])
    const player = {
      id: "team-player-1",
      teamId: "team-1",
      firstName: "Player",
      lastName: "One",
      nickname: null,
      birthDate: new Date("2008-01-01T00:00:00.000Z"),
      jerseyNumber: 1,
      position: "PG" as const,
      phone: null,
      isActive: true,
      deactivatedAt: null,
      createdAt: new Date("2026-08-07T00:00:00.000Z"),
      updatedAt: new Date("2026-08-07T00:00:00.000Z"),
    }
    const count = vi.fn(async () => 7)
    const { repository } = repositoryWithTransactionClient({
      $queryRaw: queryRaw,
      team: { findUnique: vi.fn(async () => teamRow) },
      teamPlayer: { findMany: vi.fn(async () => [player]) },
      registration: { count },
    })

    const context = await repository.inTransaction((registrations) =>
      registrations.getApplicationContext("tournament-1", "team-1"),
    )

    expect(queryRaw).toHaveBeenCalledTimes(3)
    expect(queryRaw.mock.calls[0][0].text).toMatch(/\bFOR\s+UPDATE\b/i)
    expect(queryRaw.mock.calls[0][0].text).toContain('FROM "Team"')
    expect(queryRaw.mock.calls[1][0].text).toMatch(/\bFOR\s+UPDATE\b/i)
    expect(queryRaw.mock.calls[1][0].text).toContain('FROM "Tournament"')
    expect(queryRaw.mock.calls[2][0].text).toMatch(/\bFOR\s+UPDATE\b/i)
    expect(queryRaw.mock.calls[2][0].text).toContain('FROM "TeamPlayer"')
    expect(context?.roster).toEqual([
      {
        id: "team-player-1",
        teamId: "team-1",
        firstName: "Player",
        lastName: "One",
        nickname: null,
        birthDate: "2008-01-01",
        jerseyNumber: 1,
        position: "PG",
        phone: null,
        isActive: true,
        deactivatedAt: null,
        createdAt: "2026-08-07T00:00:00.000Z",
        updatedAt: "2026-08-07T00:00:00.000Z",
      },
    ])
    expect(count).toHaveBeenCalledWith({
      where: { tournamentId: "tournament-1", status: "APPROVED" },
    })
    expect(context?.tournament).toMatchObject({
      ageGroup: "U18",
      startsAt: "2026-11-15T02:00:00.000Z",
      governanceStatus: "SUSPENDED",
      capacity: 8,
      approvedCount: 7,
    })
  })

  it("projects governance status for cancellation and review contexts", async () => {
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({
        ...registrationRow("PENDING", 0),
        team: teamRow,
        tournament: { governanceStatus: "SUSPENDED" },
      })
      .mockResolvedValueOnce({
        ...registrationRow("PENDING", 0),
        tournament: {
          id: "tournament-1",
          title: "Bangkok Open",
          organizerId: "organizer-1",
          status: "PUBLISHED",
          governanceStatus: "REMOVED",
          capacity: 8,
        },
      })
    const repository = new PrismaRegistrationRepository({
      registration: { findUnique },
    } as unknown as PrismaClient)

    await expect(repository.findById("registration-1")).resolves.toMatchObject({
      tournament: { governanceStatus: "SUSPENDED" },
    })
    await expect(
      repository.findReviewContext("registration-1"),
    ).resolves.toMatchObject({
      tournament: { governanceStatus: "REMOVED" },
    })
  })

  it("summarizes active TeamPlayer rows and the owning manager/coach", async () => {
    const registration = registrationRow("PENDING", 0)
    const findMany = vi.fn(async () => [
      {
        ...registration,
        team: {
          ...teamRow,
          isActive: true,
          deactivatedAt: null,
          owner: { displayName: "Coach May" },
          players: [
            {
              id: "player-1",
              firstName: "Anan",
              lastName: "Suk",
              jerseyNumber: 7,
            },
            {
              id: "player-2",
              firstName: "Niran",
              lastName: "Dee",
              jerseyNumber: null,
            },
          ],
        },
      },
    ])
    const repository = new PrismaRegistrationRepository({
      registration: { findMany },
    } as unknown as PrismaClient)

    await expect(repository.listByTournament("tournament-1")).resolves.toEqual([
      expect.objectContaining({
        playerCount: 2,
        managerCoachCount: 1,
        managerCoachName: "Coach May",
        players: [
          { id: "player-1", firstName: "Anan", lastName: "Suk", jerseyNumber: 7 },
          { id: "player-2", firstName: "Niran", lastName: "Dee", jerseyNumber: null },
        ],
      }),
    ])
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          team: {
            include: {
              province: true,
              players: {
                where: { isActive: true },
                orderBy: { createdAt: "asc" },
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  jerseyNumber: true,
                },
              },
              owner: { select: { displayName: true } },
            },
          },
        },
      }),
    )
  })

  it("writes a distinct admin override audit for application and cancellation", async () => {
    const created = registrationRow("PENDING", 0)
    const cancelled = {
      ...created,
      status: "CANCELLED" as const,
      cancelledAt: new Date("2026-10-02T00:00:00.000Z"),
      version: 1,
    }
    const registration = {
      create: vi.fn(async () => created),
      updateMany: vi.fn(async () => ({ count: 1 })),
      findUnique: vi.fn(async () => cancelled),
    }
    const createAudit = vi.fn(async () => undefined)
    const { repository } = repositoryWithTransactionClient({
      $queryRaw: vi.fn(async () => [
        { id: "tournament-1", governanceStatus: "ACTIVE", capacity: 8 },
      ]),
      registration,
      auditLog: { create: createAudit },
    })

    await repository.inTransaction((registrations) =>
      registrations.createPending({
        tournamentId: "tournament-1",
        teamId: "team-1",
        actorId: "admin-1",
        adminOverride: true,
      }),
    )
    await repository.inTransaction((registrations) =>
      registrations.cancelWithVersion(
        "registration-1",
        0,
        "admin-1",
        "2026-10-02T00:00:00.000Z",
        true,
      ),
    )

    expect(createAudit.mock.calls.map(([input]) => input.data.action)).toEqual([
      "registration.created",
      "registration.admin_override",
      "registration.cancelled",
      "registration.admin_override",
    ])
  })

  it("locks the tournament and rejects approval deterministically at capacity", async () => {
    const lockTournament = vi.fn(async () => [
      { id: "tournament-1", governanceStatus: "ACTIVE", capacity: 1 },
    ])
    const count = vi.fn(async () => 1)
    const updateMany = vi.fn()
    const createAudit = vi.fn()
    const { repository } = repositoryWithTransactionClient({
      $queryRaw: lockTournament,
      registration: { count, updateMany },
      auditLog: { create: createAudit },
    })

    await expect(
      repository.inTransaction((registrations) =>
        registrations.approveWithCapacity({
          before: pendingRegistration,
          version: 0,
          note: "",
          actorId: "organizer-1",
          at: "2026-10-02T00:00:00.000Z",
          adminOverride: false,
        }),
      ),
    ).rejects.toThrow("TOURNAMENT_CAPACITY_REACHED")

    expect(lockTournament).toHaveBeenCalledOnce()
    const [lockQuery] = lockTournament.mock.calls[0]
    expect(lockQuery.text).toMatch(/\bFOR\s+UPDATE\b/i)
    expect(lockQuery.values).toEqual(["tournament-1"])
    expect(count).toHaveBeenCalledWith({
      where: { tournamentId: "tournament-1", status: "APPROVED" },
    })
    expect(updateMany).not.toHaveBeenCalled()
    expect(createAudit).not.toHaveBeenCalled()
  })

  it("conditionally approves a pending version and audits after the capacity lock", async () => {
    const lockTournament = vi.fn(async () => [
      { id: "tournament-1", governanceStatus: "ACTIVE", capacity: 2 },
    ])
    const count = vi.fn(async () => 1)
    const updateMany = vi.fn(async () => ({ count: 1 }))
    const findUnique = vi.fn(async () => registrationRow("APPROVED", 1))
    const createAudit = vi.fn(async () => undefined)
    const { repository } = repositoryWithTransactionClient({
      $queryRaw: lockTournament,
      registration: { count, updateMany, findUnique },
      auditLog: { create: createAudit },
    })

    await repository.inTransaction((registrations) =>
      registrations.approveWithCapacity({
        before: pendingRegistration,
        version: 0,
        note: "",
        actorId: "organizer-1",
        at: "2026-10-02T00:00:00.000Z",
        adminOverride: false,
      }),
    )

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "registration-1",
        tournamentId: "tournament-1",
        status: "PENDING",
        version: 0,
      },
      data: {
        status: "APPROVED",
        decisionNote: null,
        decidedAt: new Date("2026-10-02T00:00:00.000Z"),
        version: { increment: 1 },
      },
    })
    expect(createAudit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "organizer-1",
        action: "registration.approved",
        beforeJson: expect.anything(),
        afterJson: expect.anything(),
      }),
    })
    expect(lockTournament.mock.invocationCallOrder[0]).toBeLessThan(
      count.mock.invocationCallOrder[0],
    )
    expect(count.mock.invocationCallOrder[0]).toBeLessThan(
      updateMany.mock.invocationCallOrder[0],
    )
    expect(updateMany.mock.invocationCallOrder[0]).toBeLessThan(
      createAudit.mock.invocationCallOrder[0],
    )
  })

  it.each([
    {
      operation: "rejectWithVersion" as const,
      sourceStatus: "PENDING",
      nextStatus: "REJECTED",
      action: "registration.rejected",
      input: { note: "Not eligible" },
    },
    {
      operation: "withdrawWithVersion" as const,
      sourceStatus: "APPROVED",
      nextStatus: "WITHDRAWN",
      action: "registration.withdrawn",
      input: { reason: "Eligibility issue" },
    },
  ])(
    "updates only the submitted version from $sourceStatus to $nextStatus",
    async ({ operation, sourceStatus, nextStatus, action, input }) => {
      const before = {
        ...pendingRegistration,
        status: sourceStatus as "PENDING" | "APPROVED",
        version: sourceStatus === "APPROVED" ? 1 : 0,
      }
      const updateMany = vi.fn(async () => ({ count: 1 }))
      const findUnique = vi.fn(async () =>
        registrationRow(nextStatus as "REJECTED" | "WITHDRAWN", before.version + 1),
      )
      const createAudit = vi.fn(async () => undefined)
      const { repository } = repositoryWithTransactionClient({
        $queryRaw: vi.fn(async () => [
          { id: "tournament-1", governanceStatus: "ACTIVE", capacity: 8 },
        ]),
        registration: { updateMany, findUnique },
        auditLog: { create: createAudit },
      })

      await repository.inTransaction((registrations) => {
        const mutationInput = {
          before,
          version: before.version,
          actorId: "organizer-1",
          at: "2026-10-03T00:00:00.000Z",
          adminOverride: false,
        }
        return operation === "rejectWithVersion"
          ? registrations.rejectWithVersion({
              ...mutationInput,
              note: input.note ?? "",
            })
          : registrations.withdrawWithVersion({
              ...mutationInput,
              reason: input.reason ?? "",
            })
      })

      expect(updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "registration-1",
            status: sourceStatus,
            version: before.version,
          },
          data: expect.objectContaining({
            status: nextStatus,
            version: { increment: 1 },
          }),
        }),
      )
      expect(createAudit).toHaveBeenCalledWith({
        data: expect.objectContaining({ action }),
      })
    },
  )

  it("aborts the registration decision when its audit write fails", async () => {
    let persistedStatus = "PENDING"
    const client = {
      $queryRaw: vi.fn(async () => [
        { id: "tournament-1", governanceStatus: "ACTIVE", capacity: 2 },
      ]),
      registration: {
        count: vi.fn(async () => 0),
        updateMany: vi.fn(async () => {
          persistedStatus = "APPROVED"
          return { count: 1 }
        }),
        findUnique: vi.fn(async () => registrationRow("APPROVED", 1)),
      },
      auditLog: {
        create: vi.fn(async () => {
          throw new Error("AUDIT_FAILED")
        }),
      },
    }
    const transaction = vi.fn(
      async (operation: (transactionClient: never) => Promise<unknown>) => {
        const before = persistedStatus
        try {
          return await operation(client as never)
        } catch (error) {
          persistedStatus = before
          throw error
        }
      },
    )
    const repository = new PrismaRegistrationRepository({
      $transaction: transaction,
    } as unknown as PrismaClient)

    await expect(
      repository.inTransaction((registrations) =>
        registrations.approveWithCapacity({
          before: pendingRegistration,
          version: 0,
          note: "",
          actorId: "organizer-1",
          at: "2026-10-02T00:00:00.000Z",
          adminOverride: false,
        }),
      ),
    ).rejects.toThrow("AUDIT_FAILED")

    expect(persistedStatus).toBe("PENDING")
  })
})
```

เทสต์จำลองผล query และยืนยันว่าหน้าใบสมัครได้ชื่อเจ้าของทีม รายชื่อผู้เล่น และเบอร์เสื้อตรงตามข้อมูล รวมถึงยืนยันเงื่อนไขเลือกเฉพาะผู้เล่น active และฟิลด์ที่จำเป็น

จุดอ่าน: บรรทัด `499`

### เทสต์หน้าจอ

ไฟล์ `tests/ui/organizer/registration-review-list.test.tsx` บรรทัด **1–317**

```tsx
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { RegistrationReviewList } from "@/components/organizer/registration-review-list"

const pending = {
  id: "registration-1",
  tournamentId: "tournament-1",
  teamId: "team-1",
  teamName: "Bangkok Ballers",
  province: "Bangkok",
  playerCount: 5,
  managerCoachCount: 1,
  managerCoachName: "Coach May",
  players: Array.from({ length: 5 }, (_, index) => ({
    id: `player-${index + 1}`,
    firstName: index === 0 ? "Anan" : `Player ${index + 1}`,
    lastName: index === 0 ? "Suk" : "Test",
    jerseyNumber: index === 0 ? 7 : null,
  })),
  submittedAt: "1 ต.ค. 2569",
  status: "PENDING" as const,
  decisionNote: null,
  version: 0,
}

const approved = {
  ...pending,
  id: "registration-2",
  teamId: "team-2",
  teamName: "Chiang Mai Hoops",
  province: "Chiang Mai",
  submittedAt: "2 ต.ค. 2569",
  status: "APPROVED" as const,
  version: 1,
}

const secondPending = {
  ...pending,
  id: "registration-3",
  teamId: "team-3",
  teamName: "Phuket Waves",
  province: "Phuket",
  submittedAt: "3 ต.ค. 2569",
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((fulfill) => {
    resolve = fulfill
  })
  return { promise, resolve }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("RegistrationReviewList", () => {
  it("reveals only the selected team's current roster on demand", async () => {
    const user = userEvent.setup()
    render(
      <RegistrationReviewList
        registrations={[pending, approved]}
        tournamentId="tournament-1"
      />,
    )

    const row = screen.getByText("Bangkok Ballers").closest("li")
    if (!row) throw new Error("Expected registration row")
    const disclosure = within(row).getByText("ดูสมาชิกทีม").closest("details")
    if (!disclosure) throw new Error("Expected roster disclosure")

    expect(disclosure.hasAttribute("open")).toBe(false)
    await user.click(within(row).getByText("ดูสมาชิกทีม"))

    expect(disclosure.hasAttribute("open")).toBe(true)
    expect(within(disclosure).getByText("Coach May")).toBeTruthy()
    expect(within(disclosure).getByText("Anan Suk")).toBeTruthy()
    expect(within(disclosure).getByText("#7")).toBeTruthy()
    expect(within(disclosure).queryByText(/โทรศัพท์|วันเกิด/)).toBeNull()
  })

  it("explains when an applicant team has no active players", async () => {
    const user = userEvent.setup()
    render(
      <RegistrationReviewList
        registrations={[{ ...pending, players: [], playerCount: 0 }]}
        tournamentId="tournament-1"
      />,
    )

    await user.click(screen.getByText("ดูสมาชิกทีม"))
    expect(screen.getByText("ยังไม่มีผู้เล่นที่ใช้งานอยู่")).toBeTruthy()
  })

  it("shows status counts and structured roster details", () => {
    render(
      <RegistrationReviewList
        registrations={[pending, approved]}
        tournamentId="tournament-1"
      />,
    )

    expect(screen.getByText("รอพิจารณา 1")).toBeTruthy()
    expect(screen.getByText("อนุมัติ 1")).toBeTruthy()
    expect(screen.getByText("Bangkok")).toBeTruthy()
    expect(screen.getAllByText("ผู้เล่น 5 / ผู้จัดการ/โค้ช 1")).toHaveLength(2)
  })

  it("requires explicit confirmation before approving", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        registration: { ...pending, status: "APPROVED", version: 1 },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <RegistrationReviewList
        registrations={[pending]}
        tournamentId="tournament-1"
      />,
    )

    await user.click(
      screen.getByRole("button", { name: "อนุมัติ Bangkok Ballers" }),
    )
    expect(fetchMock).not.toHaveBeenCalled()

    const dialog = screen.getByRole("dialog", { name: "ยืนยันการอนุมัติ" })
    await user.click(
      within(dialog).getByRole("button", { name: "ยืนยันอนุมัติ" }),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/registrations/registration-1/decision",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ decision: "APPROVE", note: "", version: 0 }),
      }),
    )
  })

  it("requires a labelled reason and confirmation before rejecting", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        registration: {
          ...pending,
          status: "REJECTED",
          decisionNote: "ข้อมูลไม่ครบ",
          version: 1,
        },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <RegistrationReviewList
        registrations={[pending]}
        tournamentId="tournament-1"
      />,
    )

    await user.type(
      screen.getByLabelText("เหตุผลการปฏิเสธ Bangkok Ballers"),
      "ข้อมูลไม่ครบ",
    )
    await user.click(
      screen.getByRole("button", { name: "ปฏิเสธ Bangkok Ballers" }),
    )
    expect(fetchMock).not.toHaveBeenCalled()

    await user.click(
      within(
        screen.getByRole("dialog", { name: "ยืนยันการปฏิเสธ" }),
      ).getByRole("button", { name: "ยืนยันปฏิเสธ" }),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/registrations/registration-1/decision",
      expect.objectContaining({
        body: JSON.stringify({
          decision: "REJECT",
          note: "ข้อมูลไม่ครบ",
          version: 0,
        }),
      }),
    )
  })

  it("requires a labelled reason and confirmation before withdrawal", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        registration: {
          ...approved,
          status: "WITHDRAWN",
          decisionNote: "ผิดเงื่อนไข",
          version: 2,
        },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <RegistrationReviewList
        registrations={[approved]}
        tournamentId="tournament-1"
      />,
    )

    await user.type(
      screen.getByLabelText("เหตุผลการถอนทีม Chiang Mai Hoops"),
      "ผิดเงื่อนไข",
    )
    await user.click(
      screen.getByRole("button", { name: "ถอนทีม Chiang Mai Hoops" }),
    )
    expect(fetchMock).not.toHaveBeenCalled()

    await user.click(
      within(
        screen.getByRole("dialog", { name: "ยืนยันการถอนทีม" }),
      ).getByRole("button", { name: "ยืนยันถอนทีม" }),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/registrations/registration-2/withdraw",
      expect.objectContaining({
        body: JSON.stringify({ reason: "ผิดเงื่อนไข", version: 1 }),
      }),
    )
  })

  it("keeps concurrent row actions and feedback independent when responses resolve out of order", async () => {
    const firstResponse = deferred<Response>()
    const secondResponse = deferred<Response>()
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockReturnValueOnce(firstResponse.promise)
        .mockReturnValueOnce(secondResponse.promise),
    )
    const user = userEvent.setup()

    render(
      <RegistrationReviewList
        registrations={[pending, secondPending]}
        tournamentId="tournament-1"
      />,
    )

    const firstRow = screen.getByText("Bangkok Ballers").closest("li")
    const secondRow = screen.getByText("Phuket Waves").closest("li")
    if (!firstRow || !secondRow) throw new Error("Expected registration rows")
    const firstApprove = within(firstRow).getByRole("button", {
      name: "อนุมัติ Bangkok Ballers",
    })
    const secondApprove = within(secondRow).getByRole("button", {
      name: "อนุมัติ Phuket Waves",
    })

    await submitApproval(user, firstApprove)
    await submitApproval(user, secondApprove)

    expect(firstApprove).toHaveProperty("disabled", true)
    expect(secondApprove).toHaveProperty("disabled", true)

    await act(async () => {
      secondResponse.resolve(
        Response.json({ message: "Phuket decision failed" }, { status: 409 }),
      )
    })

    await waitFor(() => {
      expect(firstApprove).toHaveProperty("disabled", true)
      expect(secondApprove).toHaveProperty("disabled", false)
      expect(within(secondRow).getByText("Phuket decision failed")).toBeTruthy()
    })
    expect(within(firstRow).queryByText("Phuket decision failed")).toBeNull()

    await act(async () => {
      firstResponse.resolve(
        Response.json({
          registration: { ...pending, status: "APPROVED", version: 1 },
        }),
      )
    })

    await waitFor(() => {
      expect(
        within(firstRow).getByText("อัปเดตสถานะการสมัครแล้ว"),
      ).toBeTruthy()
      expect(within(secondRow).getByText("Phuket decision failed")).toBeTruthy()
    })
    expect(firstRow.querySelector('[aria-live="polite"]')).not.toBeNull()
    expect(secondRow.querySelector('[aria-live="polite"]')).not.toBeNull()
  })
})

async function submitApproval(
  user: ReturnType<typeof userEvent.setup>,
  button: HTMLElement,
) {
  await user.click(button)
  await user.click(
    within(
      screen.getByRole("dialog", { name: "ยืนยันการอนุมัติ" }),
    ).getByRole("button", { name: "ยืนยันอนุมัติ" }),
  )
}
```

เทสต์เปิดส่วน `ดูสมาชิกทีม` แล้วตรวจชื่อและรายชื่อที่แสดง ตรวจไม่เผยข้อมูลที่ไม่ได้เลือก และตรวจข้อความเมื่อทีมไม่มีผู้เล่น active

จุดอ่าน: บรรทัด `96`

## การตรวจที่ทำแล้ว

- เทสต์เฉพาะ Prisma repository และหน้าจอผ่าน **30/30** เคส ณ วันที่อัปเดตเอกสาร: `npm run test -- tests/features/registrations/prisma-registration-repository.test.ts tests/ui/organizer/registration-review-list.test.tsx`
- `npm run lint` และ `npm run build` ผ่าน
- เทสต์รวมผ่าน **1,194/1,195** เคส; `tests/ui/organizer/external-match-purpose-control.test.tsx` ล้มตอนรันพร้อมชุดใหญ่เพราะคาดว่า `fetch` จะถูกเรียก แต่ไม่ถูกเรียกภายในเวลาที่รอ เคสเดียวกันผ่าน **1/1** เมื่อรันแยก จึงยังไม่ถือว่าชุดรวมผ่านทั้งหมด และปัญหานี้อยู่นอกฟีเจอร์สมาชิกทีมที่เอกสารนี้อธิบาย
- การอัปเดตครั้งนี้แก้เฉพาะคู่มือ ไม่เปลี่ยนการทำงานของระบบ และไม่ได้อ้างว่าทดสอบเว็บจริงในรอบเอกสารนี้

## ข้อจำกัดและความเป็นส่วนตัว

- แสดงเฉพาะผู้เล่น active ณ เวลาที่เปิดหน้า ถ้ามีการแก้สมาชิกทีมภายหลัง รายชื่อที่ผู้จัดเห็นจะเปลี่ยนตาม; หากต้องการล็อกรายชื่อวันสมัครต้องออกแบบ snapshot เพิ่ม
- ชื่อผู้จัดการ/โค้ชคือเจ้าของทีมคนเดียวตามโมเดลปัจจุบัน ไม่ใช่ staff หลายคน
- ไม่เลือกหรือแสดงเบอร์โทร อีเมล วันเกิด และข้อมูลบัญชีล็อกอินของผู้เล่น
- ไม่เปลี่ยน schema, migration, กติกาสิทธิ์ การตัดสินใบสมัคร หรือวิธีสมัครแข่งขัน
