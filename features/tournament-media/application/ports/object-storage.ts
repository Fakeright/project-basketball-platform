export type ObjectStorageFailureCode = "NOT_FOUND" | "UNAVAILABLE"

export class ObjectStorageError extends Error {
  readonly name = "ObjectStorageError"

  constructor(readonly code: ObjectStorageFailureCode) {
    super(code)
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
