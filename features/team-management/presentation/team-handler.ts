import { z } from "zod"

import type { Actor, CurrentActorProvider } from "@/features/identity/domain/actor"
import {
  parseJsonRequest,
  type SafeHttpDiagnostics,
  unexpectedFailureResponse,
} from "@/features/shared/presentation/safe-http"
import type {
  TeamPlayer,
  TeamPlayerDraft,
  TeamSummary,
} from "@/features/team-management/domain/team"
import type { AddTeamPlayersInput } from "@/features/team-management/application/add-team-players"
import type {
  CreateTeamInput,
  CreateTeamResult,
} from "@/features/team-management/application/create-team"
import type { DeactivateTeamPlayerInput } from "@/features/team-management/application/deactivate-team-player"
import type {
  RemoveOrDeactivateTeamInput,
  RemoveOrDeactivateTeamResult,
} from "@/features/team-management/application/remove-or-deactivate-team"
import type { UpdateTeamInput } from "@/features/team-management/application/update-team"
import type { UpdateTeamPlayerInput } from "@/features/team-management/application/update-team-player"
import { assertProvinceCode } from "@/features/provinces/application/assert-province-code"
import { maximumTeamPlayerBatchSize } from "@/features/team-management/domain/team-player-batch-policy"

const teamIdentitySchema = z.object({
  name: z.string().trim().min(2).max(80),
  provinceCode: z.string().trim().refine(
    (value) => {
      try {
        assertProvinceCode(value)
        return true
      } catch {
        return false
      }
    },
    { message: "กรุณาเลือกจังหวัดจากรายการ" },
  ),
  format: z.enum(["FIVE_V_FIVE", "THREE_V_THREE"]),
})

const teamUpdateSchema = teamIdentitySchema.extend({
  expectedVersion: z.number().int().nonnegative(),
})

const teamRemovalSchema = z.object({
  confirmationName: z.string().min(1).max(160),
  expectedVersion: z.number().int().nonnegative(),
})

const optionalTrimmedString = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength)
    .nullable()
    .optional()
    .transform((value) => value || null)

const teamPlayerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  nickname: optionalTrimmedString(40),
  birthDate: z
    .iso
    .date()
    .refine((value) => value <= new Date().toISOString().slice(0, 10)),
  jerseyNumber: z
    .number()
    .int()
    .min(1)
    .max(999)
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  position: z
    .enum(["PG", "SG", "SF", "PF", "C"])
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  phone: optionalTrimmedString(30),
})

const teamCreateSchema = teamIdentitySchema.extend({
  players: z
    .array(teamPlayerSchema)
    .max(maximumTeamPlayerBatchSize)
    .default([]),
})

const teamPlayerBatchSchema = z.object({
  players: z.array(teamPlayerSchema).min(1).max(maximumTeamPlayerBatchSize),
})

interface CreateTeamHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  create: (input: CreateTeamInput, actor: Actor) => Promise<CreateTeamResult>
}

interface UpdateTeamHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  update: (input: UpdateTeamInput, actor: Actor) => Promise<TeamSummary>
}

interface AddTeamPlayersHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  addPlayers: (input: AddTeamPlayersInput, actor: Actor) => Promise<TeamPlayer[]>
}

interface UpdateTeamPlayerHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  updatePlayer: (input: UpdateTeamPlayerInput, actor: Actor) => Promise<TeamPlayer>
}

interface DeactivateTeamPlayerHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  deactivatePlayer: (input: DeactivateTeamPlayerInput, actor: Actor) => Promise<TeamPlayer>
}

interface RemoveOrDeactivateTeamHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  remove: (
    input: RemoveOrDeactivateTeamInput,
    actor: Actor,
  ) => Promise<RemoveOrDeactivateTeamResult>
}

export async function handleCreateTeam(
  request: Request,
  dependencies: CreateTeamHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const payload = await parseJsonRequest(request)
    if (!payload.ok) return validationResponse()

    const parsed = teamCreateSchema.safeParse(payload.value)
    if (!parsed.success) {
      const hasPlayerIssue = parsed.error.issues.some(
        (issue) => issue.path[0] === "players",
      )
      return hasPlayerIssue
        ? playerValidationResponse(parsed.error.issues)
        : validationResponse()
    }

    const result = await dependencies.create(parsed.data, actor)
    return Response.json(result, { status: 201 })
  } catch (error) {
    return (
      teamFailureResponse(error) ??
      unexpectedFailureResponse(error, "team.create", dependencies)
    )
  }
}

