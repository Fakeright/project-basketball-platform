import type { Actor } from "@/features/identity/domain/actor"
import { submitTournament } from "@/features/tournament-operations/application/create-tournament"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"

export async function submitTournamentHandler({
  actor,
  id,
  repository,
}: {
  actor: Actor | null
  id: string
  repository: TournamentOperationsRepository
}) {
  if (!actor) {
    return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
  }

  try {
    const tournament = await submitTournament(repository, id, actor)
    return Response.json({ tournament })
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN"
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : code === "CONFLICT" ? 409 : code === "INVALID_SUBMIT_STATUS" ? 422 : 500
    return Response.json(
      { message: status === 422 ? "รายการนี้ยังไม่พร้อมส่งตรวจสอบ" : "ไม่สามารถส่งรายการตรวจสอบได้" },
      { status },
    )
  }
}
