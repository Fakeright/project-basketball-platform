import { readFileSync } from "node:fs"

import { expect, it } from "vitest"

it("stores one player identity across team rosters and registration snapshots", () => {
  const schema = readFileSync("prisma/schema.prisma", "utf8")
  expect(schema).toContain("model PlayerIdentity {")
  expect(schema).toContain("playerIdentityId String")
  expect(schema).toContain("model RegistrationPlayer {")
  expect(schema).toContain("@@unique([registrationId, playerIdentityId])")
})

it("stops migration on duplicate active memberships and enforces one active membership per identity", () => {
  const migration = readFileSync(
    "prisma/migrations/20261028090000_shared_player_identity/migration.sql", "utf8",
  )
  expect(migration).toContain("RAISE EXCEPTION 'DUPLICATE_ACTIVE_TEAM_PLAYER_IDENTITY'")
  expect(migration).toMatch(/CREATE UNIQUE INDEX "TeamPlayer_one_active_identity_per_team"[\s\S]*WHERE "isActive" = true/)
})
