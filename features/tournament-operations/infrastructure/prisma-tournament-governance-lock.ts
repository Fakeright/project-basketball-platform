import { Prisma } from "@/lib/generated/prisma/client"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"
import type { TournamentGovernanceStatus } from "@/features/tournament-operations/domain/tournament-governance-policy"

type TournamentLockClient = Pick<Prisma.TransactionClient, "$queryRaw">

interface LockedTournamentGovernanceRow {
  id: string
  governanceStatus: TournamentGovernanceStatus
  capacity: number
}

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
