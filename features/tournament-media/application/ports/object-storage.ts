/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนดสัญญาเก็บ ลบ และเปิดไฟล์ เพื่อให้ use case เปลี่ยนผู้ให้บริการ storage ได้โดยไม่เปลี่ยนกฎงาน
 * เรียกใช้จาก: features/admin/presentation/tournament-media-handler.ts, features/competition/application/get-external-bracket-view.ts
 */

export type ObjectStorageFailureCode = "NOT_FOUND" | "UNAVAILABLE"

export class ObjectStorageError extends Error {
  readonly name = "ObjectStorageError"
  readonly safeHttpStatus: 503 | undefined

  constructor(readonly code: ObjectStorageFailureCode) {
    super(code)
    this.safeHttpStatus = code === "UNAVAILABLE" ? 503 : undefined
  }
}

export interface ObjectStorage {
  upload(input: {
    bucket: string
    objectPath: string
    contentType: string
    data: Uint8Array
  }): Promise<void>
  move(bucket: string, fromPath: string, toPath: string): Promise<void>
  remove(bucket: string, objectPath: string): Promise<void>
  getPublicUrl(bucket: string, objectPath: string): string
  createSignedUrl(
    bucket: string,
    objectPath: string,
    expiresInSeconds: number,
  ): Promise<string>
}
