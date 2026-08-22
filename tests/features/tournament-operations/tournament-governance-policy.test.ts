import { describe, expect, it } from "vitest"

import {
  assertTournamentGovernanceAllowsOperation,
  getTournamentGovernanceIssues,
  TournamentGovernancePolicyError,
  type TournamentGovernanceContext,
} from "@/features/tournament-operations/domain/tournament-governance-policy"

const now = new Date("2026-08-22T10:00:00.000Z")

const context: TournamentGovernanceContext = {
  tournamentId: "tournament-1",
  title: "COURTSIDE Open",
  organizerId: "organizer-1",
  status: "REGISTRATION_CLOSED",
  governanceStatus: "ACTIVE",
  version: 4,
  startsAt: "2026-11-15T02:00:00.000Z",
  reviewCount: 0,
  registrationCount: 4,
  bracketCount: 0,
  matchCount: 0,
  mediaAssetCount: 0,
  activeBracket: null,
}

describe("tournament governance policy", () => {
  it("allows each governance command in its valid transition state", () => {
    expect(getTournamentGovernanceIssues("SUSPEND", context, now)).toEqual([])
    expect(
      getTournamentGovernanceIssues(
        "RESUME",
        { ...context, governanceStatus: "SUSPENDED" },
        now,
      ),
    ).toEqual([])
    expect(
      getTournamentGovernanceIssues(
        "REMOVE",
        { ...context, governanceStatus: "SUSPENDED" },
        now,
      ),
    ).toEqual([])
    expect(
      getTournamentGovernanceIssues(
        "ARCHIVE",
        { ...context, status: "COMPLETED" },
        now,
      ),
    ).toEqual([])
    expect(getTournamentGovernanceIssues("REOPEN_REGISTRATION", context, now)).toEqual(
      [],
    )
    expect(
      getTournamentGovernanceIssues(
        "PERMANENT_DELETE",
        {
          ...context,
          status: "DRAFT",
          registrationCount: 0,
        },
        now,
        " COURTSIDE Open ",
      ),
    ).toEqual([])
  })

  it.each([
    ["SUSPEND", "SUSPENDED", "GOVERNANCE_STATUS_INVALID"],
    ["RESUME", "ACTIVE", "GOVERNANCE_STATUS_INVALID"],
    ["REMOVE", "REMOVED", "GOVERNANCE_STATUS_INVALID"],
    ["ARCHIVE", "SUSPENDED", "GOVERNANCE_STATUS_INVALID"],
    ["REOPEN_REGISTRATION", "SUSPENDED", "GOVERNANCE_STATUS_INVALID"],
    ["PERMANENT_DELETE", "SUSPENDED", "GOVERNANCE_STATUS_INVALID"],
  ] as const)(
    "reports an invalid governance state for %s",
    (action, governanceStatus, issue) => {
      expect(
        getTournamentGovernanceIssues(action, { ...context, governanceStatus }, now),
      ).toContain(issue)
    },
  )

  it.each(["SUSPEND", "REMOVE"] as const)(
    "excludes archived tournaments from %s",
    (action) => {
      expect(
        getTournamentGovernanceIssues(action, { ...context, status: "ARCHIVED" }, now),
      ).toContain("TOURNAMENT_STATUS_INVALID")
    },
  )

  it("requires completed active tournaments to archive", () => {
    expect(getTournamentGovernanceIssues("ARCHIVE", context, now)).toContain(
      "TOURNAMENT_STATUS_INVALID",
    )
  })

  it("requires registration to be closed before reopening", () => {
    expect(
      getTournamentGovernanceIssues(
        "REOPEN_REGISTRATION",
        { ...context, status: "PUBLISHED" },
        now,
      ),
    ).toContain("TOURNAMENT_STATUS_INVALID")
  })

  it("rejects reopening at or after the tournament start time", () => {
    expect(
      getTournamentGovernanceIssues(
        "REOPEN_REGISTRATION",
        { ...context, startsAt: now.toISOString() },
        now,
      ),
    ).toContain("TOURNAMENT_ALREADY_STARTED")
  })

  it("reports published, locked, and populated active brackets before reopening", () => {
    const issues = getTournamentGovernanceIssues(
      "REOPEN_REGISTRATION",
      {
        ...context,
        activeBracket: {
          status: "PUBLISHED",
          entriesLockedAt: "2026-08-20T09:00:00.000Z",
          matchCount: 1,
        },
      },
      now,
    )

    expect(issues).toEqual(
      expect.arrayContaining([
        "BRACKET_PUBLISHED",
        "BRACKET_ENTRIES_LOCKED",
        "BRACKET_HAS_MATCHES",
      ]),
    )
  })

  it("requires an empty active draft before permanent deletion", () => {
    const issues = getTournamentGovernanceIssues(
      "PERMANENT_DELETE",
      {
        ...context,
        status: "DRAFT",
        reviewCount: 1,
        registrationCount: 1,
        bracketCount: 1,
        matchCount: 1,
        mediaAssetCount: 1,
      },
      now,
      "Different title",
    )

    expect(issues).toEqual(
      expect.arrayContaining([
        "TOURNAMENT_HAS_REVIEWS",
        "TOURNAMENT_HAS_REGISTRATIONS",
        "TOURNAMENT_HAS_BRACKETS",
        "TOURNAMENT_HAS_MATCHES",
        "TOURNAMENT_HAS_MEDIA_ASSETS",
        "CONFIRMATION_TITLE_MISMATCH",
      ]),
    )
  })

  it("requires a draft tournament before permanent deletion", () => {
    expect(getTournamentGovernanceIssues("PERMANENT_DELETE", context, now, "COURTSIDE Open")).toContain(
      "TOURNAMENT_STATUS_INVALID",
    )
  })

  it("requires manual review before resuming a legacy suspended tournament", () => {
    expect(
      getTournamentGovernanceIssues(
        "RESUME",
        { ...context, status: "SUSPENDED", governanceStatus: "SUSPENDED" },
        now,
      ),
    ).toEqual(["LEGACY_SUSPENDED_STATUS_REQUIRES_REVIEW"])
  })

  it("blocks operational mutations when governance is suspended or removed", () => {
    expect(() => assertTournamentGovernanceAllowsOperation("SUSPENDED")).toThrowError(
      expect.objectContaining({ issues: ["TOURNAMENT_SUSPENDED"] }),
    )
    expect(() => assertTournamentGovernanceAllowsOperation("REMOVED")).toThrowError(
      expect.objectContaining({ issues: ["TOURNAMENT_REMOVED"] }),
    )
    expect(() => assertTournamentGovernanceAllowsOperation("ACTIVE")).not.toThrow()
  })

  it("exposes typed governance issues on policy errors", () => {
    try {
      assertTournamentGovernanceAllowsOperation("SUSPENDED")
      throw new Error("EXPECTED_POLICY_ERROR")
    } catch (error) {
      expect(error).toBeInstanceOf(TournamentGovernancePolicyError)
      expect((error as TournamentGovernancePolicyError).issues).toEqual([
        "TOURNAMENT_SUSPENDED",
      ])
    }
  })
})