export async function handleUpdateTeam(
  teamId: string,
  request: Request,
  dependencies: UpdateTeamHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const payload = await parseJsonRequest(request)
    if (!payload.ok) return validationResponse()

    const parsed = teamUpdateSchema.safeParse(payload.value)
    if (!parsed.success) return validationResponse()

    const team = await dependencies.update({ teamId, ...parsed.data }, actor)
    return Response.json({ team })
  } catch (error) {
    return (
      teamFailureResponse(error) ??
      unexpectedFailureResponse(error, "team.update", dependencies)
    )
  }
}

export async function handleAddTeamPlayers(
  teamId: string,
  request: Request,
  dependencies: AddTeamPlayersHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const payload = await parseJsonRequest(request)
    if (!payload.ok) return playerValidationResponse()

    const parsed = teamPlayerBatchSchema.safeParse(payload.value)
    if (!parsed.success) return playerValidationResponse(parsed.error.issues)

    const players = await dependencies.addPlayers({ teamId, ...parsed.data }, actor)
    return Response.json({ players }, { status: 201 })
  } catch (error) {
    return (
      teamFailureResponse(error) ??
      unexpectedFailureResponse(error, "team.players.add", dependencies)
    )
  }
}

export async function handleUpdateTeamPlayer(
  teamId: string,
  playerId: string,
  request: Request,
  dependencies: UpdateTeamPlayerHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const payload = await parseJsonRequest(request)
    if (!payload.ok) return playerValidationResponse()

    const parsed = teamPlayerSchema.safeParse(payload.value)
    if (!parsed.success) return playerValidationResponse(parsed.error.issues)

    const player = await dependencies.updatePlayer(
      { teamId, playerId, player: parsed.data },
      actor,
    )
    return Response.json({ player })
  } catch (error) {
    return (
      teamFailureResponse(error) ??
      unexpectedFailureResponse(error, "team.player.update", dependencies)
    )
  }
}

export async function handleDeactivateTeamPlayer(
  teamId: string,
  playerId: string,
  dependencies: DeactivateTeamPlayerHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    await dependencies.deactivatePlayer(
      { teamId, playerId, at: new Date().toISOString() },
      actor,
    )
    return new Response(null, { status: 204 })
  } catch (error) {
    return (
      teamFailureResponse(error) ??
      unexpectedFailureResponse(error, "team.player.deactivate", dependencies)
    )
  }
}

export async function handleRemoveOrDeactivateTeam(
  teamId: string,
  request: Request,
  dependencies: RemoveOrDeactivateTeamHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const payload = await parseJsonRequest(request)
    if (!payload.ok) return teamRemovalValidationResponse()

    const parsed = teamRemovalSchema.safeParse(payload.value)
    if (!parsed.success) return teamRemovalValidationResponse()

    const result = await dependencies.remove(
      { teamId, ...parsed.data, at: new Date().toISOString() },
      actor,
    )
    const message = result.outcome === "DELETED"
      ? "ลบทีมถาวรแล้ว"
      : "ปิดใช้งานทีมแล้วและเก็บประวัติการแข่งขันไว้"
    return Response.json({ ...result, message })
  } catch (error) {
    return (
      teamFailureResponse(error) ??
      unexpectedFailureResponse(error, "team.remove", dependencies)
    )
  }
}

function unauthorizedResponse() {
  return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
}

function validationResponse() {
  return Response.json({ message: "ข้อมูลทีมไม่ถูกต้อง" }, { status: 422 })
}

function teamRemovalValidationResponse() {
  return Response.json(
    { message: "ข้อมูลยืนยันการลบทีมไม่ถูกต้อง" },
    { status: 422 },
  )
}

