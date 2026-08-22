import { TournamentGovernancePolicyError } from "@/features/tournament-operations/domain/tournament-governance-policy"

export function tournamentGovernanceFailureResponse(error: unknown) {
  if (!(error instanceof TournamentGovernancePolicyError)) return null

  return Response.json(
    {
      message: "รายการแข่งขันถูกระงับหรือถูกนำออก กรุณาตรวจสอบสถานะล่าสุด",
      issues: error.issues,
    },
    { status: 409 },
  )
}
