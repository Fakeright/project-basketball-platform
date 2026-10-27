import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

describe("Vercel function region", () => {
  it("uses one Singapore region close to the Supabase database", () => {
    const configPath = resolve(process.cwd(), "vercel.json")
    expect(existsSync(configPath)).toBe(true)
    const config: { regions?: string[] } = JSON.parse(readFileSync(configPath, "utf8"))
    expect(config.regions).toEqual(["sin1"])
  })
})
