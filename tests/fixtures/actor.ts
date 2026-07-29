import type { Actor, Role } from "@/features/identity/domain/actor"

export function createTestActor<const T extends Role>(
  id: string,
  role: T,
): Actor & { role: T } {
  return {
    id,
    role,
    email: `${id}@example.com`,
    displayName: id,
  }
}
