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
  TeamRosterMember,
  TeamSummary,
} from "@/features/team-management/domain/team"
import type { AddTeamMemberInput } from "@/features/team-management/application/add-team-member"
import type { AddTeamPlayersInput } from "@/features/team-management/application/add-team-players"
import type { CreateTeamInput } from "@/features/team-management/application/create-team"
import type { DeactivateTeamMemberInput } from "@/features/team-management/application/deactivate-team-member"
import type { DeactivateTeamPlayerInput } from "@/features/team-management/application/deactivate-team-player"
import type { UpdateTeamInput } from "@/features/team-management/application/update-team"
import type { UpdateTeamPlayerInput } from "@/features/team-management/application/update-team-player"
import { assertProvinceCode } from "@/features/provinces/application/assert-province-code"

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

const teamMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["PLAYER"]),
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

const teamPlayerBatchSchema = z.object({
  players: z.array(teamPlayerSchema).min(1).max(30),
})

interface CreateTeamHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  create: (input: CreateTeamInput, actor: Actor) => Promise<TeamSummary>
}

interface UpdateTeamHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  update: (input: UpdateTeamInput, actor: Actor) => Promise<TeamSummary>
}

interface AddTeamMemberHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  addMember: (input: AddTeamMemberInput, actor: Actor) => Promise<TeamRosterMember>
}

interface DeactivateTeamMemberHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  deactivateMember: (
    input: DeactivateTeamMemberInput,
    actor: Actor,
  ) => Promise<void>
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

export async function handleCreateTeam(
  request: Request,
  dependencies: CreateTeamHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const payload = await parseJsonRequest(request)
    if (!payload.ok) return validationResponse()

    const parsed = teamIdentitySchema.safeParse(payload.value)
    if (!parsed.success) return validationResponse()

    const team = await dependencies.create(parsed.data, actor)
    return Response.json({ team }, { status: 201 })
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

export async function handleAddTeamMember(
  teamId: string,
  request: Request,
  dependencies: AddTeamMemberHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    const payload = await parseJsonRequest(request)
    if (!payload.ok) return validationResponse()

    const parsed = teamMemberSchema.safeParse(payload.value)
    if (!parsed.success) return validationResponse()

    const member = await dependencies.addMember({ teamId, ...parsed.data }, actor)
    return Response.json({ member }, { status: 201 })
  } catch (error) {
    return (
      teamFailureResponse(error) ??
      unexpectedFailureResponse(error, "team.member.add", dependencies)
    )
  }
}

export async function handleDeactivateTeamMember(
  teamId: string,
  memberId: string,
  dependencies: DeactivateTeamMemberHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) return unauthorizedResponse()

    await dependencies.deactivateMember(
      { teamId, memberId, at: new Date().toISOString() },
      actor,
    )
    return new Response(null, { status: 204 })
  } catch (error) {
    return (
      teamFailureResponse(error) ??
      unexpectedFailureResponse(error, "team.member.deactivate", dependencies)
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
    if (!parsed.success) return playerValidationResponse()

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

function unauthorizedResponse() {
  return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
}

function validationResponse() {
  return Response.json({ message: "ข้อมูลทีมไม่ถูกต้อง" }, { status: 422 })
}

function playerValidationResponse(
  issues: readonly { path: readonly PropertyKey[] }[] = [],
) {
  const indexedIssues = issues.flatMap((issue) => {
    const [collection, row, field] = issue.path
    if (collection !== "players" || typeof row !== "number" || typeof field !== "string") {
      return []
    }
    return [{ row, field, message: playerFieldMessage(field) }]
  })

  return Response.json(
    indexedIssues.length > 0
      ? { message: "ข้อมูลผู้เล่นไม่ถูกต้อง", issues: indexedIssues }
      : { message: "ข้อมูลผู้เล่นไม่ถูกต้อง" },
    { status: 422 },
  )
}

function playerFieldMessage(field: keyof TeamPlayerDraft | string) {
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
    MEMBER_NOT_FOUND: { status: 404, message: "ไม่พบสมาชิก" },
    MEMBER_ALREADY_ACTIVE: { status: 409, message: "สมาชิกอยู่ในทีมแล้ว" },
    MEMBER_ROLE_MISMATCH: { status: 422, message: "บทบาทสมาชิกไม่ตรงกับบทบาทผู้ใช้" },
    PLAYER_NOT_FOUND: { status: 404, message: "ไม่พบผู้เล่น" },
    PLAYER_ALREADY_EXISTS: { status: 409, message: "ผู้เล่นอยู่ในทีมแล้ว" },
    JERSEY_ALREADY_IN_USE: { status: 409, message: "เบอร์เสื้อนี้ถูกใช้แล้ว" },
    PLAYER_BATCH_INVALID: { status: 422, message: "รายชื่อผู้เล่นไม่ถูกต้อง" },
    TEAM_INACTIVE: { status: 409, message: "ทีมนี้ปิดใช้งานแล้ว" },
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
