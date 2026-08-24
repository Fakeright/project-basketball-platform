import { z } from "zod"

import type { LockedCompetitionWorkspace } from "@/features/competition/application/ports/competition-repository"
import type { PersistedCompetitionBracket } from "@/features/competition/application/ports/competition-repository"
import type { GenerateBracketDraftInput } from "@/features/competition/application/generate-bracket"
import type { CreateExternalMatchInput } from "@/features/competition/application/create-external-match"
import type { UpdateExternalMatchPurposeInput } from "@/features/competition/application/update-external-match-purpose"
import type { ScheduleMatchInput } from "@/features/competition/application/schedule-match"
import type { RecordMatchScoreInput } from "@/features/competition/application/record-match-score"
import type { ConfirmMatchResultInput } from "@/features/competition/application/confirm-match-result"
import type { CorrectMatchResultInput } from "@/features/competition/application/correct-match-result"
import type {
  CreatedExternalMatch,
  ResultCompetitionMatch,
  ScheduledCompetitionMatch,
  UpdatedExternalMatchPurpose,
} from "@/features/competition/application/ports/competition-repository"
import type { Actor, CurrentActorProvider } from "@/features/identity/domain/actor"
import {
  parseJsonRequest,
  type SafeHttpDiagnostics,
  withSafeRouteBoundary,
} from "@/features/shared/presentation/safe-http"
import { tournamentGovernanceFailureResponse } from "@/features/tournament-operations/presentation/tournament-governance-error-response"

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
const createExternalMatchSchema = z.object({
  roundName: z.string().trim().min(1).max(80),
  sequence: z.number().int().min(1).max(99),
  homeTeamId: z.string().trim().min(1),
  awayTeamId: z.string().trim().min(1),
  scheduledAt: z.iso.datetime({ offset: true }),
  court: z.string().trim().min(1).max(120),
  expectedVersion: z.number().int().nonnegative(),
  purpose: z.enum(["STANDARD", "THIRD_PLACE", "CHAMPIONSHIP"]).default("STANDARD"),
  overrideReason: z.string().trim().max(500).optional(),
})
const updateExternalMatchPurposeSchema = z.object({
  purpose: z.enum(["STANDARD", "THIRD_PLACE", "CHAMPIONSHIP"]),
  expectedVersion: z.number().int().nonnegative(),
  overrideReason: z.string().trim().max(500).optional(),
})
const matchScoreSchema = z.object({
  homeScore: z.number().int().nonnegative(),
  awayScore: z.number().int().nonnegative(),
  expectedVersion: z.number().int().nonnegative(),
})
const confirmMatchResultSchema = matchScoreSchema.extend({
  confirm: z.literal(true),
})
const correctMatchResultSchema = confirmMatchResultSchema.extend({
  reason: z.string().trim().min(1).max(500),
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

interface CreateExternalMatchDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  create: (
    input: CreateExternalMatchInput,
    actor: Actor,
  ) => Promise<CreatedExternalMatch>
}

interface UpdateExternalMatchPurposeDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  updatePurpose: (
    input: UpdateExternalMatchPurposeInput,
    actor: Actor,
  ) => Promise<UpdatedExternalMatchPurpose>
}

interface RecordMatchScoreDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  record: (
    input: RecordMatchScoreInput,
    actor: Actor,
  ) => Promise<ResultCompetitionMatch>
}

interface ConfirmMatchResultDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  confirm: (
    input: ConfirmMatchResultInput,
    actor: Actor,
  ) => Promise<ResultCompetitionMatch>
}

interface CorrectMatchResultDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  correct: (
    input: CorrectMatchResultInput,
    actor: Actor,
  ) => Promise<ResultCompetitionMatch>
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

export async function handleCreateExternalMatch(
  tournamentId: string,
  request: Request,
  dependencies: CreateExternalMatchDependencies,
) {
  return withSafeRouteBoundary(
    "competition.external-match.create",
    async () => {
      const actor = await dependencies.actorProvider.getCurrentActor()
      if (!actor) {
        return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
      }
      const body = await parseJsonRequest(request)
      const parsed = body.ok
        ? createExternalMatchSchema.safeParse(body.value)
        : null
      if (!parsed?.success) {
        return Response.json(
          { message: "ข้อมูลคู่แข่งขันไม่ถูกต้อง" },
          { status: 422 },
        )
      }
      try {
        const match = await dependencies.create(
          { tournamentId, ...parsed.data },
          actor,
        )
        return Response.json({ match }, { status: 201 })
      } catch (error) {
        const knownResponse = externalMatchFailureResponse(error)
        if (knownResponse) return knownResponse
        throw error
      }
    },
    dependencies,
  )
}

