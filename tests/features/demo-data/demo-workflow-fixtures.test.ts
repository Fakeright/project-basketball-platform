import { describe, expect, it } from "vitest"

import {
  assertDemoEnvironment,
  demoRegistrationScenarios,
  demoSampleTeams,
  demoSeedTimestamp,
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
    expect(
      demoWorkflowTournaments.map(({ slug, format, organizerId }) => ({
        slug,
        format,
        organizerId,
      })),
    ).toEqual([
      { slug: "courtside-draft-cup", format: "THREE_V_THREE", organizerId: "organizer-1" },
      { slug: "courtside-review-cup", format: "FIVE_V_FIVE", organizerId: "organizer-1" },
      { slug: "courtside-registration-cup", format: "FIVE_V_FIVE", organizerId: "organizer-1" },
      { slug: "courtside-bracket-cup", format: "FIVE_V_FIVE", organizerId: "organizer-1" },
      { slug: "courtside-live-cup", format: "FIVE_V_FIVE", organizerId: "organizer-1" },
      { slug: "courtside-championship", format: "FIVE_V_FIVE", organizerId: "organizer-1" },
    ])
    expect(demoWorkflowTournaments.every(({ createdAt }) => createdAt === demoSeedTimestamp)).toBe(true)
  })

  it("defines stable registration rosters and decisions", () => {
    expect(
      demoRegistrationScenarios.map(({ id, status, decisionNote }) => ({
        id,
        status,
        decisionNote,
      })),
    ).toEqual([
      { id: "demo-registration-pending", status: "PENDING", decisionNote: null },
      { id: "demo-registration-approved", status: "APPROVED", decisionNote: "เอกสารทีมครบถ้วน" },
      { id: "demo-registration-rejected", status: "REJECTED", decisionNote: "เอกสารทีมยังไม่ครบ" },
    ])
    expect(
      demoRegistrationScenarios.every(
        ({ team, createdAt }) =>
          team.ownerId === "team-manager-1" &&
          team.format === "FIVE_V_FIVE" &&
          team.players.length >= 5 &&
          team.players.every(({ isActive }) => isActive) &&
          createdAt === demoSeedTimestamp,
      ),
    ).toBe(true)
    expect(demoSampleTeams.flatMap(({ players }) => players).map(({ id }) => id)).toEqual([
      "team-manager-1-team-3x3-player-1",
      "team-manager-1-team-3x3-player-2",
      "team-manager-1-team-3x3-player-3",
      "team-manager-1-team-player-1",
      "team-manager-1-team-player-2",
      "team-manager-1-team-player-3",
      "team-manager-1-team-player-4",
      "team-manager-1-team-player-5",
    ])
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