function playerValidationResponse(
  issues: readonly { code?: string; path: readonly PropertyKey[] }[] = [],
) {
  const fieldIssues = issues.flatMap((issue) => {
    const [collection, row, field] = issue.path
    if (collection === "players" && typeof row === "number" && typeof field === "string") {
      return [{ row, field, message: playerFieldMessage(field, issue.code) }]
    }
    if (typeof collection === "string") {
      return [{ field: collection, message: playerFieldMessage(collection, issue.code) }]
    }
    return []
  })

  return Response.json(
    fieldIssues.length > 0
      ? { message: "ข้อมูลผู้เล่นไม่ถูกต้อง", issues: fieldIssues }
      : { message: "ข้อมูลผู้เล่นไม่ถูกต้อง" },
    { status: 422 },
  )
}

function playerFieldMessage(
  field: keyof TeamPlayerDraft | string,
  issueCode?: string,
) {
  if (issueCode === "too_big") {
    const maximumMessages: Record<string, string> = {
      firstName: "ชื่อต้องไม่เกิน 80 ตัวอักษร",
      lastName: "นามสกุลต้องไม่เกิน 80 ตัวอักษร",
      nickname: "ชื่อเล่นต้องไม่เกิน 40 ตัวอักษร",
      phone: "เบอร์โทรศัพท์ต้องไม่เกิน 30 ตัวอักษร",
    }
    if (maximumMessages[field]) return maximumMessages[field]
  }
  if (field === "birthDate" && issueCode === "custom") {
    return "วันเกิดต้องไม่เป็นวันที่ในอนาคต"
  }

  const messages: Record<string, string> = {
    firstName: "กรุณาระบุชื่อผู้เล่น",
    lastName: "กรุณาระบุนามสกุลผู้เล่น",
    birthDate: "วันเกิดไม่ถูกต้อง",
    nickname: "ชื่อเล่นต้องไม่เกิน 40 ตัวอักษร",
    jerseyNumber: "เบอร์เสื้อต้องเป็นจำนวนเต็มระหว่าง 1 ถึง 999",
    position: "ตำแหน่งผู้เล่นไม่ถูกต้อง",
    phone: "เบอร์โทรศัพท์ต้องไม่เกิน 30 ตัวอักษร",
  }
  return messages[field] ?? "ข้อมูลผู้เล่นไม่ถูกต้อง"
}

function teamFailureResponse(error: unknown): Response | null {
  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์จัดการทีมนี้" },
    NOT_FOUND: { status: 404, message: "ไม่พบทีม" },
    PLAYER_NOT_FOUND: { status: 404, message: "ไม่พบผู้เล่น" },
    PLAYER_ALREADY_EXISTS: { status: 409, message: "ผู้เล่นอยู่ในทีมแล้ว" },
    JERSEY_ALREADY_IN_USE: { status: 409, message: "เบอร์เสื้อนี้ถูกใช้แล้ว" },
    PLAYER_BATCH_INVALID: { status: 422, message: "รายชื่อผู้เล่นไม่ถูกต้อง" },
    TEAM_INACTIVE: { status: 409, message: "ทีมนี้ปิดใช้งานแล้ว" },
    TEAM_NAME_CONFIRMATION_MISMATCH: {
      status: 422,
      message: "ชื่อทีมที่ยืนยันไม่ตรงกัน กรุณาพิมพ์ชื่อทีมให้ตรงทุกตัวอักษร",
    },
    TEAM_REMOVAL_BLOCKED: {
      status: 409,
      message:
        "ไม่สามารถลบหรือปิดใช้งานทีมได้ กรุณายกเลิกหรือถอนใบสมัครที่รอดำเนินการหรืออนุมัติแล้วก่อน",
    },
    CONFLICT: {
      status: 409,
      message: "ข้อมูลทีมมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง",
    },
    TEAM_FORMAT_CHANGE_BLOCKED: {
      status: 409,
      message:
        "ไม่สามารถเปลี่ยนรูปแบบทีมได้ กรุณายกเลิกหรือรอให้ใบสมัครสิ้นสุดก่อนลองอีกครั้ง",
    },
  }
  const response = responses[code]
  if (!response) return null
  return Response.json({ message: response.message }, { status: response.status })
}
