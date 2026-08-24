import { describe, expect, it } from "vitest"

import {
  assertDemoEnvironment,
  demoWorkflowTournaments,
} from "@/features/demo-data/infrastructure/demo-workflow-fixtures"

describe("workflow demo fixtures", () => {
  it("defines six stable checkpoints", () => {
    expect(
      demoWorkflowTournaments.map(({ id, title, status }) => ({
        id,
        title,
        status,
      })),
    ).toEqual([
      { id: "tournament-draft", title: "COURTSIDE Draft Cup", status: "DRAFT" },
      { id: "tournament-submitted", title: "COURTSIDE Review Cup", status: "SUBMITTED" },
      { id: "tournament-published", title: "COURTSIDE Registration Cup", status: "PUBLISHED" },
      { id: "tournament-closed", title: "COURTSIDE Bracket Cup", status: "REGISTRATION_CLOSED" },
      { id: "tournament-ongoing", title: "COURTSIDE Live Cup", status: "IN_PROGRESS" },
      { id: "tournament-completed", title: "COURTSIDE Championship", status: "COMPLETED" },
    ])
    expect(new Set(demoWorkflowTournaments.map(({ id }) => id)).size).toBe(6)
    expect(new Set(demoWorkflowTournaments.map(({ slug }) => slug)).size).toBe(6)
  })

  it("rejects an explicitly production environment", () => {
    expect(() => assertDemoEnvironment({ NODE_ENV: "production" })).toThrow(
      "DEMO_SEED_PRODUCTION_BLOCKED",
    )
    expect(() => assertDemoEnvironment({ VERCEL_ENV: "production" })).toThrow(
      "DEMO_SEED_PRODUCTION_BLOCKED",
    )
  })
})
