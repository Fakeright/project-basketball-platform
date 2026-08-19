import { z } from "zod"

import type { Actor, CurrentActorProvider } from "@/features/identity/domain/actor"
import type { SelectBracketModeRequest } from "@/features/competition/application/select-bracket-mode"
import type { UploadExternalBracketInput } from "@/features/competition/application/upload-external-bracket"
import { assertExternalBracketFile } from "@/features/competition/domain/external-bracket-policy"
import { ObjectStorageError } from "@/features/tournament-media/application/ports/object-storage"
import {
  parseJsonRequest,
  type SafeHttpDiagnostics,
  withSafeRouteBoundary,
} from "@/features/shared/presentation/safe-http"

const modeSchema = z.object({
  targetMode: z.enum(["SYSTEM_GENERATED", "EXTERNAL_DOCUMENT"]),
  expectedVersion: z.number().int().nonnegative(),
  reason: z.string().trim().min(1).max(500).optional(),
})
const revisionMutationSchema = z.object({
  revisionId: z.string().trim().min(1).optional(),
  expectedVersion: z.number().int().nonnegative(),
  reason: z.string().trim().min(1).max(500).optional(),
})
const uploadFieldsSchema = z.object({
  expectedVersion: z.coerce.number().int().nonnegative(),
  reason: z.string().trim().min(1).max(500).optional(),
})

const maximumMultipartBytes = 21_000_000

interface BaseDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
}

export async function handleSelectBracketMode(
  tournamentId: string,
  request: Request,
  dependencies: BaseDependencies & {
    select(input: SelectBracketModeRequest, actor: Actor): Promise<unknown>
  },
) {
  return withSafeRouteBoundary("competition.bracket.mode", async () => {
    const actor = await requireActor(dependencies.actorProvider)
    if (actor instanceof Response) return actor
    const parsedBody = await parseJsonRequest(request)
    const parsed = parsedBody.ok ? modeSchema.safeParse(parsedBody.value) : null
    if (!parsed?.success) return validationResponse("ข้อมูลโหมดสายการแข่งขันไม่ถูกต้อง")
    try {
      const result = await dependencies.select(
        { tournamentId, ...parsed.data },
        actor,
      )
      return Response.json(result)
    } catch (error) {
      return mapExternalBracketError(error)
    }
  }, dependencies)
}

export async function handleUploadExternalBracket(
  tournamentId: string,
  request: Request,
  dependencies: BaseDependencies & {
    upload(input: UploadExternalBracketInput, actor: Actor): Promise<unknown>
  },
) {
  return withSafeRouteBoundary("competition.bracket.external.upload", async () => {
    const actor = await requireActor(dependencies.actorProvider)
    if (actor instanceof Response) return actor

    const contentLength = Number(request.headers.get("content-length"))
    if (Number.isFinite(contentLength) && contentLength > maximumMultipartBytes) {
      return validationResponse("ไฟล์สายการแข่งขันมีขนาดใหญ่เกินกำหนด")
    }

    let form: FormData
    try {
      form = await request.formData()
    } catch {
      return validationResponse("ข้อมูลไฟล์สายการแข่งขันไม่ถูกต้อง")
    }
    const file = form.get("file")
    const fields = uploadFieldsSchema.safeParse({
      expectedVersion: form.get("expectedVersion"),
      reason: optionalFormString(form.get("reason")),
    })
    if (!isUploadFile(file) || !fields.success) {
      return validationResponse("กรุณาเลือกไฟล์และระบุข้อมูลให้ครบถ้วน")
    }

    try {
      assertExternalBracketFile({ contentType: file.type, byteSize: file.size })
      const result = await dependencies.upload(
        {
          tournamentId,
          expectedVersion: fields.data.expectedVersion,
          reason: fields.data.reason,
          file: {
            fileName: file.name,
            contentType: file.type,
            byteSize: file.size,
            data: new Uint8Array(await file.arrayBuffer()),
          },
        },
        actor,
      )
      return Response.json(result, { status: 201 })
    } catch (error) {
      return mapExternalBracketError(error)
    }
  }, dependencies)
}

export async function handlePublishExternalBracket(
  tournamentId: string,
  request: Request,
  dependencies: BaseDependencies & {
    publish(input: {
      tournamentId: string
      revisionId: string
      expectedVersion: number
      reason?: string
    }, actor: Actor): Promise<unknown>
  },
) {
  return handleRevisionMutation(
    "competition.bracket.external.publish",
    tournamentId,
    undefined,
    request,
    dependencies,
    dependencies.publish,
  )
}