export async function handleUpdateExternalMatchPurpose(
  tournamentId: string,
  matchId: string,
  request: Request,
  dependencies: UpdateExternalMatchPurposeDependencies,
) {
  return withSafeRouteBoundary(
    "competition.external-match.purpose.update",
    async () => {
      const actor = await dependencies.actorProvider.getCurrentActor()
      if (!actor) {
        return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
      }
      const body = await parseJsonRequest(request)
      const parsed = body.ok
        ? updateExternalMatchPurposeSchema.safeParse(body.value)
        : null
      if (!parsed?.success) {
        return Response.json(
          { message: "ข้อมูลประเภทคู่แข่งขันไม่ถูกต้อง" },
          { status: 422 },
        )
      }
      try {
        const match = await dependencies.updatePurpose(
          { tournamentId, matchId, ...parsed.data },
          actor,
        )
        return Response.json({ match })
      } catch (error) {
        const knownResponse = externalMatchFailureResponse(error)
        if (knownResponse) return knownResponse
        throw error
      }
    },
    dependencies,
  )
}

export async function handleRecordMatchScore(
  tournamentId: string,
  matchId: string,
  request: Request,
  dependencies: RecordMatchScoreDependencies,
) {
  return handleMatchResultMutation(
    tournamentId,
    matchId,
    request,
    matchScoreSchema,
    dependencies,
    dependencies.record,
    "competition.match.score",
  )
}

export async function handleConfirmMatchResult(
  tournamentId: string,
  matchId: string,
  request: Request,
  dependencies: ConfirmMatchResultDependencies,
) {
  return handleMatchResultMutation(
    tournamentId,
    matchId,
    request,
    confirmMatchResultSchema,
    dependencies,
    (input, actor) =>
      dependencies.confirm(
        {
          tournamentId: input.tournamentId,
          matchId: input.matchId,
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          expectedVersion: input.expectedVersion,
        },
        actor,
      ),
    "competition.match.confirm",
  )
}

export async function handleCorrectMatchResult(
  tournamentId: string,
  matchId: string,
  request: Request,
  dependencies: CorrectMatchResultDependencies,
) {
  return handleMatchResultMutation(
    tournamentId,
    matchId,
    request,
    correctMatchResultSchema,
    dependencies,
    (input, actor) =>
      dependencies.correct(
        {
          tournamentId: input.tournamentId,
          matchId: input.matchId,
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          expectedVersion: input.expectedVersion,
          reason: input.reason,
        },
        actor,
      ),
    "competition.match.result-correction",
  )
}

async function handleMatchResultMutation<
  TInput extends {
    homeScore: number
    awayScore: number
    expectedVersion: number
  },
>(
  tournamentId: string,
  matchId: string,
  request: Request,
  schema: z.ZodType<TInput>,
  dependencies: SafeHttpDiagnostics & { actorProvider: CurrentActorProvider },
  operation: (
    input: TInput & { tournamentId: string; matchId: string },
    actor: Actor,
  ) => Promise<ResultCompetitionMatch>,
  operationName: string,
) {
  return withSafeRouteBoundary(
    operationName,
    async () => {
      const actor = await dependencies.actorProvider.getCurrentActor()
      if (!actor) {
        return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
      }
      const body = await parseJsonRequest(request)
      const parsed = body.ok ? schema.safeParse(body.value) : null
      if (!parsed?.success) {
        return Response.json(
          { message: "ข้อมูลคะแนนไม่ถูกต้อง" },
          { status: 422 },
        )
      }
      try {
        const match = await operation(
          { tournamentId, matchId, ...parsed.data },
          actor,
        )
        return Response.json({ match })
      } catch (error) {
        const knownResponse = resultFailureResponse(error)
        if (knownResponse) return knownResponse
        throw error
      }
    },
    dependencies,
  )
}

