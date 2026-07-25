import type { Role } from "@/features/identity/domain/actor";

export const permissions = [
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
] as const;

export type Permission = (typeof permissions)[number];

const organizerPermissions = [
  "tournament.create",
  "tournament.read",
  "tournament.update",
  "tournament.submit",
  "registration.decide",
  "registration.withdraw",
  "bracket.generate",
  "match.schedule",
  "result.record",
] as const satisfies readonly Permission[];

export const permissionsByRole: Readonly<Record<Role, ReadonlySet<Permission>>> =
  {
    PLATFORM_ADMIN: new Set(permissions),
    TOURNAMENT_ORGANIZER: new Set(organizerPermissions),
    TEAM_MANAGER: new Set([
      "team.create",
      "team.update",
      "team.roster.manage",
      "registration.create",
      "registration.read",
      "registration.cancel",
    ]),
    COACH: new Set(),
    PLAYER: new Set(),
  };
