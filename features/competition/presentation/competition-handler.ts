import { z } from "zod"

import type { LockedCompetitionWorkspace } from "@/features/competition/application/ports/competition-repository"
import type { PersistedCompetitionBracket } from "@/features/competition/application/ports/competition-repository"
import type { GenerateBracketDraftInput } from "@/features/competition/application/generate-bracket"
import type { ScheduleMatchInput } from "@/features/competition/application/schedule-match"
import type { ScheduledCompetitionMatch } from "@/features/competition/application/ports/competition-repository"
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
const publishBracketSchema = z.object({
  expectedVersion: z.number().int().nonnegative(),
})
const unpublishBracketSchema = publishBracketSchema.extend({
  reason: z.string().trim().min(1).max(500),
})
const scheduleMatchSchema = z.object({
  scheduledAt: z.iso.datetime({ offset: true }),
  court: z.string().trim().min(1).max(120),
  expectedVersion: z.number().int().nonnegative(),
  overrideReason: z.string().trim().max(500).optional(),
})

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

interface PublicationDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  publish: (
    input: { tournamentId: string; expectedVersion: number },
    actor: Actor,
  ) => Promise<PersistedCompetitionBracket>
}

interface UnpublicationDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  unpublish: (
    input: { tournamentId: string; expectedVersion: number; reason: string },
    actor: Actor,
  ) => Promise<PersistedCompetitionBracket>
}

interface ScheduleMatchDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  schedule: (
    input: ScheduleMatchInput,
    actor: Actor,
  ) => Promise<ScheduledCompetitionMatch>
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

export async function handlePublishBracket(
  tournamentId: string,
  request: Request,
  dependencies: PublicationDependencies,
) {
  return handlePublication(
    tournamentId,
    request,
    publishBracketSchema,
    dependencies,
    dependencies.publish,
  )
}

export async function handleUnpublishBracket(
  tournamentId: string,
  request: Request,
  dependencies: UnpublicationDependencies,
) {
  return handlePublication(
    tournamentId,
    request,
    unpublishBracketSchema,
    dependencies,
    dependencies.unpublish,
  )
}

async function handlePublication<TInput extends { expectedVersion: number }>(
  tournamentId: string,
  request: Request,
  schema: z.ZodType<TInput>,
  dependencies: SafeHttpDiagnostics & { actorProvider: CurrentActorProvider },
  operation: (
    input: TInput & { tournamentId: string },
    actor: Actor,
  ) => Promise<PersistedCompetitionBracket>,
) {
  return withSafeRouteBoundary(
    "competition.bracket.publication",
    async () => {
      const actor = await dependencies.actorProvider.getCurrentActor()
      if (!actor) {
        return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
      }
      const body = await parseJsonRequest(request)
      const parsed = body.ok ? schema.safeParse(body.value) : null
      if (!parsed?.success) {
        return Response.json(
          { message: "ข้อมูลการเผยแพร่ไม่ถูกต้อง" },
          { status: 422 },
        )
      }
      try {
        const bracket = await operation(
          { tournamentId, ...parsed.data },
          actor,
        )
        return Response.json({ bracket })
      } catch (error) {
        const knownResponse = publicationFailureResponse(error)
        if (knownResponse) return knownResponse
        throw error
      }
    },
    dependencies,
  )
}

export async function handleScheduleMatch(
  tournamentId: string,
  matchId: string,
  request: Request,
  dependencies: ScheduleMatchDependencies,
) {
  return withSafeRouteBoundary(
    "competition.match.schedule",
    async () => {
      const actor = await dependencies.actorProvider.getCurrentActor()
      if (!actor) {
        return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
      }
      const body = await parseJsonRequest(request)
      const parsed = body.ok ? scheduleMatchSchema.safeParse(body.value) : null
      if (!parsed?.success) {
        return Response.json(
          { message: "ข้อมูลตารางแข่งขันไม่ถูกต้อง" },
          { status: 422 },
        )
      }
      try {
        const match = await dependencies.schedule(
          { tournamentId, matchId, ...parsed.data },
          actor,
        )
        return Response.json({ match })
      } catch (error) {
        const knownResponse = scheduleFailureResponse(error)
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

function publicationFailureResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    NOT_FOUND: { status: 404, message: "ไม่พบรายการแข่งขัน" },
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์ดำเนินการนี้" },
    CONFLICT: {
      status: 409,
      message: "ข้อมูลสายการแข่งขันมีการเปลี่ยนแปลง กรุณาลองใหม่",
    },
    BRACKET_DRAFT_INCOMPLETE: {
      status: 422,
      message: "สายการแข่งขันยังไม่สมบูรณ์",
    },
    BRACKET_PUBLICATION_UNAVAILABLE: {
      status: 409,
      message: "ไม่สามารถเปลี่ยนสถานะเผยแพร่ได้",
    },
    BRACKET_STRUCTURE_LOCKED: {
      status: 409,
      message: "ไม่สามารถยกเลิกเผยแพร่หลังเริ่มแข่งขันแล้ว",
    },
    REASON_REQUIRED: { status: 422, message: "กรุณาระบุเหตุผล" },
  }
  const response = responses[code]
  return response
    ? Response.json({ message: response.message }, { status: response.status })
    : null
}

function scheduleFailureResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    NOT_FOUND: { status: 404, message: "ไม่พบคู่แข่งขัน" },
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์ดำเนินการนี้" },
    CONFLICT: {
      status: 409,
      message: "ข้อมูลคู่แข่งขันมีการเปลี่ยนแปลง กรุณาลองใหม่",
    },
    MATCH_SCHEDULE_INVALID: {
      status: 422,
      message: "ข้อมูลตารางแข่งขันไม่ถูกต้อง",
    },
    MATCH_SCHEDULE_CONFLICT: {
      status: 409,
      message: "สนามนี้มีการแข่งขันในเวลาดังกล่าวแล้ว",
    },
    MATCH_SCHEDULE_OUTSIDE_TOURNAMENT: {
      status: 422,
      message: "เวลาต้องอยู่ในช่วงวันแข่งขัน",
    },
    MATCH_SCHEDULE_LOCKED: {
      status: 409,
      message: "ไม่สามารถแก้ตารางของคู่ที่เริ่มแข่งขันแล้ว",
    },
    BRACKET_NOT_PUBLISHED: {
      status: 422,
      message: "กรุณาเผยแพร่สายการแข่งขันก่อนจัดตาราง",
    },
    REASON_REQUIRED: { status: 422, message: "กรุณาระบุเหตุผล" },
  }
  const response = responses[code]
  return response
    ? Response.json({ message: response.message }, { status: response.status })
    : null
}
