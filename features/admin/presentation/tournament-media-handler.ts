import type { Actor, CurrentActorProvider } from "@/features/identity/domain/actor"
import {
  unexpectedFailureResponse,
  type SafeHttpDiagnostics,
} from "@/features/shared/presentation/safe-http"
import type { UploadTournamentMediaInput } from "@/features/tournament-media/application/upload-tournament-media"
import { ObjectStorageError } from "@/features/tournament-media/application/ports/object-storage"
import type { TournamentMediaAsset } from "@/features/tournament-media/domain/media-asset"
import { tournamentGovernanceFailureResponse } from "@/features/tournament-operations/presentation/tournament-governance-error-response"

const defaultMaximumRequestBytes = 10_500_000

interface MediaHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  authorize: (tournamentId: string, actor: Actor) => Promise<void>
  upload: (
    input: UploadTournamentMediaInput,
    actor: Actor,
  ) => Promise<TournamentMediaAsset>
  maxRequestBytes?: number
}

interface DeleteMediaHandlerDependencies extends SafeHttpDiagnostics {
  actorProvider: CurrentActorProvider
  remove: (
    input: { tournamentId: string; assetId: string },
    actor: Actor,
  ) => Promise<void>
}

export async function handleTournamentMediaUpload(
  request: Request,
  tournamentId: string,
  dependencies: MediaHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) {
      return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    try {
      await dependencies.authorize(tournamentId, actor)
    } catch (error) {
      return (
        mediaFailureResponse(error, "media.upload", dependencies) ??
        unexpectedFailureResponse(error, "media.upload", dependencies)
      )
    }

    const body = await readRequestBodyWithLimit(
      request,
      dependencies.maxRequestBytes ?? defaultMaximumRequestBytes,
    )
    if (!body) return invalidMediaFormResponse()

    let formData: FormData
    try {
      const bufferedRequest = new Request(
        request.url || "http://localhost/api/media",
        {
          method: request.method || "POST",
          headers: request.headers,
          body,
        },
      )
      formData = await bufferedRequest.formData()
    } catch {
      return invalidMediaFormResponse()
    }

    const kind = formData.get("kind")
    const file = formData.get("file")
    if (
      (kind !== "POSTER" && kind !== "DOCUMENT") ||
      !isUploadFile(file)
    ) {
      return invalidMediaFormResponse()
    }

    try {
      const asset = await dependencies.upload(
        {
          tournamentId,
          kind,
          file: {
            fileName: file.name,
            contentType: file.type,
            byteSize: file.size,
            data: new Uint8Array(await file.arrayBuffer()),
          },
        },
        actor,
      )
      return Response.json({ asset }, { status: 201 })
    } catch (error) {
      return (
        mediaFailureResponse(error, "media.upload", dependencies) ??
        unexpectedFailureResponse(error, "media.upload", dependencies)
      )
    }
  } catch (error) {
    if (
      error instanceof MediaRequestBoundaryError &&
      error.code === "MEDIA_REQUEST_TOO_LARGE"
    ) {
      return Response.json(
        { message: "ไฟล์มีขนาดใหญ่เกินกว่าที่กำหนด" },
        { status: 413 },
      )
    }
    return unexpectedFailureResponse(error, "media.upload", dependencies)
  }
}

export async function handleTournamentMediaDelete(
  tournamentId: string,
  assetId: string,
  dependencies: DeleteMediaHandlerDependencies,
) {
  try {
    const actor = await dependencies.actorProvider.getCurrentActor()
    if (!actor) {
      return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    try {
      await dependencies.remove({ tournamentId, assetId }, actor)
      return new Response(null, { status: 204 })
    } catch (error) {
      return (
        mediaFailureResponse(error, "media.delete", dependencies) ??
        unexpectedFailureResponse(error, "media.delete", dependencies)
      )
    }
  } catch (error) {
    return unexpectedFailureResponse(error, "media.delete", dependencies)
  }
}

export async function readRequestBodyWithLimit(
  request: Request,
  maximumBytes: number,
): Promise<ArrayBuffer | null> {
  const contentLength = request.headers.get("content-length")
  if (contentLength) {
    const declaredBytes = Number(contentLength)
    if (Number.isFinite(declaredBytes) && declaredBytes > maximumBytes) {
      throw new MediaRequestBoundaryError("MEDIA_REQUEST_TOO_LARGE")
    }
  }
  if (!request.body) return null

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > maximumBytes) {
      try {
        await reader.cancel()
      } catch {}
      throw new MediaRequestBoundaryError("MEDIA_REQUEST_TOO_LARGE")
    }
    chunks.push(value)
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body.buffer
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value &&
    "type" in value
  )
}

function invalidMediaFormResponse() {
  return Response.json(
    { message: "กรุณาเลือกไฟล์ที่ต้องการอัปโหลด" },
    { status: 422 },
  )
}

function mediaFailureResponse(
  error: unknown,
  operation: string,
  diagnostics: SafeHttpDiagnostics,
) {
  const governanceFailure = tournamentGovernanceFailureResponse(error)
  if (governanceFailure) return governanceFailure

  if (error instanceof ObjectStorageError) {
    if (error.code === "UNAVAILABLE") {
      return unexpectedFailureResponse(
        error,
        operation,
        diagnostics,
        503,
      )
    }
    return Response.json(
      { message: "ไม่พบไฟล์ที่ต้องการ" },
      { status: 404 },
    )
  }

  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์จัดการสื่อของรายการนี้" },
    NOT_FOUND: { status: 404, message: "ไม่พบรายการแข่งขัน" },
    MEDIA_ASSET_NOT_FOUND: { status: 404, message: "ไม่พบไฟล์ที่ต้องการ" },
    MEDIA_POSTER_CONFLICT: {
      status: 409,
      message: "โปสเตอร์ถูกเปลี่ยนจากอีกหน้าต่าง กรุณาลองใหม่",
    },
    MEDIA_FILE_TOO_LARGE: {
      status: 413,
      message: "ไฟล์มีขนาดใหญ่เกินกว่าที่กำหนด",
    },
    MEDIA_FILE_TYPE_INVALID: {
      status: 415,
      message: "ชนิดไฟล์ไม่ได้รับอนุญาต",
    },
    MEDIA_FILE_CONTENT_INVALID: {
      status: 422,
      message: "เนื้อหาไฟล์ไม่ตรงกับชนิดไฟล์",
    },
  }
  const response = responses[code]
  return response
    ? Response.json({ message: response.message }, { status: response.status })
    : null
}

class MediaRequestBoundaryError extends Error {
  constructor(readonly code: "MEDIA_REQUEST_TOO_LARGE") {
    super(code)
  }
}
