import type { Actor } from "@/features/identity/domain/actor";
import {
  permissionsByRole,
  type Permission,
} from "@/features/identity/domain/permission";

export interface AuthorizationResource {
  organizerId?: string;
}

export function authorize(
  actor: Actor,
  action: Permission,
  resource: AuthorizationResource = {},
): void {
  if (actor.role === "PLATFORM_ADMIN") {
    return;
  }

  const canPerformAction = permissionsByRole[actor.role].has(action);
  const ownsResource = resource.organizerId === actor.id;

  if (!canPerformAction || !ownsResource) {
    throw new Error("FORBIDDEN");
  }
}
