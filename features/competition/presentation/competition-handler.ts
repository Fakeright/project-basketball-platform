import { z } from "zod"

import type { LockedCompetitionWorkspace } from "@/features/competition/application/ports/competition-repository"
import type { PersistedCompetitionBracket } from "@/features/competition/application/ports/competition-repository"
import type { GenerateBracketDraftInput } from "@/features/competition/application/generate-bracket"
import type { Actor, CurrentActorProvider } from "@/features/identity/domain/actor"
import {
  parseJsonRequest,
  type SafeHttpDiagnostics,
  withSafeRouteBoundary,
} from "@/features/shared/presentation/safe-http"

const lockEntriesSchema = z.object({
  expectedVersion: z.number().int().nonnegative(),
})

const generateBracketSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("SEEDED"),
    expectedVersion: z.number().int().nonnegative(),
    seeds: z
      .array(
        z.object({
          entryId: z.string().trim().min(1),
          seed: z.number().int().positive(),
        }),
      )
      .min(2)
      .max(32),
  }),
  z.object({
    method: z.literal("RANDOM"),
    expectedVersion: z.number().int().nonnegative(),
    redraw: z.boolean().default(false),
  }),
])

interface LockBracketEntriesDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  lockEntries: (
    input: { tournamentId: string; expectedVersion: number },
    actor: Actor,
  ) => Promise<LockedCompetitionWorkspace>
}

interface GenerateBracketDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  generate: (
    input: GenerateBracketDraftInput,
    actor: Actor,
  ) => Promise<PersistedCompetitionBracket>
}

export async function handleLockBracketEntries(
  tournamentId: string,
  request: Request,
  dependencies: LockBracketEntriesDependencies,
) {
  return withSafeRouteBoundary(
    "competition.entries.lock",
    async () => {
      const actor = await dependencies.actorProvider.getCurrentActor()
      if (!actor) {
        return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
      }

      const body = await parseJsonRequest(request)
      const parsed = body.ok ? lockEntriesSchema.safeParse(body.value) : null
      if (!parsed?.success) {
        return Response.json(
          { message: "ข้อมูลการล็อกรายชื่อทีมไม่ถูกต้อง" },
          { status: 422 },
        )
      }

      try {
        const workspace = await dependencies.lockEntries(
          { tournamentId, expectedVersion: parsed.data.expectedVersion },
          actor,
        )
        return Response.json({ workspace })
      } catch (error) {
        const knownResponse = competitionFailureResponse(error)
        if (knownResponse) return knownResponse
        throw error
      }
    },
    dependencies,
  )
}

export async function handleGenerateBracket(
  tournamentId: string,
  request: Request,
  dependencies: GenerateBracketDependencies,
) {
  return withSafeRouteBoundary(
    "competition.bracket.generate",
    async () => {
      const actor = await dependencies.actorProvider.getCurrentActor()
      if (!actor) {
        return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
      }

      const body = await parseJsonRequest(request)
      const parsed = body.ok ? generateBracketSchema.safeParse(body.value) : null
      if (!parsed?.success) {
        return Response.json(
          { message: "ข้อมูลการสร้างสายการแข่งขันไม่ถูกต้อง" },
          { status: 422 },
        )
      }

      try {
        const bracket = await dependencies.generate(
          { tournamentId, ...parsed.data },
          actor,
        )
        return Response.json({ bracket })
      } catch (error) {
        const knownResponse = generationFailureResponse(error)
        if (knownResponse) return knownResponse
        throw error
      }
    },
    dependencies,
  )
}

function competitionFailureResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    NOT_FOUND: { status: 404, message: "ไม่พบรายการแข่งขัน" },
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์ดำเนินการนี้" },
    CONFLICT: {
      status: 409,
      message: "ข้อมูลรายการแข่งขันมีการเปลี่ยนแปลง กรุณาลองใหม่",
    },
    BRACKET_STRUCTURE_LOCKED: {
      status: 409,
      message: "ไม่สามารถแก้ไขสายการแข่งขันหลังเริ่มแข่งขันแล้ว",
    },
    BRACKET_ENTRY_LOCK_UNAVAILABLE: {
      status: 422,
      message: "สถานะรายการแข่งขันยังไม่พร้อมล็อกรายชื่อทีม",
    },
    BRACKET_ENTRY_COUNT_INVALID: {
      status: 422,
      message: "จำนวนทีมที่อนุมัติไม่พร้อมสำหรับสร้างสายการแข่งขัน",
    },
  }
  const response = responses[code]
  return response
    ? Response.json({ message: response.message }, { status: response.status })
    : null
}

function generationFailureResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    NOT_FOUND: { status: 404, message: "ไม่พบรายการแข่งขัน" },
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์ดำเนินการนี้" },
    CONFLICT: {
      status: 409,
      message: "ข้อมูลสายการแข่งขันมีการเปลี่ยนแปลง กรุณาลองใหม่",
    },
    BRACKET_STRUCTURE_LOCKED: {
      status: 409,
      message: "ไม่สามารถสร้างสายใหม่หลังเริ่มแข่งขันแล้ว",
    },
    BRACKET_SEED_INVALID: {
      status: 422,
      message: "กรุณากำหนด Seed ให้ครบและไม่ซ้ำกัน",
    },
    BRACKET_RANDOM_INVALID: {
      status: 422,
      message: "ไม่สามารถสุ่มลำดับทีมได้",
    },
  }
  const response = responses[code]
  return response
    ? Response.json({ message: response.message }, { status: response.status })
    : null
}
