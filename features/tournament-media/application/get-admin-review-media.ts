/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจสิทธิ์แอดมินก่อนอ่านสื่อที่ผู้จัดแนบ และเปิดเอกสารผ่าน endpoint ที่ตรวจสิทธิ์ทุกครั้ง
 * เรียกใช้จาก: app/(admin)/admin/reviews/[id]/page.tsx, app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentOperation } from "@/features/tournament-operations/domain/tournament-operation"

import type { ObjectStorage } from "./ports/object-storage"
import type { TournamentMediaRepository } from "./ports/tournament-media-repository"

interface ReviewMediaDependencies {
  media: Pick<TournamentMediaRepository, "listActiveAssets" | "findActiveAsset">
  storage: Pick<ObjectStorage, "getPublicUrl" | "createSignedUrl">
}

export interface AdminReviewMedia {
  posterUrl?: string
  documents: Array<{ id: string; fileName: string; byteSize: number }>
}

export async function getAdminReviewMedia(
  tournament: Pick<TournamentOperation, "id" | "status">,
  actor: Actor,
  dependencies: ReviewMediaDependencies,
): Promise<AdminReviewMedia> {
  assertPlatformAdmin(actor)
  if (tournament.status !== "SUBMITTED") throw new Error("NOT_FOUND")

  const assets = await dependencies.media.listActiveAssets(tournament.id)
  const poster = assets.find((asset) => asset.kind === "POSTER")

  return {
    posterUrl: poster
      ? dependencies.storage.getPublicUrl(poster.bucket, poster.objectPath)
      : undefined,
    documents: assets
      .filter((asset) => asset.kind === "DOCUMENT")
      .map(({ id, fileName, byteSize }) => ({ id, fileName, byteSize })),
  }
}

export async function getAdminReviewDocumentUrl(
  tournamentId: string,
  assetId: string,
  actor: Actor,
  dependencies: ReviewMediaDependencies,
): Promise<string> {
  assertPlatformAdmin(actor)

  const document = await dependencies.media.findActiveAsset(tournamentId, assetId)
  if (
    !document ||
    document.tournamentId !== tournamentId ||
    document.kind !== "DOCUMENT"
  ) {
    throw new Error("NOT_FOUND")
  }

  // ลิงก์บนเว็บคงเดิม แต่ต่ออายุทางเข้าไฟล์เมื่อแอดมินกดทุกครั้ง
  return dependencies.storage.createSignedUrl(
    document.bucket,
    document.objectPath,
    60 * 10,
  )
}

function assertPlatformAdmin(actor: Actor) {
  if (actor.role !== "PLATFORM_ADMIN") throw new Error("FORBIDDEN")
}
