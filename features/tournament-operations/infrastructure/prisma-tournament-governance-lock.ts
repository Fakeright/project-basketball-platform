/**
 * COURTSIDE: คำอธิบายไฟล์
 * ล็อกแถวรายการก่อนเปลี่ยนข้อมูล และปฏิเสธการทำงานเมื่อรายการถูกระงับหรือไม่พร้อม
 * เรียกใช้จาก: features/competition/infrastructure/prisma-competition-repository.ts, features/competition/infrastructure/prisma-external-bracket-repository.ts
 * ตามการทำงานต่อ: lib/generated/prisma/client.ts, features/tournament-operations/domain/tournament-governance-policy.ts
 */

import { Prisma } from "@/lib/generated/prisma/client"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"
import type { TournamentGovernanceStatus } from "@/features/tournament-operations/domain/tournament-governance-policy"

type TournamentLockClient = Pick<Prisma.TransactionClient, "$queryRaw">

interface LockedTournamentGovernanceRow {
  id: string
  governanceStatus: TournamentGovernanceStatus
  capacity: number
}

// ล็อกสถานะการกำกับของรายการก่อนทำคำสั่งที่ต้องตัดสินจากสถานะล่าสุด
export async function lockTournamentGovernanceRow(
  transaction: TournamentLockClient,
  tournamentId: string,
): Promise<LockedTournamentGovernanceRow> {
  const rows = await transaction.$queryRaw<LockedTournamentGovernanceRow[]>(
    Prisma.sql`
      SELECT "id", "governanceStatus", "capacity"
      FROM "Tournament"
      WHERE "id" = ${tournamentId}
      FOR UPDATE
    `,
  )
  const tournament = rows[0]
  if (!tournament) throw new Error("NOT_FOUND")
  return tournament
}

// ล็อกและตรวจว่ารายการอนุญาตให้แก้ข้อมูลก่อนคืนบริบทให้ repository
export async function lockActiveTournamentForMutation(
  transaction: TournamentLockClient,
  tournamentId: string,
): Promise<LockedTournamentGovernanceRow> {
  const tournament = await lockTournamentGovernanceRow(
    transaction,
    tournamentId,
  )
  assertTournamentGovernanceAllowsOperation(tournament.governanceStatus)
  return tournament
}
