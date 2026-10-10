import type { Actor } from "@/features/identity/domain/actor"
import {
  parseJsonRequest,
  type SafeHttpDiagnostics,
  unexpectedFailureResponse,
} from "@/features/shared/presentation/safe-http"
import {
  createTournament,
  updateTournament,
} from "@/features/tournament-operations/application/create-tournament"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"
import { tournamentGovernanceFailureResponse } from "@/features/tournament-operations/presentation/tournament-governance-error-response"

import { tournamentEditorSchema } from "./tournament-editor-schema"

interface SaveTournamentHandlerInput extends SafeHttpDiagnostics {
  actor: Actor | null
  request: Request
  repository: TournamentOperationsRepository
  id?: string
}

export async function saveTournamentHandler(
  input: SaveTournamentHandlerInput,
) {
  const { actor, request, repository, id } = input
  if (!actor) {
    return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
  }

  try {
    const payload = await parseJsonRequest(request)
    if (!payload.ok) {
      return Response.json({ message: "ข้อมูลไม่ถูกต้อง" }, { status: 422 })
    }

    const parsed = tournamentEditorSchema.safeParse(payload.value)
    if (!parsed.success) {
      return Response.json(
        { message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 422 },
      )
    }

    const { version, ...input } = parsed.data
    const tournament = id
      ? await updateTournament(
          repository,
          id,
          { ...input, version: version ?? 0 },
          actor,
        )
      : await createTournament(repository, input, actor)

    return Response.json({ tournament }, { status: id ? 200 : 201 })
  } catch (error) {
    return (
      tournamentGovernanceFailureResponse(error) ??
      saveTournamentFailureResponse(error) ??
      unexpectedFailureResponse(error, "tournament.save", input)
    )
  }
}

function saveTournamentFailureResponse(error: unknown): Response | null {
  const code = error instanceof Error ? error.message : "UNKNOWN"
  const status =
    code === "FORBIDDEN"
      ? 403
      : code === "NOT_FOUND"
        ? 404
        : code === "CONFLICT"
          ? 409
          : code.startsWith("FIELD_REQUIRED") || code.includes("INVALID")
            ? 422
            : null

  if (!status) return null

  return Response.json(
    {
      message:
        status === 409
          ? "ข้อมูลถูกแก้ไขจากอีกหน้าต่าง กรุณาโหลดใหม่"
          : "ไม่สามารถบันทึกรายการได้",
    },
    { status },
  )
}
