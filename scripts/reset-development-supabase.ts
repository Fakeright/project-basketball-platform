import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local" })
config()

const storageBuckets = ["tournament-posters", "tournament-documents"] as const

type ResetConfiguration = {
  supabaseUrl?: string
  serviceRoleKey?: string
}

type StorageObject = {
  id: string | null
  name: string
}

type StorageBucketClient = {
  list: (
    path?: string,
    options?: { limit?: number; offset?: number },
  ) => Promise<{ data: StorageObject[] | null; error: Error | null }>
  remove: (paths: string[]) => Promise<{ error: Error | null }>
}

type ResetSupabaseClient = {
  storage: { from: (bucket: string) => StorageBucketClient }
  auth: {
    admin: {
      listUsers: (options: {
        page: number
        perPage: number
      }) => Promise<{ data: { users: Array<{ id: string }> } | null; error: Error | null }>
      deleteUser: (id: string) => Promise<{ error: Error | null }>
    }
  }
}

export function assertDestructiveResetAllowed(
  environment: string | undefined,
  confirmed: boolean,
  configuration: ResetConfiguration,
) {
  if (
    environment === "production" ||
    !confirmed ||
    !configuration.supabaseUrl ||
    !configuration.serviceRoleKey
  ) {
    throw new Error("DESTRUCTIVE_RESET_NOT_ALLOWED")
  }
}

export async function resetDevelopmentSupabase(
  client: ResetSupabaseClient,
): Promise<{ authUsersDeleted: number; storageObjectsDeleted: number }> {
  let storageObjectsDeleted = 0

  for (const bucket of storageBuckets) {
    const paths = await listStoragePaths(client.storage.from(bucket))
    for (const pathChunk of chunk(paths, 100)) {
      const { error } = await client.storage.from(bucket).remove(pathChunk)
      if (error) throw error
      storageObjectsDeleted += pathChunk.length
    }
  }

  let authUsersDeleted = 0
  while (true) {
    const { data, error } = await client.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })
    if (error) throw error
    const users = data?.users ?? []
    if (users.length === 0) break

    for (const user of users) {
      const { error: deleteError } = await client.auth.admin.deleteUser(user.id)
      if (deleteError) throw deleteError
      authUsersDeleted += 1
    }
  }

  return { authUsersDeleted, storageObjectsDeleted }
}

async function listStoragePaths(
  bucket: StorageBucketClient,
  prefix = "",
): Promise<string[]> {
  const paths: string[] = []
  let offset = 0

  while (true) {
    const { data, error } = await bucket.list(prefix, { limit: 1000, offset })
    if (error) throw error
    const objects = data ?? []

    for (const object of objects) {
      const path = prefix ? `${prefix}/${object.name}` : object.name
      if (object.id === null) {
        paths.push(...(await listStoragePaths(bucket, path)))
      } else {
        paths.push(path)
      }
    }

    if (objects.length < 1000) break
    offset += objects.length
  }

  return paths
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

function runCommand(command: string, arguments_: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, arguments_, { stdio: "inherit" })
    child.once("error", reject)
    child.once("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error("DESTRUCTIVE_RESET_COMMAND_FAILED"))
    })
  })
}

async function main() {
  const configuration = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
  assertDestructiveResetAllowed(
    process.env.NODE_ENV,
    process.env.COURTSIDE_ALLOW_DESTRUCTIVE_RESET === "true",
    configuration,
  )

  const client = createClient(
    configuration.supabaseUrl!,
    configuration.serviceRoleKey!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
  const result = await resetDevelopmentSupabase(client)
  console.info(`Deleted ${result.storageObjectsDeleted} storage objects.`)
  console.info(`Deleted ${result.authUsersDeleted} Auth users.`)

  await runCommand(process.execPath, [
    fileURLToPath(new URL("../node_modules/prisma/build/index.js", import.meta.url)),
    "migrate",
    "reset",
    "--force",
  ])
  await runCommand(process.execPath, [
    fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url)),
    "prisma/seed.ts",
  ])
  console.info("Development database reset and seed completed.")
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "DESTRUCTIVE_RESET_FAILED")
    process.exitCode = 1
  })
}