function competitionFailureResponse(error: unknown) {
  const governanceFailure = tournamentGovernanceFailureResponse(error)
  if (governanceFailure) return governanceFailure

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
  const governanceFailure = tournamentGovernanceFailureResponse(error)
  if (governanceFailure) return governanceFailure

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
  const governanceFailure = tournamentGovernanceFailureResponse(error)
  if (governanceFailure) return governanceFailure

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
  const governanceFailure = tournamentGovernanceFailureResponse(error)
  if (governanceFailure) return governanceFailure

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
    MATCH_SCHEDULE_UNAVAILABLE: {
      status: 409,
      message: "สถานะรายการไม่อนุญาตให้แก้ตารางแข่งขัน",
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

function externalMatchFailureResponse(error: unknown) {
  const governanceFailure = tournamentGovernanceFailureResponse(error)
  if (governanceFailure) return governanceFailure

  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    NOT_FOUND: { status: 404, message: "ไม่พบรายการแข่งขัน" },
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์ดำเนินการนี้" },
    CONFLICT: {
      status: 409,
      message: "ข้อมูลสายการแข่งขันมีการเปลี่ยนแปลง กรุณาลองใหม่",
    },
    EXTERNAL_MATCH_INVALID: {
      status: 422,
      message: "ข้อมูลคู่แข่งขันไม่ถูกต้อง",
    },
    EXTERNAL_BRACKET_REQUIRED: {
      status: 409,
      message: "ต้องเผยแพร่สายการแข่งขันแบบไฟล์ภายนอกก่อน",
    },
    MATCH_TEAM_NOT_LOCKED: {
      status: 422,
      message: "เลือกทีมได้เฉพาะรายชื่อที่ล็อกไว้",
    },
    MATCH_TEAMS_DUPLICATE: {
      status: 422,
      message: "ทีมเหย้าและทีมเยือนต้องไม่ซ้ำกัน",
    },
    MATCH_SEQUENCE_CONFLICT: {
      status: 409,
      message: "ลำดับคู่นี้ถูกใช้แล้วในรอบเดียวกัน",
    },
    MATCH_SCHEDULE_CONFLICT: {
      status: 409,
      message: "สนามนี้มีการแข่งขันในเวลาดังกล่าวแล้ว",
    },
    MATCH_SCHEDULE_OUTSIDE_TOURNAMENT: {
      status: 422,
      message: "เวลาต้องอยู่ในช่วงวันแข่งขัน",
    },
    MATCH_PURPOSE_CONFLICT: {
      status: 409,
      message: "รายการนี้มีคู่ชิงตำแหน่งดังกล่าวแล้ว",
    },
    MATCH_PURPOSE_LOCKED: {
      status: 409,
      message: "ไม่สามารถเปลี่ยนประเภทคู่ที่เริ่มบันทึกผลแล้ว",
    },
    REASON_REQUIRED: { status: 422, message: "กรุณาระบุเหตุผล" },
  }
  const response = responses[code]
  return response
    ? Response.json({ message: response.message }, { status: response.status })
    : null
}

function resultFailureResponse(error: unknown) {
  const governanceFailure = tournamentGovernanceFailureResponse(error)
  if (governanceFailure) return governanceFailure

  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    NOT_FOUND: { status: 404, message: "ไม่พบคู่แข่งขัน" },
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์ดำเนินการนี้" },
    CONFLICT: {
      status: 409,
      message: "ข้อมูลคู่แข่งขันมีการเปลี่ยนแปลง กรุณาลองใหม่",
    },
    MATCH_SCORE_INVALID: {
      status: 422,
      message: "คะแนนต้องเป็นจำนวนเต็มไม่ติดลบและห้ามเสมอ",
    },
    MATCH_ADVANCEMENT_CONFLICT: {
      status: 409,
      message: "ช่องทีมในคู่ถัดไปถูกใช้งานแล้ว",
    },
    MATCH_TEAMS_INCOMPLETE: {
      status: 422,
      message: "คู่แข่งขันยังมีทีมไม่ครบ",
    },
    MATCH_RESULT_LOCKED: {
      status: 409,
      message: "ไม่สามารถแก้คะแนนของคู่นี้ได้",
    },
    MATCH_RESULT_CONFIRMED: {
      status: 409,
      message: "ผลการแข่งขันนี้ได้รับการยืนยันแล้ว",
    },
    MATCH_RESULT_NOT_CONFIRMED: {
      status: 409,
      message: "ผลการแข่งขันนี้ยังไม่ได้รับการยืนยัน",
    },
    TOURNAMENT_NOT_IN_PROGRESS: {
      status: 409,
      message: "กรุณาเริ่มการแข่งขันก่อนบันทึกผล",
    },
    RESULT_CORRECTION_DOWNSTREAM_LOCKED: {
      status: 409,
      message: "ไม่สามารถเปลี่ยนผู้ชนะหลังคู่ถัดไปเริ่มแล้ว",
    },
    REASON_REQUIRED: { status: 422, message: "กรุณาระบุเหตุผล" },
    BRACKET_NOT_PUBLISHED: {
      status: 422,
      message: "กรุณาเผยแพร่สายการแข่งขันก่อนบันทึกผล",
    },
  }
  const response = responses[code]
  return response
    ? Response.json({ message: response.message }, { status: response.status })
    : null
}
