import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"

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
    const { error } = await this.client.storage
      .from(input.bucket)
      .upload(input.objectPath, input.data, {
        contentType: input.contentType,
        upsert: false,
      })
    if (error) throw new Error("STORAGE_UPLOAD_FAILED")
  }

  async remove(bucket: string, objectPath: string): Promise<void> {
    const { error } = await this.client.storage.from(bucket).remove([objectPath])
    if (error) throw new Error("STORAGE_REMOVE_FAILED")
  }

  getPublicUrl(bucket: string, objectPath: string): string {
    return this.client.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl
  }

  async createSignedUrl(
    bucket: string,
    objectPath: string,
    expiresInSeconds: number,
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(objectPath, expiresInSeconds)
    if (error || !data) throw new Error("STORAGE_SIGNED_URL_FAILED")
    return data.signedUrl
  }
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`MISSING_${name}`)
  return value
}
