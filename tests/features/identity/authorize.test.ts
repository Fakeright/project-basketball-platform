import { describe, expect, it } from "vitest";

import { authorize } from "@/features/identity/application/authorize";
import type { Actor } from "@/features/identity/domain/actor";
import type { Permission } from "@/features/identity/domain/permission";

const organizer: Actor = {
  id: "org-1",
  role: "TOURNAMENT_ORGANIZER",
};

const admin: Actor = {
  id: "admin-1",
  role: "PLATFORM_ADMIN",
};

const allPermissions: Permission[] = [
  "tournament.create",
  "tournament.read",
  "tournament.update",
  "tournament.submit",
  "tournament.review",
  "tournament.publish",
  "tournament.suspend",
  "tournament.archive",
  "tournament.remove",
  "registration.create",
  "registration.read",
  "registration.decide",
  "team.create",
  "team.update",
  "team.roster.manage",
  "registration.cancel",
  "registration.withdraw",
  "bracket.generate",
  "match.schedule",
  "result.record",
  "result.confirm",
  "audit.read",
  "role.manage",
];

describe("authorize", () => {
  it("allows an organizer to edit an owned tournament", () => {
    expect(() =>
      authorize(organizer, "tournament.update", { organizerId: "org-1" }),
    ).not.toThrow();
  });

  it("rejects an organizer editing another tournament", () => {
    expect(() =>
      authorize(organizer, "tournament.update", { organizerId: "org-2" }),
    ).toThrow("FORBIDDEN");
  });

  it("allows a platform admin to review every tournament", () => {
    expect(() =>
      authorize(admin, "tournament.review", { organizerId: "org-2" }),
    ).not.toThrow();
  });

  it.each(allPermissions)(
    "allows a platform admin to perform %s globally",
    (permission) => {
      expect(() =>
        authorize(admin, permission, { organizerId: "org-2" }),
      ).not.toThrow();
    },
  );

  it.each<Permission>([
    "tournament.create",
    "tournament.read",
    "tournament.update",
    "tournament.submit",
    "registration.decide",
    "bracket.generate",
    "match.schedule",
    "result.record",
  ])("allows an organizer to perform owned %s actions", (permission) => {
    expect(() =>
      authorize(organizer, permission, { organizerId: organizer.id }),
    ).not.toThrow();
  });

  it.each<Actor["role"]>(["TEAM_MANAGER", "COACH", "PLAYER"])(
    "rejects tournament operations for %s",
    (role) => {
      expect(() =>
        authorize(
          { id: `${role.toLowerCase()}-1`, role },
          "tournament.update",
          { organizerId: organizer.id },
        ),
      ).toThrow("FORBIDDEN");
    },
  );

  it("rejects an organizer reviewing an owned tournament", () => {
    expect(() =>
      authorize(organizer, "tournament.review", {
        organizerId: organizer.id,
      }),
    ).toThrow("FORBIDDEN");
  });

  it("rejects an organizer creating a tournament for another organizer", () => {
    expect(() =>
      authorize(organizer, "tournament.create", { organizerId: "org-2" }),
    ).toThrow("FORBIDDEN");
  });
});
