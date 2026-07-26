import { z } from "zod"

import type { Actor, CurrentActorProvider } from "@/features/identity/domain/actor"
import type { TeamRosterMember, TeamSummary } from "@/features/team-management/domain/team"
import type { AddTeamMemberInput } from "@/features/team-management/application/add-team-member"
import type { CreateTeamInput } from "@/features/team-management/application/create-team"
import type { DeactivateTeamMemberInput } from "@/features/team-management/application/deactivate-team-member"
import type { UpdateTeamInput } from "@/features/team-management/application/update-team"

const teamIdentitySchema = z.object({
  name: z.string().trim().min(2).max(80),
  province: z.string().trim().min(2).max(80),
})

const teamMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["PLAYER", "COACH"]),
})

interface CreateTeamHandlerDependencies {
  actorProvider: CurrentActorProvider
  create: (input: CreateTeamInput, actor: Actor) => Promise<TeamSummary>
}

interface UpdateTeamHandlerDependencies {
  actorProvider: CurrentActorProvider
  update: (input: UpdateTeamInput, actor: Actor) => Promise<TeamSummary>
}

interface AddTeamMemberHandlerDependencies {
  actorProvider: CurrentActorProvider
  addMember: (input: AddTeamMemberInput, actor: Actor) => Promise<TeamRosterMember>
}

interface DeactivateTeamMemberHandlerDependencies {
  actorProvider: CurrentActorProvider
  deactivateMember: (
    input: DeactivateTeamMemberInput,
    actor: Actor,
  ) => Promise<void>
}

export async function handleCreateTeam(
  request: Request,
  dependencies: CreateTeamHandlerDependencies,
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) return unauthorizedResponse()

  const parsed = teamIdentitySchema.safeParse(await parseJson(request))
  if (!parsed.success) return validationResponse()

  try {
    const team = await dependencies.create(parsed.data, actor)
    return Response.json({ team }, { status: 201 })
  } catch (error) {
    return teamFailureResponse(error)
  }
}

export async function handleUpdateTeam(
  teamId: string,
  request: Request,
  dependencies: UpdateTeamHandlerDependencies,
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) return unauthorizedResponse()

  const parsed = teamIdentitySchema.safeParse(await parseJson(request))
  if (!parsed.success) return validationResponse()

  try {
    const team = await dependencies.update({ teamId, ...parsed.data }, actor)
    return Response.json({ team })
  } catch (error) {
    return teamFailureResponse(error)
  }
}

export async function handleAddTeamMember(
  teamId: string,
  request: Request,
  dependencies: AddTeamMemberHandlerDependencies,
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) return unauthorizedResponse()

  const parsed = teamMemberSchema.safeParse(await parseJson(request))
  if (!parsed.success) return validationResponse()

  try {
    const member = await dependencies.addMember({ teamId, ...parsed.data }, actor)
    return Response.json({ member }, { status: 201 })
  } catch (error) {
    return teamFailureResponse(error)
  }
}

export async function handleDeactivateTeamMember(
  teamId: string,
  memberId: string,
  dependencies: DeactivateTeamMemberHandlerDependencies,
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) return unauthorizedResponse()

  try {
    await dependencies.deactivateMember(
      { teamId, memberId, at: new Date().toISOString() },
      actor,
    )
    return new Response(null, { status: 204 })
  } catch (error) {
    return teamFailureResponse(error)
  }
}

async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

function unauthorizedResponse() {
  return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
}

function validationResponse() {
  return Response.json({ message: "ข้อมูลทีมไม่ถูกต้อง" }, { status: 422 })
}

function teamFailureResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์จัดการทีมนี้" },
    NOT_FOUND: { status: 404, message: "ไม่พบทีม" },
    MEMBER_NOT_FOUND: { status: 404, message: "ไม่พบสมาชิก" },
    MEMBER_ALREADY_ACTIVE: { status: 409, message: "สมาชิกอยู่ในทีมแล้ว" },
    MEMBER_ROLE_MISMATCH: { status: 422, message: "บทบาทสมาชิกไม่ตรงกับบทบาทผู้ใช้" },
  }
  const response = responses[code] ?? {
    status: 500,
    message: "ไม่สามารถจัดการทีมได้",
  }
  return Response.json({ message: response.message }, { status: response.status })
}
