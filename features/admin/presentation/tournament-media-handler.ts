import type { Actor, CurrentActorProvider } from "@/features/identity/domain/actor"
import type { TournamentMediaAsset } from "@/features/tournament-media/domain/media-asset"
import type { UploadTournamentMediaInput } from "@/features/tournament-media/application/upload-tournament-media"

interface MediaHandlerDependencies {
  actorProvider: CurrentActorProvider
  upload: (
    input: UploadTournamentMediaInput,
    actor: Actor,
  ) => Promise<TournamentMediaAsset>
}

interface DeleteMediaHandlerDependencies {
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
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })

  const formData = await request.formData()
  const kind = formData.get("kind")
  const file = formData.get("file")
  if (
    (kind !== "POSTER" && kind !== "DOCUMENT") ||
    !isUploadFile(file)
  ) {
    return Response.json({ message: "กรุณาเลือกไฟล์ที่ต้องการอัปโหลด" }, { status: 422 })
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
    return mediaFailureResponse(error)
  }
}

export async function handleTournamentMediaDelete(
  tournamentId: string,
  assetId: string,
  dependencies: DeleteMediaHandlerDependencies,
) {
  const actor = await dependencies.actorProvider.getCurrentActor()
  if (!actor) return Response.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })

  try {
    await dependencies.remove({ tournamentId, assetId }, actor)
    return new Response(null, { status: 204 })
  } catch (error) {
    return mediaFailureResponse(error)
  }
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

function mediaFailureResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN"
  const responses: Record<string, { status: number; message: string }> = {
    FORBIDDEN: { status: 403, message: "คุณไม่มีสิทธิ์จัดการสื่อของรายการนี้" },
    NOT_FOUND: { status: 404, message: "ไม่พบรายการแข่งขัน" },
    MEDIA_ASSET_NOT_FOUND: { status: 404, message: "ไม่พบไฟล์ที่ต้องการ" },
    MEDIA_FILE_TOO_LARGE: { status: 413, message: "ขนาดไฟล์เกินกว่าที่กำหนด" },
    MEDIA_FILE_TYPE_INVALID: { status: 415, message: "ชนิดไฟล์ไม่ได้รับอนุญาต" },
    STORAGE_UPLOAD_FAILED: { status: 422, message: "ไม่สามารถอัปโหลดไฟล์ได้" },
    STORAGE_REMOVE_FAILED: { status: 422, message: "ไม่สามารถลบไฟล์ได้" },
  }
  const response = responses[code] ?? {
    status: 500,
    message: "เกิดข้อผิดพลาดในการจัดการไฟล์",
  }
  return Response.json({ message: response.message }, { status: response.status })
}
