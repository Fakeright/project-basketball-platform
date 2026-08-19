import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"

export function assertExternalBracketAccess(
  context: { organizerId: string; bracketVersion: number } | null,
  actor: Actor,
  expectedVersion: number,
  reason?: string,
) {
  if (
    !context ||
    (actor.role !== "PLATFORM_ADMIN" && context.organizerId !== actor.id)
  ) {
    throw new Error("NOT_FOUND")
  }

  authorize(actor, "bracket.generate", { organizerId: context.organizerId })
  if (context.bracketVersion !== expectedVersion) throw new Error("CONFLICT")

  const adminOverride =
    actor.role === "PLATFORM_ADMIN" && actor.id !== context.organizerId
  const normalizedReason = reason?.trim() || null
  if (adminOverride && !normalizedReason) throw new Error("REASON_REQUIRED")

  return { adminOverride, reason: normalizedReason }
}