export async function handleRetireExternalBracket(
  tournamentId: string,
  revisionId: string,
  request: Request,
  dependencies: BaseDependencies & {
    retire(input: {
      tournamentId: string
      revisionId: string
      expectedVersion: number
      reason?: string
    }, actor: Actor): Promise<unknown>
  },
) {
  return handleRevisionMutation(
    "competition.bracket.external.retire",
    tournamentId,
    revisionId,
    request,
    dependencies,
    dependencies.retire,
  )
}

async function handleRevisionMutation(
  operation: string,
  tournamentId: string,
  routeRevisionId: string | undefined,
  request: Request,
  dependencies: BaseDependencies,
  mutate: (
    input: {
      tournamentId: string
      revisionId: string
      expectedVersion: number
      reason?: string
    },
    actor: Actor,
  ) => Promise<unknown>,
) {
  return withSafeRouteBoundary(operation, async () => {
    const actor = await requireActor(dependencies.actorProvider)
    if (actor instanceof Response) return actor
    const body = await parseJsonRequest(request)
    const parsed = body.ok ? revisionMutationSchema.safeParse(body.value) : null
    const revisionId = routeRevisionId ??
      (parsed?.success ? parsed.data.revisionId : undefined)
    if (!parsed?.success || !revisionId) {
      return validationResponse("ข้อมูล revision ไม่ถูกต้อง")
    }
    try {
      const result = await mutate(
        {
          tournamentId,
          revisionId,
          expectedVersion: parsed.data.expectedVersion,
          reason: parsed.data.reason,
        },
        actor,
      )
      return Response.json(result)
    } catch (error) {
      return mapExternalBracketError(error)
    }
  }, dependencies)
}

async function requireActor(provider: CurrentActorProvider) {
  const actor = await provider.getCurrentActor()
  return actor ?? Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
}

function optionalFormString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value : undefined
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string" &&
    "type" in value &&
    typeof value.type === "string" &&
    "size" in value &&
    typeof value.size === "number" &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function"
  )
}

function validationResponse(message: string) {
  return Response.json({ message }, { status: 422 })
}

function mapExternalBracketError(error: unknown) {
  if (error instanceof ObjectStorageError && error.code === "UNAVAILABLE") {
    return Response.json(
      { message: "ระบบจัดเก็บไฟล์ไม่พร้อมใช้งาน กรุณาลองใหม่" },
      { status: 503 },
    )
  }
  const code = error instanceof Error ? error.message : ""
  const mapped: Record<string, { status: number; message: string }> = {
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์ดำเนินการนี้" },
    NOT_FOUND: { status: 404, message: "ไม่พบรายการแข่งขันหรือสายการแข่งขัน" },
    CONFLICT: { status: 409, message: "ข้อมูลถูกเปลี่ยนแปลงแล้ว กรุณาโหลดใหม่" },
    BRACKET_MODE_LOCKED: { status: 409, message: "ไม่สามารถเปลี่ยนโหมดสายการแข่งขันในสถานะนี้" },
    BRACKET_MODE_NOT_EXTERNAL: { status: 409, message: "สายการแข่งขันไม่ได้ใช้ไฟล์ภายนอก" },
    EXTERNAL_BRACKET_REVISION_NOT_PUBLISHABLE: { status: 409, message: "ไม่สามารถเผยแพร่ revision นี้ได้" },
    EXTERNAL_BRACKET_REVISION_NOT_RETIRABLE: { status: 409, message: "ไม่สามารถยกเลิก revision นี้ได้" },
    REASON_REQUIRED: { status: 422, message: "กรุณาระบุเหตุผล" },
    BRACKET_FILE_TYPE_INVALID: { status: 422, message: "รองรับเฉพาะ PDF, JPG, PNG และ WebP" },
    BRACKET_FILE_TOO_LARGE: { status: 422, message: "ไฟล์สายการแข่งขันมีขนาดใหญ่เกินกำหนด" },
    BRACKET_FILE_SIZE_MISMATCH: { status: 422, message: "ขนาดไฟล์ไม่ถูกต้อง" },
    BRACKET_FILE_UNREADABLE: { status: 422, message: "ไม่สามารถอ่านไฟล์สายการแข่งขันได้" },
  }
  const response = mapped[code]
  if (response) return Response.json({ message: response.message }, { status: response.status })
  throw error
}
