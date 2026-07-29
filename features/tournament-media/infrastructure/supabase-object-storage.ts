import "server-only"

import { createClient, StorageApiError } from "@supabase/supabase-js"

import {
  ObjectStorageError,
  type ObjectStorage,
} from "@/features/tournament-media/application/ports/object-storage"

export class SupabaseObjectStorage implements ObjectStorage {
  constructor(
    private readonly client = createClient(
      requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL"),
      requiredEnvironment("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } },
    ),
  ) {}

  async upload(input: {
    bucket: string
    objectPath: string
    contentType: string
    data: Uint8Array
  }): Promise<void> {
    try {
      const { error } = await this.client.storage
        .from(input.bucket)
        .upload(input.objectPath, input.data, {
          contentType: input.contentType,
          upsert: false,
        })
      if (error) throw storageFailure(error)
    } catch (error) {
      throw normalizeStorageFailure(error)
    }
  }

  async remove(bucket: string, objectPath: string): Promise<void> {
    try {
      const { error } = await this.client.storage
        .from(bucket)
        .remove([objectPath])
      if (error) throw storageFailure(error, true)
    } catch (error) {
      throw normalizeStorageFailure(error, true)
    }
  }

  async move(
    bucket: string,
    fromPath: string,
    toPath: string,
  ): Promise<void> {
    try {
      const { error } = await this.client.storage
        .from(bucket)
        .move(fromPath, toPath)
      if (error) throw storageFailure(error, true)
    } catch (error) {
      throw normalizeStorageFailure(error, true)
    }
  }

  getPublicUrl(bucket: string, objectPath: string): string {
    return this.client.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl
  }

  async createSignedUrl(
    bucket: string,
    objectPath: string,
    expiresInSeconds: number,
  ): Promise<string> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .createSignedUrl(objectPath, expiresInSeconds)
      if (error) throw storageFailure(error, true)
      if (!data) throw new ObjectStorageError("UNAVAILABLE")
      return data.signedUrl
    } catch (error) {
      throw normalizeStorageFailure(error, true)
    }
  }
}

function normalizeStorageFailure(error: unknown, allowNotFound = false) {
  return error instanceof ObjectStorageError
    ? error
    : storageFailure(error, allowNotFound)
}

function storageFailure(error: unknown, allowNotFound = false) {
  const status =
    error instanceof StorageApiError
      ? error.status
      : typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof error.status === "number"
        ? error.status
        : undefined
  return new ObjectStorageError(
    allowNotFound && status === 404 ? "NOT_FOUND" : "UNAVAILABLE",
  )
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`MISSING_${name}`)
  return value
}
